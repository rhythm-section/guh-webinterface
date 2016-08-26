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
    .controller('ModalContainerCtrl', ModalContainerCtrl);

  ModalContainerCtrl.$inject = ['libs', '$log', '$rootScope', '$element', '$controller', '$compile', '$animate'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ModalContainerCtrl
   * @description Presentational component for modal container.
   *
   */
  function ModalContainerCtrl(libs, $log, $rootScope, $element, $controller, $compile, $animate) {
    
    var vm = this;

    vm.modals = null;

    vm.$onInit = onInit;


    function onInit() {}

    function enter(modalElement, modalDialogElement, modal) {
      $animate
        .enter(modalDialogElement, modalElement)
        .then(function() {
          vm.modals[modal.id].isOpen = true;
        });
    }

    function leave(modalElement, modalDialogElement, modal) {
      $animate
        .leave(modalDialogElement)
        .then(function() {
          modal.scope.$destroy();
          delete vm.modals[modal.id];

          // If last modal was closed
          if(libs._.isEmpty(vm.modals)) {
            vm.modals = null;
          }

          $animate.leave(modalElement);
        });
    }

    function moveBackground(modalElement, modalDialogElement) {
      return $animate.addClass(modalDialogElement, 'Modal__wrapper_inactive');
    }

    function moveForeground(modalElement, modalDialogElement) {
      return $animate.removeClass(modalDialogElement, 'Modal__wrapper_inactive');
    }

    function closeModal(modal) {
      var children = $element.children();
      var modalDialogElement = angular.element($element[0].querySelector('.Modal__dialog_' + modal.id)).parent();
      var modalElement = angular.element(modalDialogElement).parent();

      if(children.length > 0) {
        $animate
          .leave(modalDialogElement)
          .then(function() {
            leave(modalElement, modalDialogElement, modal);
          });

        for(var i = 0; i < children.length; i++) {
          var childModalElement = children[i];
          var childModalDialogElement = childModalElement.querySelector('.Modal__wrapper');
        
          moveForeground(childModalElement, childModalDialogElement);
        }
      } else {
        $animate
          .leave(modalDialogElement)
          .then(function() {
            leave(modalElement, modalDialogElement, modal);
          });
      }
    }


    /*
     * Events
     */

    $rootScope.$on('modals.open', function(event, modal) {
      // Currently only 2 Modals allowed to be open at the same time (because modal move animations have to be made dynamically)
      if(vm.modals && Object.keys(vm.modals).length === 2) {
        $log.error('guh.ui.directive:guhMorphModal', 'Maximum open modals reached. Only 2 modals are allowed to be open at the same time.');
        return;
      }

      if(!vm.modals) {
        vm.modals = {};
      }

      vm.modals[modal.id] = modal;

      var additionalClasses = modal.classes ? ' ' + modal.classes : '';
      var children = $element.children();
      var modalCtrl = $controller(modal.controller, { modalInstance: modal, $scope: modal.scope });
      var modalElement = (children.length === 0) ? angular.element('<div class="Modal Modal_background' + additionalClasses + '"></div>') : angular.element('<div class="Modal"></div>');
      var modalDialogContent = modal.template === '' ? '<div>The passed template is empty.</div>' : modal.template;
      var modalDialogElement = angular.element('<div class="Modal__wrapper"></div>').append('<div class="Modal__dialog Modal__dialog_' + modal.id + '">' +
                                                  modalDialogContent + 
                                                '</div>');
      
      $compile(modalDialogElement)(modal.scope);

      if(children.length > 0) {
        $animate
          .enter(modalElement, $element, children[children.length - 1])
          .then(function() {
            for(var i = 0; i < children.length; i++) {
              var childModalElement = children[i];
              var childModalDialogElement = childModalElement.querySelector('.Modal__wrapper');

              moveBackground(childModalElement, childModalDialogElement, children);
            }
            enter(modalElement, modalDialogElement, modal);
          });
      } else {
        $animate
          .enter(modalElement, $element)
          .then(function() {
            enter(modalElement, modalDialogElement, modal);
          });
      }

      if(modal.controllerAs){
        modal.scope[modal.controllerAs] = modalCtrl;
      }
    });

    $rootScope.$on('modals.close', function(event, modal) {
      closeModal(modal);
    });

    $rootScope.$on('modals.closeAll', function(event, modal) {
      angular.forEach(vm.modals, function(modal) {
        closeModal(modal);
      });
    });

  }

}());
