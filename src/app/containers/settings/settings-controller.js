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
    .controller('SettingsCtrl', SettingsCtrl);

  SettingsCtrl.$inject = ['app', '$log', '$element', '$state', 'DSServerInfo', 'DSPlugin', 'NavigationBar', 'ActionBar'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:SettingsCtrl
   * @description Container component for things.
   *
   */
  function SettingsCtrl(app, $log, $element, $state, DSServerInfo, DSPlugin, NavigationBar, ActionBar) {
    
    var vm = this;

    vm.serverInfo = {};

    vm.$onInit = $onInit;

    function $onInit() {
      $element.addClass('Settings');

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {}
          }
        });
      }

      _initNavigation();
      _initActions();

      vm.plugins = DSPlugin.getAll();

      DSServerInfo
        .find(0)
        .then(function(serverInfo) {
          vm.serverInfo = {
            protocolVersion: serverInfo['protocol version'],
            server: serverInfo['server'],
            version: serverInfo['version']
          };
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function _initNavigation() {
      NavigationBar.changeItems([
        {
          position: 1,
          label: 'Things',
          state: 'guh.things'
        },
        {
          position: 2,
          label: 'Rules',
          state: 'guh.rules'
        },
        {
          position: 3,
          label: 'Settings',
          state: 'guh.settings'
        }
      ]);
    }

    function _initActions() {
      ActionBar.changeItems([]);
    }

  }

}());
