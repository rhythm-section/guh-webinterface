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
  "use strict";

  angular
    .module('guh.ui')
    .directive('guhWizardStep', wizardStep);

  wizardStep.$inject = ['$log'];

  function wizardStep($log) {

    var directive = {
      bindToController: {
        title: '@',
        validCallback: '&isValid'
      },
      controller: wizardStepCtrl,
      controllerAs: 'wizardStep',
      link: wizardStepLink,
      require: ['^guhWizardStep', '^^guhWizard'],
      restrict: 'A',
      scope: {}
    };

    return directive;


    function wizardStepCtrl() {}

    function wizardStepLink(scope, element, attributes, ctrls) {
      var wizardStepCtrl = angular.isDefined(ctrls[0]) ? ctrls[0] : null;
      var wizardCtrl = angular.isDefined(ctrls[1]) ? ctrls[1] : null;
      
      if(!wizardStepCtrl) {
        $log.error('guh.ui.directive:guhWizardStep', 'No controller for wizardStep defined.');
        return;
      }

      if(!wizardCtrl) {
        $log.error('guh.ui.directive:guhWizardStep', 'No parent controller (wizard) defined for wizardStep.');
        return;
      }

      // Add proper styles
      element.addClass('wizard__step');

      // Add step to wizard
      wizardCtrl.addStep({
        attributes: attributes,
        ctrl: wizardStepCtrl,
        element: element,
        scope: scope
      });
    }

  }

}());