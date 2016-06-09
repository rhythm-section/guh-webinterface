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

(function(){
  'use strict';

  angular
    .module('guh')
    .controller('AppCtrl', AppCtrl);

  AppCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', '$animate', '$timeout', 'app', 'libs', 'errors', 'websocketService', 'DSSettings', 'ModalContainer', 'UAParser'];

  function AppCtrl($log, $rootScope, $scope, $state, $stateParams, $animate, $timeout, app, libs, errors, websocketService, DSSettings, ModalContainer, UAParser) {

    var vm = this;
    var notificationModal = null;
    var connectionErrorModal = null;

    vm.$state = $state;
    vm.deviceType = new UAParser().getDevice().type;


    // Websocket Connection Error
    $scope.$on('WebsocketConnectionLost', function(event, data) {
      // Only show error when data available (=> not first run)
      if(app.dataLoaded) {
        if(!connectionErrorModal) {
          ModalContainer.add({
            controller: 'ConnectionErrorModalCtrl',
            controllerAs: 'connectionErrorModal',
            classes: 'Modal_error',
            data: null,
            template: '<div>' + 
                        '<div class="Modal__title">Uuups...</div>' + 
                        '<p class="Modal__content">' + data + '</p>' + 
                        '<a class="Button" ui-sref="guh.intro" ng-click="connectionErrorModal.modalInstance.close()">Try to reload the interface</a>' + 
                      '</div>'
          })
          .then(function(modal) {
            connectionErrorModal = modal.open();
          })
          .catch(function(error) {
            $log.log('error', error);
          });
        }

        $timeout(function(){
          websocketService.reconnect();
        }, 2000);
      }
    });

    $scope.$on('WebsocketConnected', function(event, data) {
      if(app.dataLoaded) {
        app.dataLoaded = false;

        if(connectionErrorModal) {
          connectionErrorModal.close();
          connectionErrorModal = null;
        }

        // Reload data (could have changed since connection was lost)
        $state.go('guh.intro');
      }
    });

    $scope.$on('InitialHandshake', function(event, data) {
      delete data.id;
      data.userId = 'serverInfo';

      DSSettings
        .create(data)
        .catch(function(error) {
          $log.error('error', error);
        });
    });

    // Common Notification Handler
    $scope.$on('notification', function(event, data) {
      // var type = data.type ? data.type : null;
      var args = data.args ? data.args : null;
      var error = args.data && args.data.error ? args.data.error : null;
      var errorMessage = angular.isDefined(libs._.findKey(errors, error)) ? errors[libs._.findKey(errors, error)][error] : '';
      var notificationMessage = (errorMessage === '') ? '[' + error + ']' : '[' + error + '] ' + errorMessage;

      // Close previous notification
      if(notificationModal) {
        notificationModal.close();
        notificationModal = null;
      }

      // Show notification
      if(error && notificationMessage) {
        ModalContainer.add({
          controller: 'NotificationModalCtrl',
          controllerAs: 'notificationModal',
          classes: 'Modal_notification',
          data: null,
          template: '<div>' + 
                      '<div class="Modal__title">Uuups...</div>' + 
                      '<button class="close" type="button" ng-click="notificationModal.modalInstance.close()"><svg class="icon"><use xlink:href="./assets/svg/ui/ui.symbol.svg#close"></use></svg></button>' + 
                      '<p class="Modal__content">' + notificationMessage + '</p>' + 
                    '</div>'
        })
        .then(function(modal) {
          notificationModal = modal.open();
        })
        .catch(function(error) {
          $log.log('error', error);
        });
      }
    });

    $scope.$on('ReloadView', function(event, data) {
      if($state.current.name === 'guh.thingDetails') {
        $state.go('guh.things', {}, {
          reload: true,
          inherit: false,
          notify: true
        });
      } else if($state.current.name === 'guh.ruleDetails') {
        $state.go('guh.rules', {}, {
          reload: true,
          inherit: false,
          notify: true
        });
      } else {
        $state.go($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      }
    });

  }

}());
