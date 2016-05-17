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
    .controller('RulesCtrl', RulesCtrl);

  RulesCtrl.$inject = ['app', 'libs', '$log', '$scope', '$state', '$stateParams', 'DSRule', 'ModalContainer'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:RulesCtrl
   * @description Container component for rules.
   *
   */
  function RulesCtrl(app, libs, $log, $scope, $state, $stateParams, DSRule, ModalContainer) {
    
    var vm = this;

    vm.showActionBar = false;
    vm.showList = false;

    vm.$onInit = onInit;
    vm.showFilter = showFilter;
    vm.addRule = addRule;
    vm.showDetails = showDetails;


    function onInit() {
      var ruleId = (libs._.has($stateParams, 'ruleId') && $stateParams.ruleId) ? $stateParams.ruleId : null;

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {
              ruleId: ruleId
            }
          }
        });
      }

      vm.rules = DSRule.getAll();

      // TODO: Animate fading in tile-list
      vm.showActionBar = true;
      vm.showList = true;
    }

    function showFilter() {
      $log.log('showFilter');
    }

    function addRule() {
      $log.log('addRule');
      ModalContainer
        .add({
          controller: 'NewMoodCtrl',
          controllerAs: 'newMood',
          data: null,
          templateUrl: 'app/components/moods/add/new-mood-modal.html'
        })
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.log('error', error);
        });
    }

    function showDetails(tileId) {
      $state.go('guh.rules.current', {
        ruleId: tileId
      });
      // TODO: Animate morphing the tile-item to show thing details
      vm.showActionBar = false;
      vm.showList = false;
    }


    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
      if(toState.name === 'guh.rules') {
        // TODO: Animate morphing the tile-item back to the tile-list
        vm.showActionBar = true;
        vm.showList = true;
      }
    });

  }

}());
