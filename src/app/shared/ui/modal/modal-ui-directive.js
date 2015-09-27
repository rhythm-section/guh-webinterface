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
    .module('guh.ui')
    .directive('guhModal', guhModal);

    guhModal.$inject = ['$log', 'ngDialog'];

    function guhModal($log, ngDialog) {

      var directive = {
        bindToController: {
          label: '@'
        },
        controller: modalCtrl,
        controllerAs: 'modal',
        link: modalLink,
        restrict: 'E',
        scope: true,
        templateUrl: 'app/shared/ui/modal/modal.html',
        transclude: true
      };

      return directive;


      function modalCtrl($scope) {

        /* jshint validthis: true */
        var vm = this;

        /*
         * API
         */
        vm.modal = null;
        vm.template = '';

        vm.open = open;


        function _init() {
          _checkParameters();
        }

        function _checkParameters() {
          // Only defined parameters and parameters without '?' are inside vm
          angular.forEach(vm, function(value, key) {
            if(angular.isDefined(value)) {
              switch(key) {
                case 'label':
                  if(!angular.isString(vm.label)) {
                    $log.error('guh.ui.modalCtrl:controller | The value of parameter label has to be a String.');
                    vm.error = true;
                  }
                  break;
              }
            } else {
              vm.error = true;
              $log.error('guh.ui.modalCtrl:controller | Parameter "' + key + '" has to be set.');
            }
          });
        }


        function open() {
          vm.modal = ngDialog.open({
            className: 'modal',
            overlay: true,
            plain: true,
            scope: $scope,
            showClose: false,
            template: vm.template
          });
        }


        _init();

      }


      function modalLink(scope, element, attrs, modalCtrl, transclude) {
        // Create template string that is transcluded into modal content (necessary because of other scope inside modal => ng-transclude not working)
        transclude(scope, function(clone) {
          var template = angular.element('<div class="modal content"></div>');

          angular.forEach(clone, function(cloneElement) {
            template.append(cloneElement);
          });

          modalCtrl.template = template.html();
        });
      }

    }

}());
