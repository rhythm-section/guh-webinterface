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
    .module('guh.components')
    .controller('AddConnectionCtrl', AddConnectionCtrl);

  AddConnectionCtrl.$inject = ['$log', '$scope', 'websocketService'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:AddConnectionCtrl
   * @description Container component for the intro.
   *
   */
  function AddConnectionCtrl($log, $scope, websocketService) {

    var vm = this;

    vm.host;
    vm.port,
    vm.ssl;
    vm.default;
    vm.newConnection = {};

    // Methods
    vm.setSsl = setSsl;
    vm.setDefault = setDefault;
    vm.tryToConnect = tryToConnect;


    function setSsl(value) {
      vm.ssl = value;
    }

    function setDefault(value) {
      vm.default = value;
    }

    function tryToConnect(isValid) {
      var protocol = vm.ssl ? 'wss' : 'ws';

      if(isValid) {
        vm.newConnection = {
          id: vm.host,
          settingsId: 'general',
          default: vm.default,
          name: vm.host,
          protocol: protocol,
          host: vm.host,
          port: vm.port,
          url: protocol + '://' + vm.host + ':' + vm.port
        };

        vm.onOpenConnection({
          connection: vm.newConnection
        });
      }
    }

  };

}());
