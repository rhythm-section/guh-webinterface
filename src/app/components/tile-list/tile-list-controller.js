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
    .controller('TileListCtrl', TileListCtrl);

  TileListCtrl.$inject = [];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:TileListCtrl
   * @description Presentational component for tiles.
   *
   */
  function TileListCtrl() {
    
    var vm = this;

    vm.tiles = {};
    vm.visibleTile = null;

    vm.$onInit = onInit;
    vm.$postLink = postLink;
    vm.addTile = addTile;
    vm.selectTile = selectTile;


    function onInit() {}

    function postLink() {}

    function addTile(tile) {
      vm.tiles[tile.id] = tile;

      if(vm.initialVisibleId && vm.initialVisibleId === tile.id) {
        selectTile(vm.initialVisibleId);
      }
    }

    function selectTile(tileId) {
      angular.forEach(vm.tiles, function(tile) {
        if(tile.id === tileId) {
          tile.visible = true;
        } else {
          tile.visible = false;
        }
      });
      vm.visibleTile = vm.tiles[tileId];

      vm.onSelectTile({
        tileId: tileId
      });
    }

  }

}());
