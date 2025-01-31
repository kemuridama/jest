/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// This file is a heavily modified fork of Jasmine. Original license:
/*
Copyright (c) 2008-2016 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* eslint-disable sort-keys, local/prefer-rest-params-eventually */

import type {Spy} from '../types';
import CallTracker, {type Context} from './CallTracker';
import SpyStrategy from './SpyStrategy';

interface Fn extends Record<string, unknown> {
  (): unknown;
}

function createSpy(name: string, originalFn: Fn): Spy {
  const spyStrategy = new SpyStrategy({
    name,
    fn: originalFn,
    getSpy() {
      return spy;
    },
  });
  const callTracker = new CallTracker();
  const spy: Spy = function (...args) {
    const callData: Context = {
      object: this,
      args: Array.prototype.slice.apply(arguments),
    };

    callTracker.track(callData);
    const returnValue = spyStrategy.exec.apply(this, args);
    callData.returnValue = returnValue;

    return returnValue;
  };

  for (const prop in originalFn) {
    if (prop === 'and' || prop === 'calls') {
      throw new Error(
        "Jasmine spies would overwrite the 'and' and 'calls' properties " +
          'on the object being spied upon',
      );
    }

    spy[prop] = originalFn[prop];
  }

  spy.and = spyStrategy;
  spy.calls = callTracker;

  return spy;
}

export default createSpy;
