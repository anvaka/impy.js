(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        return factory((root.impyjs = {}));
    }
}(this, function (exports) {
var sourcemap = {};

// import /Users/anvaka/Documents/projects/impyjs/libs/sourcemap.js
(function sourcemap_js(sourcemap) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



/**
 * Define a module along with a payload.
 * @param {string} moduleName Name for the payload
 * @param {ignored} deps Ignored. For compatibility with CommonJS AMD Spec
 * @param {function} payload Function with (require, exports, module) params
 */
function define(moduleName, deps, payload) {
  if (typeof moduleName != "string") {
    throw new TypeError('Expected string, got: ' + moduleName);
  }

  if (arguments.length == 2) {
    payload = deps;
  }

  if (moduleName in define.modules) {
    throw new Error("Module already defined: " + moduleName);
  }
  define.modules[moduleName] = payload;
};

/**
 * The global store of un-instantiated modules
 */
define.modules = {};


/**
 * We invoke require() in the context of a Domain so we can have multiple
 * sets of modules running separate from each other.
 * This contrasts with JSMs which are singletons, Domains allows us to
 * optionally load a CommonJS module twice with separate data each time.
 * Perhaps you want 2 command lines with a different set of commands in each,
 * for example.
 */
function Domain() {
  this.modules = {};
  this._currentModule = null;
}

(function () {

  /**
   * Lookup module names and resolve them by calling the definition function if
   * needed.
   * There are 2 ways to call this, either with an array of dependencies and a
   * callback to call when the dependencies are found (which can happen
   * asynchronously in an in-page context) or with a single string an no callback
   * where the dependency is resolved synchronously and returned.
   * The API is designed to be compatible with the CommonJS AMD spec and
   * RequireJS.
   * @param {string[]|string} deps A name, or names for the payload
   * @param {function|undefined} callback Function to call when the dependencies
   * are resolved
   * @return {undefined|object} The module required or undefined for
   * array/callback method
   */
  Domain.prototype.require = function(deps, callback) {
    if (Array.isArray(deps)) {
      var params = deps.map(function(dep) {
        return this.lookup(dep);
      }, this);
      if (callback) {
        callback.apply(null, params);
      }
      return undefined;
    }
    else {
      return this.lookup(deps);
    }
  };

  function normalize(path) {
    var bits = path.split('/');
    var i = 1;
    while (i < bits.length) {
      if (bits[i] === '..') {
        bits.splice(i-1, 1);
      } else if (bits[i] === '.') {
        bits.splice(i, 1);
      } else {
        i++;
      }
    }
    return bits.join('/');
  }

  function join(a, b) {
    a = a.trim();
    b = b.trim();
    if (/^\//.test(b)) {
      return b;
    } else {
      return a.replace(/\/*$/, '/') + b;
    }
  }

  function dirname(path) {
    var bits = path.split('/');
    bits.pop();
    return bits.join('/');
  }

  /**
   * Lookup module names and resolve them by calling the definition function if
   * needed.
   * @param {string} moduleName A name for the payload to lookup
   * @return {object} The module specified by aModuleName or null if not found.
   */
  Domain.prototype.lookup = function(moduleName) {
    if (/^\./.test(moduleName)) {
      moduleName = normalize(join(dirname(this._currentModule), moduleName));
    }

    if (moduleName in this.modules) {
      var module = this.modules[moduleName];
      return module;
    }

    if (!(moduleName in define.modules)) {
      throw new Error("Module not defined: " + moduleName);
    }

    var module = define.modules[moduleName];

    if (typeof module == "function") {
      var exports = {};
      var previousModule = this._currentModule;
      this._currentModule = moduleName;
      module(this.require.bind(this), exports, { id: moduleName, uri: "" });
      this._currentModule = previousModule;
      module = exports;
    }

    // cache the resulting module object for next time
    this.modules[moduleName] = module;

    return module;
  };

}());

define.Domain = Domain;
define.globalDomain = new Domain();
var require = define.globalDomain.require.bind(define.globalDomain);
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/source-map-generator', ['require', 'exports', 'module' ,  'source-map/base64-vlq', 'source-map/util', 'source-map/array-set'], function(require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. To create a new one, you must pass an object
   * with the following properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: An optional root for all URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    this._file = util.getArg(aArgs, 'file');
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = [];
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      this._validateMapping(generated, original, source, name);

      if (source && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.push({
        generated: generated,
        original: original,
        source: source,
        name: name
      });
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping.');
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      // The mappings must be guarenteed to be in sorted order before we start
      // serializing them or else the generated line numbers (which are defined
      // via the ';' separators) will be all messed up. Note: it might be more
      // performant to maintain the sorting as we insert them, rather than as we
      // serialize them, but the big O is the same either way.
      this._mappings.sort(function (mappingA, mappingB) {
        var cmp = mappingA.generated.line - mappingB.generated.line;
        return cmp === 0
          ? mappingA.generated.column - mappingB.generated.column
          : cmp;
      });

      for (var i = 0, len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];

        if (mapping.generated.line !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generated.line !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generated.column
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generated.column;

        if (mapping.source && mapping.original) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.original.line - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.original.line - 1;

          result += base64VLQ.encode(mapping.original.column
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.original.column;

          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        file: this._file,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._sourceRoot) {
        map.sourceRoot = this._sourceRoot;
      }
      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define('source-map/base64-vlq', ['require', 'exports', 'module' ,  'source-map/base64'], function(require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string.
   */
  exports.decode = function base64VLQ_decode(aStr) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    return {
      value: fromVLQSigned(result),
      rest: aStr.slice(i)
    };
  };

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/base64', ['require', 'exports', 'module' , ], function(require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/util', ['require', 'exports', 'module' , ], function(require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  function join(aRoot, aPath) {
    return aPath.charAt(0) === '/'
      ? aPath
      : aRoot.replace(/\/*$/, '') + '/' + aPath;
  }
  exports.join = join;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/array-set', ['require', 'exports', 'module' , ], function(require, exports, module) {

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i]);
    }
    return set;
  };

  /**
   * Because behavior goes wacky when you set `__proto__` on `this._set`, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  ArraySet.prototype._toSetString = function ArraySet__toSetString (aStr) {
    return "$" + aStr;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr) {
    if (this.has(aStr)) {
      // Already a member; nothing to do.
      return;
    }
    var idx = this._array.length;
    this._array.push(aStr);
    this._set[this._toSetString(aStr)] = idx;
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                this._toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[this._toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/source-map-consumer', ['require', 'exports', 'module' ,  'source-map/util', 'source-map/binary-search', 'source-map/array-set', 'source-map/base64-vlq'], function(require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    var names = util.getArg(sourceMap, 'names');
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file');

    if (version !== this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    this._names = ArraySet.fromArray(names);
    this._sources = ArraySet.fromArray(sources);
    this._sourceRoot = sourceRoot;
    this.file = file;

    // `this._generatedMappings` and `this._originalMappings` hold the parsed
    // mapping coordinates from the source map's "mappings" attribute. Each
    // object in the array is of the form
    //
    //     {
    //       generatedLine: The line number in the generated code,
    //       generatedColumn: The column number in the generated code,
    //       source: The path to the original source file that generated this
    //               chunk of code,
    //       originalLine: The line number in the original source that
    //                     corresponds to this chunk of generated code,
    //       originalColumn: The column number in the original source that
    //                       corresponds to this chunk of generated code,
    //       name: The name of the original symbol which generated this chunk of
    //             code.
    //     }
    //
    // All properties except for `generatedLine` and `generatedColumn` can be
    // `null`.
    //
    // `this._generatedMappings` is ordered by the generated positions.
    //
    // `this._originalMappings` is ordered by the original positions.
    this._generatedMappings = [];
    this._originalMappings = [];
    this._parseMappings(mappings, sourceRoot);
  }

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this._sourceRoot ? util.join(this._sourceRoot, s) : s;
      }, this);
    }
  });

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (an ordered list in this._generatedMappings).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            // Original source.
            temp = base64VLQ.decode(str);
            if (aSourceRoot) {
              mapping.source = util.join(aSourceRoot, this._sources.at(previousSource + temp.value));
            }
            else {
              mapping.source = this._sources.at(previousSource + temp.value);
            }
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              // Original name.
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this._generatedMappings.push(mapping);
          this._originalMappings.push(mapping);
        }
      }

      this._originalMappings.sort(this._compareOriginalPositions);
    };

  /**
   * Comparator between two mappings where the original positions are compared.
   */
  SourceMapConsumer.prototype._compareOriginalPositions =
    function SourceMapConsumer_compareOriginalPositions(mappingA, mappingB) {
      if (mappingA.source > mappingB.source) {
        return 1;
      }
      else if (mappingA.source < mappingB.source) {
        return -1;
      }
      else {
        var cmp = mappingA.originalLine - mappingB.originalLine;
        return cmp === 0
          ? mappingA.originalColumn - mappingB.originalColumn
          : cmp;
      }
    };

  /**
   * Comparator between two mappings where the generated positions are compared.
   */
  SourceMapConsumer.prototype._compareGeneratedPositions =
    function SourceMapConsumer_compareGeneratedPositions(mappingA, mappingB) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      return cmp === 0
        ? mappingA.generatedColumn - mappingB.generatedColumn
        : cmp;
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var mapping = this._findMapping(needle,
                                      this._generatedMappings,
                                      "generatedLine",
                                      "generatedColumn",
                                      this._compareGeneratedPositions)

      if (mapping) {
        return {
          source: util.getArg(mapping, 'source', null),
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      var mapping = this._findMapping(needle,
                                      this._originalMappings,
                                      "originalLine",
                                      "originalColumn",
                                      this._compareOriginalPositions)

      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }

      return {
        line: null,
        column: null
      };
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping. This function should
   *        not mutate the mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      mappings.forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/binary-search', ['require', 'exports', 'module' , ], function(require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the next
    //      closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return null.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid]);
    if (cmp === 0) {
      // Found the element we are looking for.
      return aHaystack[mid];
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return aHaystack[mid];
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0
        ? null
        : aHaystack[aLow];
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the next lowest value checked if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    return aHaystack.length > 0
      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
      : null;
  };

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('source-map/source-node', ['require', 'exports', 'module' ,  'source-map/source-map-generator'], function(require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks) {
    this.children = [];
    this.line = aLine;
    this.column = aColumn;
    this.source = aSource;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    this.children.forEach(function (chunk) {
      if (chunk instanceof SourceNode) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source, line: this.line, column: this.column });
        }
      }
    }, this);
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild instanceof SourceNode) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source != null
          && original.line != null
          && original.column != null) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
      }
      chunk.split('').forEach(function (ch) {
        if (ch === '\n') {
          generated.line++;
          generated.column = 0;
        } else {
          generated.column++;
        }
      });
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
///////////////////////////////////////////////////////////////////////////////


var SourceMapGenerator = require('source-map/source-map-generator').SourceMapGenerator;
sourcemap.SourceMapGenerator = SourceMapGenerator; // export SourceMapGenerator
}(sourcemap));
var impyjs = {};

// import /Users/anvaka/Documents/projects/impyjs/src/version.js
(function version_js(impyjs) {

var version = '0.0.1.1';

impyjs.version = version; // export version
}(impyjs));
var utils = {};

// import /Users/anvaka/Documents/projects/impyjs/src/utils/printer.js
(function printer_js(utils) {

if (typeof window === 'undefined') {
    var btoa = function (str) {
        return new Buffer(str, 'binary').toString('base64');
    };
} else {
    var btoa = window.btoa;
}
function printCode(env) {
    var code = env.codeGenerator.getCode();
    if (env.printSourceMap || !env.onlyPrint) {
        // always print the source map when running app
        // otherwise it's configurable by client
        code += ['',
            '//@ sourceURL=' + env.codeGenerator.getFileName(),
            '//@ sourceMappingURL=data:text/javascript;base64,' + btoa(env.codeGenerator.getSourceMap())
            ].join('\n');
    }
    if (env.onlyPrint) {
        console.log(code);
    } else {
        /*jslint evil: true */
        try {
            return (function codeRunner() { (0, eval)(code); }());
        } catch(e) {
            // todo: should resolve to original source code
            var errorName = ('name' in e ? e.name : 'Error'),
                debugMessage = errorName + ' occured';
            if ('lineNumber' in e) {
                debugMessage += ':' + e.lineNumber;
            }
            if ('message' in e) {
                debugMessage += ': ' + e.message;
            }
            console.error(debugMessage);
            throw e;
        }        
    }
}


utils.printCode = printCode; // export printCode
}(utils));
var browser = {};

// import /Users/anvaka/Documents/projects/impyjs/src/browser/path.js
(function path_js(browser) {
/*jslint regexp: true sloppy: true white: true plusplus: true*/


var re_porotocol_domain_path_args = /(.*?\/\/[^\/]+)?(\/?[^#?]*)?([#?].+)?/,
    split = function (address) {
        var match = address.match(re_porotocol_domain_path_args);
        if (match) {
            return {
                domain: match[1] || '',
                path: match[2] || '',
                args: match[3] || ''
            };
        }
        return {
            domain: '',
            path: '',
            args: ''
        };
    };

var path = {
    /**
     * Based on a given web resource address returns a 'directory' name
     * where resource is located.
     */
    dirname : function (path) {
        if (!path) {
            return '';
        }
        var parts = split(path),
            lastSlash;
        path = parts.path;
        lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
            path = path.substr(0, lastSlash);
        }
        if (lastSlash === 0) {
            path = '';
        }
        return parts.domain + path + '/';
    },
    /**
     * Resolves to to an absolute path with a from as a current dir.
     */
    resolve : function (from, to) {
        if (!to) {
            return from;
        }
        if (to.indexOf('//') !== -1) {
            return to; // assume it's a uri.
        }

        var parts = to.split('/'),
            base = split(from),
            basePathRaw = base.path.split('/'),
            basePath = [],
            i, n, part;
        for (i = 0, n = basePathRaw.length; i < n; ++i) {
            if (basePathRaw[i]) {
                basePath.push(basePathRaw[i]);
            }
        }
        if (to[0] === '/') {
            return this.root + to;
        }
        for(i = 0, n = parts.length; i < n; ++i) {
            part = parts[i];
            if (part === '..') {
                if (basePath.length > 0) {
                    basePath.pop();
                } else {
                    throw 'Error while resolving ' + from + '+' + to + ': Relative path is out of the site root folder';
                }
            } else if (part !== '.') {
                basePath.push(part);
            }
        }
        
        return base.domain + '/' + basePath.join('/');
    },

    /**
     * Returns the last portion of a path.
     */
    basename: function (address) {
        var path = split(address).path;
        return path.substr(path.lastIndexOf('/') + 1);
    },

    root : ''
};


browser.path = path; // export path
}(browser));
// import /Users/anvaka/Documents/projects/impyjs/src/utils/codeGen.js
(function codeGen_js(utils) {
/*global sourcemap */


function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}


function CodeGenerator(env) {
    this.env = env;
    this.code = [];
    this.generatedOffset = 1;
    this.fileName = 'bundle.js';
    this.sourceMap = new sourcemap.SourceMapGenerator({file: this.fileName, sourceRoot: ''});
    this.addServiceCode([
        "(function (root, factory) {",
        "    'use strict';",
        "",
        "    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,",
        "    // Rhino, and plain browser loading.",
        "    if (typeof define === 'function' && define.amd) {",
        "        define(['exports'], factory);",
        "    } else if (typeof exports !== 'undefined') {",
        "        factory(exports);",
        "    } else {",
        "        return factory({});",
        "    }",
        "}(this, function (exports) {"]);

    this.registeredNamespaces = {};
}

CodeGenerator.prototype.setPackageName = function (packageName) {
    if (packageName) {
        // <ugly>replace in UMD header the package name export for the browser 
        // environments </ugly>
        this.code[10] = '        return factory((root.' + packageName + ' = {}));';
        this.fileName = packageName + '.js';
        this.sourceMap._fileName = this.fileName;
    }
};

CodeGenerator.prototype.getFileName = function () {
    return this.fileName;
};
CodeGenerator.prototype.getCode = function () {
    var exposedNamespaces = '';
    if (this.env.exposeNamespace) {
        exposedNamespaces = 'return ' + this.getExposedNamespaces() + ';';
    }
    return this.code.join('\n') + exposedNamespaces + '}));'; // end of UMD
};

CodeGenerator.prototype.getSourceMap = function () {
    return this.sourceMap.toString();
};

CodeGenerator.prototype.getExposedNamespaces = function () {
    var namespaces = [],
        key;
    for (key in this.registeredNamespaces) {
        if (this.registeredNamespaces.hasOwnProperty(key)) {
            // todo: dots?
            namespaces.push(key + ': ' + key);
        }
    }
    if (namespaces.length) {
        return '{' + namespaces.join(',') + '};';
    }
    return '';
};

CodeGenerator.prototype.addFile = function generateCode(moduleDef, fileName) {
    var env = this.env,
        exports = moduleDef.exports,
        expressionName = '',
        i,
        namespace = moduleDef.getNamespace();

    if (!this.isNamespaceRegistered(namespace)) {
        this.registerNamespace(namespace);
        // should go in module global scope. TODO: Dots should be resolved.
        this.addServiceCode('var ' + namespace + ' = {};');
        this.addServiceCode('');
    }
    if (env.debugerName) {
        expressionName = env.path.basename(fileName).replace(/[\/\\\.]/, '_');
    }

    this.addServiceCode('// import ' + fileName);
    this.addServiceCode('(function ' + expressionName + '(' + namespace + ') {');
    this.addClientCode(moduleDef.code, fileName);

    for (i = 0; i < exports.length; ++i) {
        var exportName = exports[i].exportDeclaration;
        if (namespace) {
            this.addServiceCode(namespace + '.' + exportName + ' = ' +
                      exportName + '; // export ' + exportName);
        } else {
            throw 'Module global exports are not implemented';
        }
    }

    this.addServiceCode('}(' + namespace + '));');
};

CodeGenerator.prototype.addServiceCode = function (code) {
    if (isArray(code)) {
        for (var i = 0; i < code.length; ++i) {
            this.code.push(code[i]);
        }
        this.generatedOffset += code.length;
    } else {
        this.code.push(code);
        this.generatedOffset += 1;
    }
};

CodeGenerator.prototype.addClientCode = function (code, fileName) {
    var lines = code.split('\n');
    fileName = fileName.replace('/Users/anvaka/Documents/projects/impyjs', '');
    for (var i = 0; i < lines.length; ++i) {
        this.sourceMap.addMapping({
            generated: { line: this.generatedOffset, column: 0},
            original: { line: i + 1, column: 0},
            source: fileName
        });
        this.generatedOffset += 1;
        this.code.push(lines[i])
    }
};

CodeGenerator.prototype.isNamespaceRegistered = function (namespace) {
    if (namespace) {
        return this.registeredNamespaces.hasOwnProperty(namespace);
    }
    return true;
};

CodeGenerator.prototype.registerNamespace = function (namespace) {
    this.registeredNamespaces[namespace] = true;
};

utils.CodeGenerator = CodeGenerator; // export CodeGenerator
}(utils));
var model = {};

// import /Users/anvaka/Documents/projects/impyjs/src/model/importDef.js
(function importDef_js(model) {


/* Represents an import statment */
function ImportDef(importDeclaration) {
    this.importDeclaration = importDeclaration;

    var assignedLoader,
        rePath = /['"](.+)['"]/,
        pathMatch = importDeclaration.match(rePath),
        resourceLocation;

    if (pathMatch) {
        this.importPath = pathMatch[1];
    } else {
        throw 'Could not parse module declaration: ' + importDeclaration;
    }

    this.assignLoader = function (loader) {
        assignedLoader = loader;
    };
    this.getLoader = function () {
        return assignedLoader;
    };
}


model.ImportDef = ImportDef; // export ImportDef
}(model));
// import /Users/anvaka/Documents/projects/impyjs/src/model/exportDef.js
(function exportDef_js(model) {


function ExportDef(exportDeclaration) {
    // todo: validate
    this.exportDeclaration = exportDeclaration;
}


model.ExportDef = ExportDef; // export ExportDef
}(model));
// import /Users/anvaka/Documents/projects/impyjs/src/model/moduleDef.js
(function moduleDef_js(model) {





function ModuleDef() {
    this.code = '';
    this.imports = [];
    this.exports = [];

    var self = this;
    this.resolveImports = function (callback) {
        var imports = self.imports,
            importsToResolve = imports.length,
            loader, i,
            loaderReady = function () {
                importsToResolve -= 1;
                if (importsToResolve === 0) {
                    callback();
                }
            };
        for (i = 0; i < imports.length; ++i) {
            loader = imports[i].getLoader();
            loader.load(loaderReady);
        }
        if (imports.length === 0) {
            callback(); // nothing to load here.
        }
    };
    this.addImportDef = function (importDef) {
        // TODO: Duplicates?
        this.imports.push(new model.ImportDef(importDef));
    };
    this.addExportDef = function (exportDef) {
        // TODO: Duplicates?
        this.exports.push(new model.ExportDef(exportDef));
    };
    this.setNamespace = function (namespaceDecl) {
        // todo: validate, throw error if already defined, reserved words.
        this.namepsace = namespaceDecl;
    };
    this.getNamespace = function () {
        return this.namepsace || ''; // TODO: global?
    };
    this.hasModuleGlobalExports = function () {
        return this.exports.length && !this.namepsace;
    };
    this.setPackage = function(packageDecl) {
        this.packageName = packageDecl.replace(/\s/g, '');
    };
}


model.ModuleDef = ModuleDef; // export ModuleDef
}(model));
// import /Users/anvaka/Documents/projects/impyjs/src/utils/parser.js
(function parser_js(utils) {




function parseModule(jsFile) {
    var moduleDef = new model.ModuleDef(),
        declarationType,
        importDefinition,
        re = /\/\*\s*(import|public export|export|namespace|package)\s+(.+?);?\s*?\*\//g;

    //while(match = re.exec(jsFile)) {
    moduleDef.code = jsFile.replace(re, function (match, declarationType, declaration, pos) {
        if (declarationType === 'import') {
            moduleDef.addImportDef(declaration);
        } else if (declarationType === 'export') {
            moduleDef.addExportDef(declaration);
        } else if (declarationType === 'namespace') {
            moduleDef.setNamespace(declaration);
        } else if (declarationType === 'package') {
            moduleDef.setPackage(declaration);
        } else if (declarationType === 'public export') {
            // this shouldn't be here, but in the codegen.js
            var code = declaration.split('.');
            return 'exports.' + code[code.length - 1] + ' = ' + declaration + ';';
        }
        return '';
    });

    // moduleDef.code = jsFile;
    return moduleDef;
}
utils.parseModule = parseModule; // export parseModule
}(utils));
var loaders = {};

// import /Users/anvaka/Documents/projects/impyjs/src/loaders/defaultLoader.js
(function defaultLoader_js(loaders) {




function DefaultLoader(resourceLocation, env, resolveLoader) {
    var codeGenerated = false,
        moduleDefinition,
        loadModule = function (text, callback) {
            var moduleDef = utils.parseModule(text),
                imports = moduleDef.imports,
                loader,
                i;
            for (i = 0; i < imports.length; ++i) {
                loader = resolveLoader(env.path.dirname(resourceLocation), imports[i].importPath, env);
                imports[i].assignLoader(loader);
            }

            moduleDefinition = moduleDef; // store to let other read info about this resource

            moduleDef.resolveImports(function onImportsResolved() {
                if (!codeGenerated) {
                    env.codeGenerator.addFile(moduleDef, resourceLocation);
                    codeGenerated = true;
                } else {
                    // todo: satisfy specific imports.
                }

                callback();
            });
        };

    // loader is considered ready only when it has already loaded 
    // referenced resource:
    this.isReady = false;
    var that = this;
    this.load = function (loadedCallback) {
        if (this.isReady) {
            setTimeout(function onTransferCompleted() { loadedCallback(that); }, 0);
        } else {
            env.getSource(resourceLocation, function onTransferCompleted(source) {
                loadModule(source, function () {
                    that.isReady = true;
                    if (loadedCallback) { loadedCallback(that); }
                });
            });
        }
    };

    this.getDefinition = function () {
        return moduleDefinition;
    };
    this.getLocation = function () {
        return resourceLocation; // todo: should be relative
    };
}


loaders.DefaultLoader = DefaultLoader; // export DefaultLoader
}(loaders));
// import /Users/anvaka/Documents/projects/impyjs/src/utils/resolver.js
(function resolver_js(utils) {




var resolvedLoaders = {};
function resolveLoader(currentDir, importPath, env) {
    // split('!') and get prefix. Calculate absolute path.
    // note: should get loader by loaders map, key is path.
    var resourceLocation = env.path.resolve(currentDir, importPath);
    if (!resolvedLoaders.hasOwnProperty(resourceLocation)) {
        resolvedLoaders[resourceLocation] = new loaders.DefaultLoader(resourceLocation, env, resolveLoader);
    }
    return resolvedLoaders[resourceLocation];
}


utils.resolveLoader = resolveLoader; // export resolveLoader
}(utils));
var node = {};

// import /Users/anvaka/Documents/projects/impyjs/src/node/app.js
(function app_js(node) {





var getSource = function (location, callback) {
        var fs = require('fs');
        fs.readFile(location, 'utf8', function(err, data) {
            if (err) {
                console.error('Could not read ' + location +'. Make sure the file exists.');
                throw err;
            }
            callback(data);
        });
    };

function prepareExports(env) {
    env.getSource = getSource;
    env.path = require('path');

    return {
        load : function (file, loadedCallback) {
            env.entryPoint = env.path.resolve(file);
            env.codeGenerator = new utils.CodeGenerator(env);

            var currentDir = process.cwd();

            var loader = utils.resolveLoader(currentDir, file, env);
            loader.load(function () {
                var topModule = loader.getDefinition();
                env.codeGenerator.setPackageName(topModule.packageName);
                utils.printCode(env);
                if (typeof loadedCallback === 'function') { loadedCallback(topModule); }
            });
        }
    };
}


node.prepareExports = prepareExports; // export prepareExports
}(node));
// import /Users/anvaka/Documents/projects/impyjs/src/browser/app.js
(function app_js(browser) {
/*global window */







var getCurrentScript = function () {
        var allScripts =  window.document.getElementsByTagName('script');
        return allScripts[allScripts.length - 1];
    },
    getEntryPoint = function (env) {
        var entryPoint = getCurrentScript().getAttribute('data-main'),
            port = window.location.port ? ':' + window.location.port : '',
            basePath = window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;

        basePath = env.path.dirname(basePath);
        return entryPoint ? env.path.resolve(basePath, entryPoint) : null;
    },

    getSource = function (location, callback) {
        var r = new window.XMLHttpRequest(),
            transferComplete = function (e) {
                if (r.status < 200 || r.status > 299) {
                    window.console.error('Bad response code (' + r.status + ') for ' + location + '. Make sure the file exists.');
                    // exception?
                }
                callback(this.responseText);
            },
            transferFailed = function (e) {
                window.console.error('Failed to load ' + location);
                throw e;
            };

        r.onload = transferComplete;
        r.onerror = transferFailed;

        r.open('GET', location, true);
        r.send();
    };

function prepareExports(env) {
    env.path = browser.path;
    env.entryPoint = getEntryPoint(env);
    env.getSource = getSource;
    env.exposeNamespace = getCurrentScript().getAttribute('data-expose-namespace');

    return {
        load : function (file, loadedCallback) {
            var loader = utils.resolveLoader(env.path.dirname(window.document.URL), file, env);
            env.codeGenerator = new utils.CodeGenerator(env);
            loader.load(function () {
                var topModule = loader.getDefinition();
                env.codeGenerator.setPackageName(topModule.packageName);
                var result = utils.printCode(env);
                if (typeof loadedCallback === 'function') {
                    loadedCallback(topModule, result);
                }
            });
        }
    };
}


browser.prepareExports = prepareExports; // export prepareExports
}(browser));
// import /Users/anvaka/Documents/projects/impyjs/src/main.js
(function main_js() {








var env = {
        isNode: (typeof process !== 'undefined'),
        onlyPrint: true,  // a switch: print program or run it?
        executedCode: [], // if only print - this will hold program's code
        debugerName: true // all IIFEs will get a debugger friendly name
    },
    impyAPI;

if (env.isNode) {
    impyAPI = node.prepareExports(env);
} else {
    env.onlyPrint = false; // just for test: run the code, do not print it.
    impyAPI = browser.prepareExports(env);
}

if (env.entryPoint) { // load the first script, if environment has it.
    impyAPI.load(env.entryPoint);
}

// TODO: I'm still playing with library exports. This part may be changed:
exports.load = impyAPI.load;
}());}));
