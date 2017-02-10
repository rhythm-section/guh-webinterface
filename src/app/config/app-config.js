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
          moods: 'app/components/moods/',
          ui: 'app/shared/ui/'
        },

        // File extensions
        fileExtensions: {
          html: '.html'
        },

        // Basic types
        basicTypes: {
          uuid: 'Uuid',
          string: 'String',
          int: 'Int',
          unsignedInt: 'Uint',
          double: 'Double',
          bool: 'Bool',
          variant: 'Variant',
          color: 'Color',
          time: 'Time',
          object: 'Object'
        },

        // Input types
        inputTypes: {
          none: 'InputTypeNone',
          textLine: 'InputTypeTextLine',
          textArea: 'InputTypeTextArea',
          password: 'InputTypePassword',
          search: 'InputTypeSearch',
          mail: 'InputTypeMail',
          ipV4Address: 'InputTypeIPv4Address',
          ipV6Address: 'InputTypeIPv6Address',
          url: 'InputTypeUrl',
          macAddress: 'InputTypeMacAddress'
        },

        // Notification types
        notificationTypes: {
          // Devices
          devices: {
            deviceAdded: 'Devices.DeviceAdded',
            deviceRemoved: 'Devices.DeviceRemoved',
            stateChanged: 'Devices.StateChanged',
            paramsChanged: 'Devices.DeviceParamsChanged'
          },

          // Rules
          rules: {
            ruleAdded: 'Rules.RuleAdded',
            ruleRemoved: 'Rules.RuleRemoved',
            ruleActiveChanged: 'Rules.RuleActiveChanged',
            ruleConfigurationChanged: 'Rules.RuleConfigurationChanged'
          },

          // Events
          events: {
            eventTriggered: 'Events.EventTriggered'
          },

          // Log entry
          logging: {
            logEntryAdded: 'Logging.LogEntryAdded',
            logDatabaseUpdated: 'Logging.LogDatabaseUpdated'
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
        },

        // Units
        unit: {
          UnitNone: '',
          UnitSeconds: 'sec',
          UnitMinutes: 'min',
          UnitHours: 'hr',
          UnitUnixTime: 'sec',
          UnitMeterPerSecond: 'm / s',
          UnitKiloMeterPerHour: 'km / h',
          UnitDegree: '°',
          UnitRadiant: 'rad',
          UnitDegreeCelsius: '°C',
          UnitDegreeKelvin: 'K',
          UnitMired: 'mired',
          UnitMilliBar: 'mbar',
          UnitBar: 'bar',
          UnitPascal: 'Pa',
          UnitHectoPascal: 'hPa',
          UnitAtmosphere: 'atm',
          UnitLumen: 'lm',
          UnitLux: 'lx',
          UnitCandela: 'cd',
          UnitMilliMeter: 'mm',
          UnitCentiMeter: 'cm',
          UnitMeter: 'm',
          UnitKiloMeter: 'km',
          UnitGram: 'g',
          UnitKiloGram: 'kg',
          UnitDezibel: 'dB',
          UnitBpm: 'bpm',
          UnitKiloByte: 'kB',
          UnitMegaByte: 'MB',
          UnitGigaByte: 'GB',
          UnitTeraByte: 'TB',
          UnitMilliWatt: 'mW',
          UnitWatt: 'W',
          UnitKiloWatt: 'kW',
          UnitKiloWattHour: 'kWh',
          UnitEuroPerMegaWattHour: '€ / MWh',
          UnitEuroCentPerKiloWattHour: '€-Cent / kWh',
          UnitPercentage: '%',
          UnitPartsPerMillion: 'ppm',
          UnitEuro: '€',
          UnitDollar: '$',
          UnitHerz: 'Hz',
          UnitAmpere: 'A',
          UnitMilliAmpere: 'mA',
          UnitVolt: 'V',
          UnitMilliVolt: 'mV',
          UnitVoltAmpere: 'VA',
          UnitVoltAmpereReactive: 'var',
          UnitAmpereHour: 'Ah'
        },

        basicTag: {
          BasicTagService: 'service',
          BasicTagDevice: 'device',
          BasicTagSensor: 'sensor',
          BasicTagActuator: 'actuator',
          BasicTagLighting: 'lighting',
          BasicTagEnergy: 'energy',
          BasicTagMultimedia: 'multimedia',
          BasicTagWeather: 'weather',
          BasicTagGateway: 'gateway',
          BasicTagHeating: 'heating',
          BasicTagCooling: 'cooling',
          BasicTagNotification: 'notification',
          BasicTagSecurity: 'security',
          BasicTagTime: 'time',
          BasicTagShading: 'shading',
          BasicTagAppliance: 'appliance',
          BasicTagCamera: 'camera',
          BasicTagLock: 'lock'
        }
      };
    })());

}());
