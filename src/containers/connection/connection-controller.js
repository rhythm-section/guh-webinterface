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
import * as uuid from 'node-uuid';

// Actions
import * as guhLib from 'guh-libjs';


class ConnectionController {

  constructor($log, $scope, $ngRedux, $location) {
    console.log('guhLib.actions.websocket', guhLib.actions.websocket);

    const disconnect = $ngRedux.connect(
      this.mapStateToThis,
      {
        ...guhLib.actions.websocket,
        ...guhLib.actions.connection
      }
    )(this);

    // Save default connection (current webinterface url)
    this.addConnection({
      id: uuid.v4(),
      host: $location.host(),
      port: $location.port(),
      ssl: $location.protocol() === 'https' ? true : false,
      isDefault: true
    });
  }

  $onDestroy() {
    this.disconnect();
  }

  mapStateToThis(state) {
    console.log('state', state);

    return {
      availableConnections: state.connection.get('availableConnections').toJS(),
      defaultConnection: state.connection.get('defaultConnection'),
      activeConnection: state.connection.get('activeConnection'),
      // isFetching: state.connection.get('isFetching'),
      websocketStatus: state.websocket.get('status')
    };
  }
  
}

ConnectionController.$inject = ['$log', '$scope', '$ngRedux', '$location'];

export default ConnectionController;