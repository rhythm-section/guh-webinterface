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
    .directive('guhActionBar', guhActionBar);

    guhActionBar.$inject = ['$log', '$filter', '$rootScope', '$state', 'ngDialog'];

    function guhActionBar($log, $filter, $rootScope, $state, ngDialog) {
      var directive = {
        bindToController: {

        },
        controller: actionBarCtrl,
        controllerAs: 'actionBar',
        link: actionBarLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/action-bar/action-bar.html'
      };

      return directive;


      function actionBarCtrl() {
        /* jshint validthis: true */
        var vm = this;

        vm.init = init;
        vm.showAdd = false;
        vm.showEdit = false;
        vm.openAddModal = openAddModal;
        vm.openEditModal = openEditModal;
        vm.closeAddModal = closeAddModal;
        vm.closeEditModal = closeEditModal;
        vm.addModal;
        vm.editModal;
        vm.modal;
        
        var stateCtrlAs = '';
        var stateCtrlAsSingular = '';
        var stateCtrlAsPlural = '';


        function init() {
          stateCtrlAs = $state.current.controllerAs;
          stateCtrlAsSingular = (stateCtrlAs.charAt(stateCtrlAs.length - 1) === 's') ? stateCtrlAs.substring(0, stateCtrlAs.length - 1) : stateCtrlAs;
          stateCtrlAsPlural = stateCtrlAsSingular + 's';

          if(stateCtrlAs.charAt(stateCtrlAs.length - 1) === 's') {
            vm.showAdd = true;
            vm.showEdit = false;
          } else {
            vm.showAdd = false;
            vm.showEdit = true;
          }
        }

        function openAddModal() {
          var addController = 'New' + $filter('capitalize')(stateCtrlAsSingular) + 'Ctrl';
          var addControllerAs = 'new' + $filter('capitalize')(stateCtrlAsSingular);
          var addTemplate = 'new-' + stateCtrlAsSingular + '-modal';

          vm.modal = ngDialog.open({
            // className: 'ngdialog-theme-default',
            className: 'modal',
            controller: addController,
            controllerAs: addControllerAs,
            overlay: true,
            showClose: false,
            template: 'app/components/' + stateCtrlAsPlural + '/add/' + addTemplate + '.html'
          });
        }

        function openEditModal() {
          var editController = 'Edit' + $filter('capitalize')(stateCtrlAsSingular) + 'Ctrl';
          var editControllerAs = 'edit' + $filter('capitalize')(stateCtrlAsSingular);
          var editTemplate = 'edit-' + stateCtrlAsSingular + '-modal';

          vm.modal = ngDialog.open({
            // className: 'ngdialog-theme-default',
            className: 'modal',
            controller: editController,
            controllerAs: editControllerAs,
            overlay: true,
            showClose: false,
            template: 'app/components/' + stateCtrlAsPlural + '/edit/' + editTemplate + '.html'
          });
        }

        function closeAddModal() {
          $log.log('closeAddModal');
        }

        function closeEditModal() {
          $log.log('closeEditModal');
        }
      }


      function actionBarLink(scope, element, attrs, actionBarCtrl) {
        actionBarCtrl.init();

        scope.$on('$stateChangeSuccess', function() {
          actionBarCtrl.init();
        });

        scope.$on('ngDialog.closing', function (e, $dialog) {
          $log.log('ngDialog closing: ' + $dialog.attr('id'));
        });

        scope.$on('ngDialog.closed', function (e, $dialog) {
          $log.log('ngDialog closed: ' + $dialog.attr('id'));
        });
      }
    }

}());