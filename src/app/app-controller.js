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

  AppCtrl.$inject = ['$log', '$rootScope', '$scope', '$animate', '$timeout', '$state', '$stateParams', 'app', 'libs', 'errors', 'websocketService', 'ngDialog'];

  function AppCtrl($log, $rootScope, $scope, $animate, $timeout, $state, $stateParams, app, libs, errors, websocketService, ngDialog) {

    var vm = this;
    var notification = null;
    var notificationTimer = null;
    var connectionErrorModal = null;
    
    vm.$state = $state;
    vm.$stateParams = $stateParams;


    // Websocket Connection Error
    $scope.$on('WebsocketConnectionLost', function(event, data) {
      // Only show error when data available (=> not first run)
      if(app.dataLoaded) {
        if(!connectionErrorModal) {
          connectionErrorModal = ngDialog.open({
            className: 'modal modal_error modal_full',
            overlay: true,
            plain: true,
            showClose: false,
            template: '<div>' + 
                        '<p>' + data + '</p>' + 
                        '<a class="button" ui-sref="guh.intro()" ng-click="closeThisDialog()">Reload the interface</a>' +
                      '</div>'
          });
        }

        $timeout(function(){
          websocketService.reconnect();
        }, 2000);
      }
    });

    $scope.$on('WebsocketConnected', function(event, data) {
      if(connectionErrorModal) {
        connectionErrorModal.close();
        connectionErrorModal = null;
      }
    });

    // Common Notification Handler
    $scope.$on('notification', function(event, data) {
      var type = data.type ? data.type : null;
      var args = data.args ? data.args : null;
      var error = args.data && args.data.error ? args.data.error : null;
      var errorMessage = angular.isDefined(libs._.findKey(errors, error)) ? errors[libs._.findKey(errors, error)][error] : '';
      var notificationMessage = (errorMessage === '') ? '[' + error + ']' : errorMessage + ' [' + error + ']';

      // Close previous notification
      if(notification && angular.isDefined(notification.id)) {
        if(ngDialog.isOpen(notification.id)) {
          ngDialog.close(notification.id);
        }
      }

      // Show notification
      if(notificationMessage) {
        notification = ngDialog.open({
          className: 'notification notification_error',
          closeByDocument: false,
          overlay: false,
          plain: true,
          showClose: false,
          template: '<p>' + notificationMessage + '</p><button class="close" type="button" ng-click="closeThisDialog()"><svg class="icon"><use xlink:href="./assets/svg/ui/ui.symbol.svg#close"></use></svg></button>'
        });
      }
    });

  }

}());
