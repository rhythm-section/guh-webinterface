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


// Vendor
import angular from 'angular';


class DynamicContainerController {

  constructor($log, $scope, $compile, $element, $injector) {
    let newScope = $scope.$new(true, $scope);
    let properties = '';

    // Build properties
    for(let prop in this.props) {
      if(!this.props.hasOwnProperty(prop)) {
        continue;
      }
      properties = properties + ' ' + prop + '="' + this.props[prop] + '"';
    }

    let componentName = this.type.toLowerCase().replace(/-(.)/g, function(match, group1) {
      return group1.toUpperCase();
    });

    // Check if Component (Directive) exists
    if($injector.has(componentName + 'Directive')) {
      let dynamicContainer = '<' + this.type + properties + '></' + this.type + '>';
      let dynamicContainerContent = $compile(dynamicContainer)(newScope);
      let htmlToReplace = $element[0].querySelector('.content');

      angular.element(htmlToReplace).replaceWith(dynamicContainerContent);
    } else {
      $log.error('The Component (Directive) "' + componentName + '" is not defined.');
    }
  }
  
}

DynamicContainerController.$inject = ['$log', '$scope', '$compile', '$element', '$injector'];

export default DynamicContainerController;