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
    .service('ModalContainer', ModalContainer);

  ModalContainer.$inject = ['$log', '$rootScope', '$q', '$templateRequest'];

  function ModalContainer($log, $rootScope, $q, $templateRequest) {

    /*
     * Service globals
     */
    var id = 0;
    var modals = [];


    /*
     * Service API
     */
    var service = {
      add: add
    };

    return service;


    /*
     * Private functions
     */
    
    function getTemplate(template, templateUrl) {
      var deferred = $q.defer();

      if(template) {
        deferred.resolve(template);
      } else if(templateUrl) {
        $templateRequest(templateUrl, true)
          .then(function(template) {
            deferred.resolve(template);
          }, function(error) {
            deferred.reject(error);
          });
      } else {
        deferred.reject('Modal: No template or templateUrl has been specified.');
      }

      return deferred.promise;
    }

    function initialize(scope, animation, classes, data) {
      return {
        id: ++id,
        scope: scope || $rootScope.$new(),
        animation: animation || 'fade-in',
        classes: classes,
        data: data || null,
        open: open,
        close: close,
        closeAll: closeAll
      }
    }

    function open() {
      var modal = {
        animation: this.animation,
        classes: this.classes,
        controller: this.controller,
        controllerAs: this.controllerAs,
        data: this.data,
        id: this.id,
        template: this.template,
        scope: this.scope,
        close: this.close,
        closeAll: this.closeAll
      };
      $rootScope.$emit('modals.open', modal);
      return modal;
    }

    function close(data) {
      $rootScope.$emit('modals.close', this, data);
    }

    function closeAll(data) {
      $rootScope.$emit('modals.closeAll', this, data);
    }


    /*
     * Public methods
     */

    function add(options) {
      var deferred = $q.defer();

      getTemplate(options.template, options.templateUrl)
        .then(function(template) {
          var modal = initialize(options.scope, options.animation, options.classes, options.data);
          
          if(options.controller && options.controllerAs) {
            modal.controller = options.controller;
            modal.controllerAs = options.controllerAs;
          } else {
            deferred.reject('Modal: No controller or controllerAs has been specified.');
          }

          modal.template = template;
          modals.push(modal);

          deferred.resolve(modal);
        })
        .catch(function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

  }

}());