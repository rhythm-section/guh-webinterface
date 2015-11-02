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
    .directive('guhWizard', wizardDirective);

  wizardDirective.$inject = ['$log', '$animate', 'libs', 'wizardService'];

  function wizardDirective($log, $animate, libs, wizardService) {

    var directive = {
      bindToController: {
        handle: '@',
        showNavigation: '='
      },
      controller: wizardCtrl,
      controllerAs: 'wizard',
      link: wizardLink,
      restrict: 'A',
      scope: {},
      templateUrl: 'app/shared/ui/wizard/wizard.html',
      transclude: true
    };

    return directive;


    function wizardCtrl($scope, $element) {

      /* jshint validthis: true */
      var vm = this;
      var currentStep;

      // Public variables
      vm.steps = [];

      // Public methods
      vm.init = init;
      vm.setNavigation = setNavigation;
      vm.addStep = addStep;
      vm.prev = prev;
      vm.next = next;
      vm.hasPrev = hasPrev;
      vm.hasNext = hasNext;
      vm.isActive = isActive;


      function init() {
        currentStep = 0;

        if(vm.steps.length > 0) {
          vm.steps[currentStep].element.addClass('current');
        }

        vm.title = vm.steps[currentStep].scope.wizardStep.title;
      }

      function setNavigation(navigation) {
        vm.navigation = navigation;
      }

      function addStep(step) {
        vm.steps.push(step);
      }

      function hasPrev() {
        return currentStep > 0;
      }

      function hasNext() {
        return currentStep < (vm.steps.length - 1);
      }

      function prev() {
        if(hasPrev()) {
          vm.steps[currentStep].element.removeClass('current');
          vm.steps[currentStep - 1].element.addClass('current');
          // $animate
          //   .removeClass(vm.steps[currentStep].element, 'current');

          // $animate
          //   .addClass(vm.steps[currentStep - 1].element, 'current');

          vm.title = vm.steps[currentStep - 1].scope.wizardStep.title;

          currentStep = currentStep - 1;
        }
      }

      function next() {
        if(hasNext()) {
          vm.steps[currentStep].element.removeClass('current');
          vm.steps[currentStep + 1].element.addClass('current');
          // $animate
          //   .addClass(vm.steps[currentStep].element, 'slide-out-left')
          //   .then(function() {
          //     $log.log('END OF ANIMATION', vm.steps[currentStep].element);
          //     // vm.steps[currentStep].element.removeClass('slide-out-left');
          //     // vm.steps[currentStep].element.addClass('hide');

              vm.title = vm.steps[currentStep + 1].scope.wizardStep.title;

              currentStep = currentStep + 1;
            // });

          // $animate.addClass(vm.steps[currentStep + 1].element, 'slide-in-left');

          
        }
      }

      function isActive(step) {
        return currentStep === libs._.findIndex(vm.steps, step);
      }

    }

    function wizardLink(scope, element, attrs, wizardCtrl) {

      function _init() {
        // Add proper styles
        element.addClass('wizard');

        // Save handle for later retrieval
        wizardService.addHandle(scope);

        // Initialize controller
        wizardCtrl.init();
      }

      // Go to previous step
      scope.$on('wizard.prev', function(event, handle) {
        if(handle === wizardCtrl.handle) {
          wizardService.getByHandle(handle).wizard.prev();
        }
      });

      // Go to next step
      scope.$on('wizard.next', function(event, handle) {
        if(handle === wizardCtrl.handle) {
          wizardService.getByHandle(handle).wizard.next();
        }
      });


      _init();

    }
  }

}());