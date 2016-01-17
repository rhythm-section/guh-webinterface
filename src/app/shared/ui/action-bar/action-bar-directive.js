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

    guhActionBar.$inject = ['$log', '$filter', '$rootScope', '$timeout', '$state', 'ngDialog', 'MorphModal'];

    function guhActionBar($log, $filter, $rootScope, $timeout, $state, ngDialog, MorphModal) {
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
        vm.modal = null;
        
        var stateCtrlAs = '';
        var stateCtrlAsSingular = '';
        var stateCtrlAsPlural = '';


        function init() {
          stateCtrlAs = $state.current.controllerAs;
          stateCtrlAsSingular = (stateCtrlAs.charAt(stateCtrlAs.length - 1) === 's') ? stateCtrlAs.substring(0, stateCtrlAs.length - 1) : stateCtrlAs;
          stateCtrlAsPlural = stateCtrlAsSingular + 's';

          vm.showAdd = true;
          vm.showEdit = true;
        }

        function openAddModal() {
          var addController = 'New' + $filter('capitalize')(stateCtrlAsSingular) + 'Ctrl';
          var addControllerAs = 'new' + $filter('capitalize')(stateCtrlAsSingular);
          var addTemplate = 'new-' + stateCtrlAsSingular + '-modal';

          MorphModal
            .add({
              controller: addController,
              controllerAs: addControllerAs,
              data: null,
              templateUrl: 'app/components/' + stateCtrlAsPlural + '/add/' + addTemplate + '.html'
            })
            .then(function(modal) {
              modal.open();
            })
            .catch(function(error) {
              $log.log('error', error);
            });
        }

        function openEditModal() {
          var editController = 'Edit' + $filter('capitalize')(stateCtrlAsSingular) + 'Ctrl';
          var editControllerAs = 'edit' + $filter('capitalize')(stateCtrlAsSingular);
          var editTemplate = 'edit-' + stateCtrlAsSingular + '-modal';

          MorphModal
            .add({
              controller: editController,
              controllerAs: editControllerAs,
              data: null,
              templateUrl: 'app/components/' + stateCtrlAsPlural + '/edit/' + editTemplate + '.html'
            })
            .then(function(modal) {
              modal.open();
            })
            .catch(function(error) {
              $log.error('error', error);
            });
        }
      }


      function actionBarLink(scope, element, attrs, actionBarCtrl) {
        actionBarCtrl.init();

        scope.$on('$stateChangeSuccess', function() {
          actionBarCtrl.init();
        });

        scope.$on('ngDialog.opened', function (event, $dialog) {
          var remainingDialogs = document.getElementsByClassName('ngdialog');
        });

        // Becaus of bug that ngDialog.closed is not working (see below), this is needed to remove the dialog. The timeout is needed because of the animation
        scope.$on('ngDialog.closing', function (event, $dialog) {
          $timeout(function() {
            var dialog = document.getElementById($dialog.attr('id'));
            if(dialog) {
              dialog.remove();
            }

            var body = angular.element(document).find('body');
            var remainingDialogs = document.getElementsByClassName('ngdialog');

            // If last dialog was removed
            if(remainingDialogs.length === 0) {
              body.removeClass('ngdialog-open');
            }
          }, 400);
        });

        // Bug: https://github.com/likeastore/ngDialog/issues/319
        scope.$on('ngDialog.closed', function (event, $dialog) {
          $log.log('ngDialog closed: ' + $dialog.attr('id'));
        });
      }
    }

}());