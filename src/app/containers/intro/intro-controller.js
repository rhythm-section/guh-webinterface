/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 * Copyright (C) 2015 Lukas Mayerhofer <lukas.mayerhofer@guh.guru>                     *
 *                                                                                     *
 * Permission is hereby granted, free of charge, to any person obtaining a copy        *
 * of this software and associated documentation files (the "Software"), to deal       *
 * in the Software without restriction, including without limitation the rights        *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell           *
 * copies of the Software, and to permit persons to whom the Software is               *
 * furnished to do so, subject to the following conditions:                            *
 *                                                                                     *
 * The above copyright notice and this permission notice shall be included in all      *
 * copies or substantial portions of the Software.                                     *
 *                                                                                     *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR          *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,            *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE         *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER              *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,       *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE       *
 * SOFTWARE.                                                                           *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
(function() {
  'use strict';

  angular
    .module('guh.containers')
    .controller('IntroCtrl', IntroCtrl);

  IntroCtrl.$inject = ['$log', '$window', '$element', '$scope', '$timeout', '$location', '$q', '$animate', '$state', 'libs', 'DSSettings', 'DSConnection', 'DSAuthentication', 'DSServerInfo', 'cloudService', 'websocketService'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:IntroCtrl
   * @description Container component for the intro.
   *
   */
  function IntroCtrl($log, $window, $element, $scope, $timeout, $location, $q, $animate, $state, libs, DSSettings, DSConnection, DSAuthentication, DSServerInfo, cloudService, websocketService) {
    
    var vm = this;
    var settings;
    var logoElem;
    var logoWrapperElem;
    var logoImgElem;
    var logoTextElem;

    vm.view = {
      logoAnimation: false,
      content: {
        login: false,
        connectionList: false,
        loadData: false
      }
    };
    vm.connectionOpenStatus = {
      pending: false,
      success: false,
      failure: false
    };
    vm.connections = [];

    // Methods
    vm.$postLink = $postLink;

    vm.authenticateConnection = authenticateConnection;
    vm.connect = connect;
    vm.createTunnel = createTunnel;
    vm.showThings = showThings;


    function $postLink() {
      _animateLogo('is-visible')
        .then(function() {
          // Show login
          $timeout(_authenticateUser, 400);
        })
        .catch(_handleError);
    }


    function authenticateConnection() {
      var host = 'proxy.guh.io/ws';
      var protocol = 'wss';
      var port = 433;
      var url = protocol + '://' + host;
      var cloudConnection = {
        id: 'proxy',
        host: host,
        name: host + ':' + port,
        protocol: protocol,
        port: port,
        ssl: false,
        url: url
      };

      vm.connect(cloudConnection);
    }

    function connect(connection) {
      vm.connectionOpenStatus.pending = true;
      vm.connectionOpenStatus.success = false;
      vm.connectionOpenStatus.failure = false;

      vm.currentConnection = connection;

      websocketService.reconnect(connection.url);
    }

    function createTunnel(connection) {
      DSConnection
        .createTunnel(connection.id)
        .then(function(tunnel) {
          cloudService.setTunnelId(tunnel.id);
          _loadData();
        })
        .catch(_handleError);
    }

    function addConnection() {
      vm.view.content.connectionList = false;
      vm.view.content.addConnection = true;
      vm.view.content.loadData = false;
      vm.view.content.login = false;
    }


    function _handleError(error) {
      $log.error(error);
    }

    function _animateLogo(animationClass, animationType) {
      logoElem = $element[0].getElementsByClassName('Intro__logo')[0];
      logoWrapperElem = $element[0].getElementsByClassName('Intro__logo-wrapper')[0];
      logoImgElem = angular.element(logoWrapperElem).children()[0];
      logoTextElem = angular.element(logoWrapperElem).children()[1];

      if(animationType === 'remove') {
        return $q.all({
          logo: $animate.removeClass(logoElem, animationClass),
          logoWrapper: $animate.removeClass(logoWrapperElem, animationClass),
          logoImg: $animate.removeClass(logoImgElem, animationClass),
          logoText: $animate.removeClass(logoTextElem, animationClass),
        });
      } else {
        return $q.all({
          logo: $animate.addClass(logoElem, animationClass),
          logoWrapper: $animate.addClass(logoWrapperElem, animationClass),
          logoImg: $animate.addClass(logoImgElem, animationClass),
          logoText: $animate.addClass(logoTextElem, animationClass),
        });  
      }
    }

    function _loadSettings() {
      return DSSettings
        .find('general', {
          with: [ 'connection', 'serverInfo' ]
        })
        .then(function(settings) {
          return settings;
        })
        .catch(function(error) {
          _handleError(error);
          return false;
        });
    }

    function _getConnections(settings) {
      if(angular.isDefined(settings) &&
         angular.isDefined(settings.connections) && 
         settings.connections.length > 0) {
        return settings.connections;
      }

      return [];
    }

    function _filterDefaultConnections(connections) {
      return connections.filter(function(connection) {
        return connection.default;
      });
    }

    function _saveSettings(serverInfo) {
      return $q.all({
        connection: DSConnection.create(vm.currentConnection),
        serverInfo: DSServerInfo.create(serverInfo)
      })
      .then(function(resolvedPromise) {
        if(angular.isDefined(resolvedPromise.connection)) {
          vm.connections.push(resolvedPromise.connection);
        }
        
        return resolvedPromise;
      });
    }

    function _authenticateUser() {
      vm.view.content.connectionList = false;
      vm.view.content.loadData = false;

      _animateLogo('is-small')
        .then(function() {
          vm.view.content.login = true;
        })
        .catch(_handleError);
    }

    function _loadData() {
      vm.view.content.connectionList = false;
      vm.view.content.cloudConnectionList = false;
      vm.view.content.addConnection = false;
      vm.view.content.login = false;

      _animateLogo('is-small', 'remove')
        .then(function() {
          vm.view.content.loadData = true;
        })
        .catch(_handleError);
    }


    function showThings() {
      $state.go('guh.things');
    }


    // $scope.$on('WebsocketConnected', function(event, data) {});

    $scope.$on('WebsocketConnectionError', function(event, data) {
      vm.connectionOpenStatus.pending = false;
      vm.connectionOpenStatus.success = false;
      vm.connectionOpenStatus.failure = true;

      $timeout(function() {
        vm.connectionOpenStatus.pending = false;
        vm.connectionOpenStatus.success = false;
        vm.connectionOpenStatus.failure = false;


        if(!vm.view.content.connectionList &&
           !vm.view.content.addConnection &&
           !vm.view.content.loadData) {
          // Big logo is shown => animate to small logo AND show connectionList
          _animateLogo('is-small')
            .then(function(resolvedPromise) {
              if(vm.view.content.addConnection) {
                vm.view.content.connectionList = false;
                vm.view.content.cloudConnectionList = false;
                vm.view.content.addConnection = true;
                vm.view.content.loadData = false;
                vm.view.content.login = false;
              } else {
                vm.view.content.connectionList = true;
                vm.view.content.cloudConnectionList = false;
                vm.view.content.addConnection = false;
                vm.view.content.loadData = false;
                vm.view.content.login = false;
              }
            })
            .catch(_handleError);
        }
      }, 500);
    });

    // $scope.$on('WebsocketConnectionLost', function(event, data) {});

    $scope.$on('websocket:onmessage', function(event, response) {
      $log.log('websocket:onmessage', response);
    });

    $scope.$on('InitialHandshake', function(event, data) {
      data.settingsId = 'general';

      if(angular.isDefined(data.server) &&
         data.server === 'guh-cloudproxy') {
        var cloudUser = DSAuthentication.get('cloudUser');

        if(cloudUser) {
          var id = $window.uuid.v4();
          var name = 'guh-webinterface:' + $window.navigator.userAgent;
          var token = cloudUser.accessToken;
          var type = 'ConnectionTypeClient';

          DSAuthentication
            .authenticateConnection(id, name, token, type)
            .then(function(connectionData) {
              if(angular.isDefined(connectionData.connectionId)) {
                DSConnection
                  .getConnections()
                  .then(function(connections) {
                    vm.connections = connections.serverConnections;

                    vm.view.content.login = false;
                    vm.view.content.loadData = false;
                    vm.view.content.connectionList = true;
                  })
                  .catch(_handleError);
              } else {
                _handleError('No connectionId present.');
              }
            })
            .catch(_handleError);
        } else {
          _handleError('User is not authenticated.');
        }
      } else {
        if(angular.isDefined(settings)) {
          _saveSettings(data)
            .then(_loadData)
            .catch(_handleError);
        } else {
          DSSettings
            .create({
              id: 'general'
            })
            .then(function(settings) {
              _saveSettings(data)
                .then(_loadData)
                .catch(_handleError);
            })
            .catch(_handleError);
        }
      }
    });

  }

}());
