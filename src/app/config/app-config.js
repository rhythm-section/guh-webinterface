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
    .module('guh.config')
    .constant('app', (function() {
      var protocol = {
        restApi: undefined,
        websocket: undefined
      };
      var host;
      var port = {
        restApi: '3333',
        websocket: '4444'
      };
      var environment = '/* @echo NODE_ENV */';   // Set inside gulp task: "preprocess-app-config"
      var dataLoaded = false;

      return {
        // Environment
        environment: environment,

        // Network
        protocol: protocol,
        host: host,
        port: port,
        dataLoaded: dataLoaded,

        // URLs
        apiUrl: protocol.restApi + '://' + host + ':' + port.restApi + '/api/v1',
        websocketUrl: protocol.websocket + '://' + host + ':' + port.websocket,

        // Paths & Files
        paths: {
          devices: 'app/components/devices/',
          ui: 'app/shared/ui/'
        },


        /*
         * Split up into several files in next versions of guh-libjs
         */

        // Basepaths
        basePaths: {
          devices: 'app/components/devices/',
          services: 'app/components/services/',
          ui: 'app/shared/ui/'
        },

        // File extensions
        fileExtensions: {
          html: '.html'
        },

        // Input types
        inputTypes: {
          InputTypeIPv4Address: '-ipV4',
          InputTypeIPv6Address: '-ipV6',
          InputTypeMacAddress: '-mac',
          InputTypeMail: '-mail',
          InputTypePassword: '-password',
          InputTypeSearch: '-search',
          InputTypeTextLine: '-text',
          InputTypeTextArea: '-textarea',
          InputTypeUrl: '-url'
        },

        // Notification types
        notificationTypes: {
          // Devices
          devices: {
            deviceAdded: 'Devices.DeviceAdded',
            deviceRemoved: 'Devices.DeviceRemoved',
            stateChanged: 'Devices.StateChanged'
          },

          // Rules
          rules: {
            ruleAdded: 'Rules.RuleAdded',
            ruleRemoved: 'Rules.RuleRemoved'
          },

          // Events
          events: {
            eventTriggered: 'Events.EventTriggeres'
          },

          // Log entry
          logging: {
            logEntryAdded: 'Logging.LogEntryAdded'
          }
        },

        // State operators
        stateOperator: {
          StateOperatorAnd: 'StateOperatorAnd',
          StateOperatorOr: 'StateOperatorOr'
        },

        // Value operators
        valueOperator: {
          is: {
            id: 1,
            label: 'is',
            operators: ['ValueOperatorEquals']
          },
          isNot: {
            id: 2,
            label: 'is not',
            operators: ['ValueOperatorNotEquals']
          },
          isGreaterThan: {
            id: 3,
            label: 'is greater than',
            operators: ['ValueOperatorGreater']
          },
          isLessThan: {
            id: 4,
            label: 'is less than',
            operators: ['ValueOperatorLess']
          },
          between: {
            id: 5,
            label: 'is between',
            operators: ['ValueOperatorGreaterOrEqual', 'ValueOperatorLessOrEqual']
          }
        }
      };
    })());

}());
