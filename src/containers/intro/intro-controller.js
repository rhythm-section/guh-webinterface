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


// Constants & Actions
import * as guhLib from 'guh-libjs';


class IntroController {

  constructor($ngRedux) {
    this.disconnect = $ngRedux.connect(
      this.mapStateToThis,
      {
        ...guhLib.actions.intro
      }
    )(this);

    // Add steps
    this.addStep({
      name: guhLib.constants.appTypes.STEP_CONNECT,
      containerType: 'guh-connection'
    });

    this.addStep({
      name: guhLib.constants.appTypes.STEP_LOAD,
      containerType: 'guh-load'
    });

    // Go to first step
    this.goToStep(guhLib.constants.appTypes.STEP_CONNECT);
  }

  $onDestroy() {
    this.disconnect();
  }

  mapStateToThis(state) {
    const getVisibleStep = (steps, visibleStep) => {
      return steps.get(visibleStep);
    };

    return {
      steps: state.intro.get('steps').toJS(),
      visibleStep: {
        name: state.intro.get('visibleStep'),
        data: getVisibleStep(state.intro.get('steps'), state.intro.get('visibleStep'))
      }
    }
  }
  
}

IntroController.$inject = ['$ngRedux'];

export default IntroController;