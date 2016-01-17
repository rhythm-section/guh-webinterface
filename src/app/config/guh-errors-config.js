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
    .constant('errors', {
      'http': {
        '200': 'The request was understood and everything is Ok.',
        '201': 'The resource was created sucessfully.',
        '202': 'The resource was accepted.',
        '204': 'The request has no content but it was expected.',
        '302': 'The resource was found.',
        '400': 'The request was bad formatted. Also if a Param was not understood or the header is not correct.',
        '403': 'The request tries to get access to a forbidden space.',
        '404': 'The requested resource could not be found.',
        '405': 'The request method is not allowed. See "Allowed-Methods" header for the allowed methods.',
        '408': 'The request method timed out. Default timeout = 5s.',
        '409': 'The request resource conflicts with an other.',
        '500': 'There was an internal server error.',
        '501': 'The requestet method call is not implemented.',
        '502': 'The gateway is not correct.',
        '503': 'The service is not available at the moment.',
        '504': 'The gateway timed out.',
        '505': 'The HTTP version is not supported. The only supported version is HTTP/1.1.'
      },
      'device': {
        'DeviceErrorPluginNotFound': 'The requested plugin was not found.',
        'DeviceErrorVendorNotFound': 'The requested vendor was not found.',
        'DeviceErrorDeviceNotFound': 'The requested device was not found.',
        'DeviceErrorDeviceClassNotFound': 'The requested deviceClass was not found.',
        'DeviceErrorActionTypeNotFound': 'The requested actionType was not found.',
        'DeviceErrorStateTypeNotFound': 'The requested stateType was not found.',
        'DeviceErrorEventTypeNotFound': 'The requested eventType was not found.',
        'DeviceErrorDeviceDescriptorNotFound': 'The requested deviceDescriptor was not found.',
        'DeviceErrorMissingParameter': 'There is a missing parameter in the device.',
        'DeviceErrorInvalidParameter': 'There is a invalid parameter in the device.',
        'DeviceErrorSetupFailed': 'The setup of the device has failed.',
        'DeviceErrorDuplicateUuid': 'This UUID is already in use.',
        'DeviceErrorCreationMethodNotSupported': 'This creation method is not supported.',
        'DeviceErrorSetupMethodNotSupported': 'This setup method is not supported.',
        'DeviceErrorHardwareNotAvailable': 'The hardware is not available.',
        'DeviceErrorHardwareFailure': 'There was a unknown hardware failure.',
        'DeviceErrorAuthentificationFailure': 'There was a authentication failure. Please try again later.',
        'DeviceErrorAsync': 'There was an asynchronous error.',
        'DeviceErrorDeviceInUse': 'The device is currently in use.',
        'DeviceErrorDeviceInRule': 'This device is used inside a rule. Please edit or remove the rule first.',
        'DeviceErrorDeviceIsChild': 'This device is a child of another device and cannot be removed. Please remove the parent device.',
        'DeviceErrorPairingTransactionIdNotFound': 'The pairing transaction ID cannot be found.',
        'DeviceErrorParameterNotWritable': 'This parameter is not writeable.'
      },
      'rule': {
        'RuleErrorInvalidRuleId': 'The requested ruleId is invalid.',
        'RuleErrorRuleNotFound': 'The requested rule was not found.',
        'RuleErrorDeviceNotFound': 'The requested device was not found.',
        'RuleErrorEventTypeNotFound': 'The requested eventType was not found.',
        'RuleErrorActionTypeNotFound': 'The requested actionType was not found.',
        'RuleErrorInvalidParameter': 'The passed parameter is invalid.',
        'RuleErrorInvalidRuleFormat': 'The format of the passed rule is invalid.',
        'RuleErrorMissingParameter': 'The passed rule is missing a parameter.',
        'RuleErrorInvalidRuleActionParameter': 'The passend ruleActionParam is invalid.',
        'RuleErrorTypesNotMatching': 'The eventType and actionType does not match.',
        'RuleErrorNotExecutable': 'This rule is not executable.',
        'RuleErrorContainsEventBasesAction': 'The rule contains eventBasesAction.',
        'RuleErrorNoExitActions': 'This rule doesn\'t has any exitActions.'
      },
      'logging': {
        'LoggingErrorLogEntryNotFound': 'The log entry was not found.',
        'LoggingErrorInvalidFilterParameter': 'The passed filter parameter is invalid.'
      }
    });

}());