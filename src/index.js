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
import 'es5-shim';
import 'es6-shim';

// Angular
import angular from 'angular';

// Guh lib
import * as guhLib from 'guh-libjs';

// Container Components
import appComponent from './containers/app/app-component';
import introComponent from './containers/intro/intro-component';
import connectionComponent from './containers/connection/connection-component';
import loadComponent from './containers/load/load-component';

// Presentationsl Components
import dynamicContainerComponent from './components/dynamic-container/dynamic-container-component';


const containers = angular
  .module('app.containers', [])
  .component('guhApp', appComponent)
  .component('guhIntro', introComponent)
  .component('guhConnection', connectionComponent)
  .component('guhLoad', loadComponent)
  .name;

const components = angular
  .module('app.components', [])
  .component('guhDynamicContainer', dynamicContainerComponent)
  .component('guhConnect', guhLib.components.connect)
  .name;

const services = angular
  .module('app.services', [])
  .service('LoadActions', guhLib.actions.load)
  .name;

angular
  .module('app', [
    guhLib.default,
    containers,
    components,
    services
  ]);