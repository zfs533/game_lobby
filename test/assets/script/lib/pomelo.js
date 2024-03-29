

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

if (!String.fromCodePoint) (function (stringFromCharCode) {
    var fromCodePoint = function (_) {
        var codeUnits = [], codeLen = 0, result = "";
        for (var index = 0, len = arguments.length; index !== len; ++index) {
            var codePoint = +arguments[index];
            if (!(codePoint < 0x10FFFF && (codePoint >>> 0) === codePoint))
                throw RangeError("Invalid code point: " + codePoint);
            if (codePoint <= 0xFFFF) { // BMP code point
                codeLen = codeUnits.push(codePoint);
            } else { // Astral code point; split in surrogate halves
                codePoint -= 0x10000;
                codeLen = codeUnits.push(
                    (codePoint >> 10) + 0xD800,  // highSurrogate
                    (codePoint % 0x400) + 0xDC00 // lowSurrogate
                );
            }
            if (codeLen >= 0x3fff) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result + stringFromCharCode.apply(null, codeUnits);
    };
    try { // IE 8 only supports `Object.defineProperty` on DOM elements
        Object.defineProperty(String, "fromCodePoint", {
            "value": fromCodePoint, "configurable": true, "writable": true
        });
    } catch (e) {
        String.fromCodePoint = fromCodePoint;
    }
}(String.fromCharCode));


if (!String.prototype.codePointAt) {
    (function () {
        'use strict'; // 严格模式，needed to support `apply`/`call` with `undefined`/`null`
        var codePointAt = function (position) {
            if (this == null) {
                throw TypeError();
            }
            var string = String(this);
            var size = string.length;
            // 变成整数
            var index = position ? Number(position) : 0;
            if (index != index) { // better `isNaN`
                index = 0;
            }
            // 边界
            if (index < 0 || index >= size) {
                return undefined;
            }
            // 第一个编码单元
            var first = string.charCodeAt(index);
            var second;
            if ( // 检查是否开始 surrogate pair
                first >= 0xD800 && first <= 0xDBFF && // high surrogate
                size > index + 1 // 下一个编码单元
            ) {
                second = string.charCodeAt(index + 1);
                if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
                    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
            }
            return first;
        };
        if (Object.defineProperty) {
            Object.defineProperty(String.prototype, 'codePointAt', {
                'value': codePointAt,
                'configurable': true,
                'writable': true
            });
        } else {
            String.prototype.codePointAt = codePointAt;
        }
    }());
}

//return: [128], [byte]
function toUTF8Array(str) {
    var utf8 = [];

    for (var i = 0; i < str.length; i++) {
        var codePoint = str.codePointAt(i);

        if (codePoint <= 127) {
            // 0111 1111
            utf8.push(codePoint);
        } else if (codePoint <= 0x7ff) {
            // 1101 1111 1011 1111 =>0111 1111 1111
            utf8.push(0xc0 | codePoint >> 6, 0x80 | codePoint & 0x3f);
        } else if (codePoint <= 0xffff) {
            //1110 1111 1011 1111 1011 1111 =>1111 1111 1111 1111
            utf8.push(0xe0 | codePoint >> 12 & 0x0f, 0x80 | codePoint >> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        } else {
            // 1111 0111, 1011 1111,1011 1111, 1011 1111 =>0001 1111 1111 1111 1111 1111
            i++;
            utf8.push(0xf0 | codePoint >> 18 & 0x07, 0x80 | codePoint >> 12 & 0x3f, 0x80 | codePoint >> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
    }

    return utf8;
} //ByteArray


function toUTF8ByteArray(str, ByteArrayConstructor) {
    var utf8 = toUTF8Array(str);

    var _buffer = new ByteArrayConstructor(utf8.length);

    for (var i = 0; i < utf8.length; i++) {
        _buffer[i] = utf8[i];
    }

    return _buffer;
}

function byteArrayToUTF8String(ByteArrayConstructor, buffer, offset, length) {
    if (typeof offset !== "number") {
        offset = 0;
    }
    if (length === 0) {
        return "";
    }
    if (typeof length !== 'number') {
        length = 0;
    }

    var bytes;
    if (ByteArrayConstructor) {
        bytes = new ByteArrayConstructor(buffer);
    } else {
        bytes = buffer;
    }

    var array = [];
    var charCode = 0;

    var end = bytes.length;

    if (length > 0) {
        end = offset + length;
    }

    while (offset < end) {
        if (bytes[offset] <= 127) {
            charCode = bytes[offset];
            offset += 1;
        } else if (bytes[offset] <= 223) {
            charCode = ((bytes[offset] & 0x1f) << 6) + (bytes[offset + 1] & 0x3f);
            offset += 2;
        } else if (bytes[offset] <= 239) {
            var byte0 = bytes[offset];
            var byte1 = bytes[offset + 1];
            var byte2 = bytes[offset + 2];
            charCode = ((byte0 & 0xf) << 12) | ((byte1 & 0x3f) << 6) | (byte2 & 0x3f);
            offset += 3;
        } else {
            var byte0 = bytes[offset];
            var byte1 = bytes[offset + 1];
            var byte2 = bytes[offset + 2];
            var byte3 = bytes[offset + 3];
            charCode = ((byte0 & 0x07) << 18) | ((byte1 & 0x3f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f);
            offset += 4;
        }

        array.push(String.fromCodePoint(charCode));
    }

    return array.join("");
}

function pomeloRequire(name) {
    var module = pomeloRequire.modules[name];
    if (!module) throw new Error('failed to require "' + name + '"');

    if (!('exports' in module) && typeof module.definition === 'function') {
        module.client = module.component = true;
        module.definition.call(this, module.exports = {}, module);
        delete module.definition;
    }

    return module.exports;
}
/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */


pomeloRequire.loader = 'component';
/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */

pomeloRequire.helper = {};

pomeloRequire.helper.semVerSort = function (a, b) {
    var aArray = a.version.split('.');
    var bArray = b.version.split('.');

    for (var i = 0; i < aArray.length; ++i) {
        var aInt = parseInt(aArray[i], 10);
        var bInt = parseInt(bArray[i], 10);

        if (aInt === bInt) {
            var aLex = aArray[i].substr(("" + aInt).length);
            var bLex = bArray[i].substr(("" + bInt).length);
            if (aLex === '' && bLex !== '') return 1;
            if (aLex !== '' && bLex === '') return -1;
            if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
            continue;
        } else if (aInt > bInt) {
            return 1;
        } else {
            return -1;
        }
    }

    return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used.
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true,
 *                               otherwise it returns the epxorted module
 */


pomeloRequire.latest = function (name, returnPath) {
    function showError(name) {
        throw new Error('failed to find latest module of "' + name + '"');
    } // only remotes with semvers, ignore local files conataining a '/'


    var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
    var remoteRegexp = /(.*)~(.*)/;
    if (!remoteRegexp.test(name)) showError(name);
    var moduleNames = Object.keys(pomeloRequire.modules);
    var semVerCandidates = [];
    var otherCandidates = []; // for instance: name of the git branch

    for (var i = 0; i < moduleNames.length; i++) {
        var moduleName = moduleNames[i];

        if (new RegExp(name + '@').test(moduleName)) {
            var version = moduleName.substr(name.length + 1);
            var semVerMatch = versionRegexp.exec(moduleName);

            if (semVerMatch != null) {
                semVerCandidates.push({
                    version: version,
                    name: moduleName
                });
            } else {
                otherCandidates.push({
                    version: version,
                    name: moduleName
                });
            }
        }
    }

    if (semVerCandidates.concat(otherCandidates).length === 0) {
        showError(name);
    }

    if (semVerCandidates.length > 0) {
        var module = semVerCandidates.sort(pomeloRequire.helper.semVerSort).pop().name;

        if (returnPath === true) {
            return module;
        }

        return pomeloRequire(module);
    } // if the build contains more than one branch of the same module
    // you should not use this funciton


    var module = otherCandidates.sort(function (a, b) {
        return a.name > b.name
    })[0].name;

    if (returnPath === true) {
        return module;
    }
    return pomeloRequire(module);
}

/**
 * Registered modules.
 */


pomeloRequire.modules = {};
/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

pomeloRequire.register = function (name, definition) {
    pomeloRequire.modules[name] = {
        definition: definition
    };
};
/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */


pomeloRequire.define = function (name, exports) {
    pomeloRequire.modules[name] = {
        exports: exports
    };
};

pomeloRequire.register("pomelonode~pomelo-protobuf@master", function (exports, module) {
    /* ProtocolBuffer client 0.1.0*/

    /**
     * pomelo-protobuf
     * @author <zhang0935@gmail.com>
     */

    /**
     * Protocol buffer root
     * In browser, it will be window.protbuf
     */
    (function (exports, global) {
        var Protobuf = exports;

        Protobuf.init = function (opts) {
            //On the serverside, use serverProtos to encode messages send to client
            Protobuf.encoder.init(opts.encoderProtos); //On the serverside, user clientProtos to decode messages receive from clients

            Protobuf.decoder.init(opts.decoderProtos);
        };

        Protobuf.encode = function (key, msg) {
            return Protobuf.encoder.encode(key, msg);
        };

        Protobuf.decode = function (key, msg) {
            return Protobuf.decoder.decode(key, msg);
        }; // exports to support for components


        module.exports = Protobuf;
        if (typeof (window) != "undefined") {
            window.protobuf = Protobuf;
        }
    })(typeof (window) == "undefined" ? module.exports : (this.protobuf = {}), this);

    /**
     * constants
     */


    (function (exports, global) {
        var constants = exports.constants = {};
        constants.TYPES = {
            uInt32: 0,
            sInt32: 0,
            int32: 0,
            double: 1,
            string: 2,
            message: 2,
            float: 5
        };
    })('undefined' !== typeof protobuf ? protobuf : module.exports, this);
    /**
     * util module
     */


    (function (exports, global) {
        var Util = exports.util = {};
        Util.isSimpleType = function (type) {
            return (type === 'uInt32' ||
                type === 'sInt32' ||
                type === 'int32' ||
                type === 'uInt64' ||
                type === 'sInt64' ||
                type === 'float' ||
                type === 'double');
        };
    })('undefined' !== typeof protobuf ? protobuf : module.exports, this);
    /**
     * codec module
     */


    (function (exports, global) {
        var Codec = exports.codec = {};
        var buffer = new ArrayBuffer(8);
        var float32Array = new Float32Array(buffer);
        var float64Array = new Float64Array(buffer);
        var uInt8Array = new Uint8Array(buffer);

        Codec.encodeUInt32 = function (n) {
            var n = parseInt(n);

            if (isNaN(n) || n < 0) {
                return null;
            }

            var result = [];

            do {
                var tmp = n % 128;
                var next = Math.floor(n / 128);

                if (next !== 0) {
                    tmp = tmp + 128;
                }

                result.push(tmp);
                n = next;
            } while (n !== 0);

            return result;
        };

        Codec.encodeSInt32 = function (n) {
            var n = parseInt(n);

            if (isNaN(n)) {
                return null;
            }
            n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2;
            return Codec.encodeUInt32(n);
        };

        Codec.decodeUInt32 = function (bytes) {
            var n = 0;

            for (var i = 0; i < bytes.length; i++) {
                var m = parseInt(bytes[i]);
                n = n + ((m & 0x7f) * Math.pow(2, (7 * i)));
                if (m < 128) {
                    return n;
                }
            }

            return n;
        };

        Codec.decodeSInt32 = function (bytes) {
            var n = this.decodeUInt32(bytes);
            var flag = ((n % 2) === 1) ? -1 : 1;
            n = ((n % 2 + n) / 2) * flag;
            return n;
        };

        Codec.encodeFloat = function (float) {
            float32Array[0] = float;
            return uInt8Array;
        };

        Codec.decodeFloat = function (bytes, offset) {
            if (!bytes || bytes.length < (offset + 4)) {
                return null;
            }

            for (var i = 0; i < 4; i++) {
                uInt8Array[i] = bytes[offset + i];
            }

            return float32Array[0];
        };

        Codec.encodeDouble = function (double) {
            float64Array[0] = double;
            return uInt8Array.subarray(0, 8);
        };

        Codec.decodeDouble = function (bytes, offset) {
            if (!bytes || bytes.length < (offset + 8)) {
                return null;
            }

            for (var i = 0; i < 8; i++) {
                uInt8Array[i] = bytes[offset + i];
            }

            return float64Array[0];
        };

        Codec.encodeStr = function (bytes, offset, str) {
            var utf8 = toUTF8Array(str);

            for (var i = 0; i < utf8.length; i++) {
                bytes[offset] = utf8[i];
                offset++;
            }

            return offset;
        };
        /**
         * Decode string from utf8 bytes
         */


        Codec.decodeStr = function (bytes, offset, length) {
            return byteArrayToUTF8String(undefined, bytes, offset, length);
        };
        /**
         * Return the byte length of the str use utf8
         */


        Codec.byteLength = function (str) {
            if (typeof str !== 'string') {
                return -1;
            }

            return toUTF8Array(str).length;
        };
    })('undefined' !== typeof protobuf ? protobuf : module.exports, this);
    /**
     * encoder module
     */


    (function (exports, global) {
        var protobuf = exports;
        var MsgEncoder = exports.encoder = {};
        var codec = protobuf.codec;
        var constant = protobuf.constants;
        var util = protobuf.util;

        MsgEncoder.init = function (protos) {
            this.protos = protos || {};
        };

        MsgEncoder.encode = function (route, msg) {
            //Get protos from protos map use the route as key
            var protos = this.protos[route]; //Check msg

            if (!checkMsg(msg, protos)) {
                return null;
            } //Set the length of the buffer 2 times bigger to prevent overflow


            var strMsg = JSON.stringify(msg);
            var length = codec.byteLength(strMsg); //Init buffer and offset

            var buffer = new ArrayBuffer(length);
            var uInt8Array = new Uint8Array(buffer);
            var offset = 0;

            if (!!protos) {
                offset = encodeMsg(uInt8Array, offset, protos, msg);

                if (offset > 0) {
                    return uInt8Array.subarray(0, offset);
                }
            }

            return null;
        };
        /**
         * Check if the msg follow the defination in the protos
         */


        function checkMsg(msg, protos) {
            if (!protos) {
                return false;
            }

            for (var name in protos) {
                var proto = protos[name]; //All required element must exist

                switch (proto.option) {
                    case 'required':
                        if (typeof (msg[name]) === 'undefined') {
                            console.warn('no property exist for required! name: %j, proto: %j, msg: %j', name, proto, msg);
                            return false;
                        }

                    case 'optional':
                        if (typeof (msg[name]) !== 'undefined') {
                            var message = protos.__messages[proto.type] || MsgEncoder.protos['message ' + proto.type];

                            if (!!message && !checkMsg(msg[name], message)) {
                                console.warn('inner proto error! name: %j, proto: %j, msg: %j', name, proto, msg);
                                return false;
                            }
                        }

                        break;

                    case 'repeated':
                        //Check nest message in repeated elements
                        var message = protos.__messages[proto.type] || MsgEncoder.protos['message ' + proto.type];

                        if (!!msg[name] && !!message) {
                            for (var i = 0; i < msg[name].length; i++) {
                                if (!checkMsg(msg[name][i], message)) {
                                    return false;
                                }
                            }
                        }

                        break;
                }
            }

            return true;
        }

        function encodeMsg(buffer, offset, protos, msg) {
            for (var name in msg) {
                if (!!protos[name]) {
                    var proto = protos[name];

                    switch (proto.option) {
                        case 'required':
                        case 'optional':
                            offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                            offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
                            break;

                        case 'repeated':
                            if (msg[name].length > 0) {
                                offset = encodeArray(msg[name], proto, offset, buffer, protos);
                            }

                            break;
                    }
                }
            }

            return offset;
        }

        function encodeProp(value, type, offset, buffer, protos) {
            switch (type) {
                case 'uInt32':
                    offset = writeBytes(buffer, offset, codec.encodeUInt32(value));
                    break;

                case 'int32':
                case 'sInt32':
                    offset = writeBytes(buffer, offset, codec.encodeSInt32(value));
                    break;

                case 'float':
                    writeBytes(buffer, offset, codec.encodeFloat(value));
                    offset += 4;
                    break;

                case 'double':
                    writeBytes(buffer, offset, codec.encodeDouble(value));
                    offset += 8;
                    break;

                case 'string':
                    var length = codec.byteLength(value); //Encode length

                    offset = writeBytes(buffer, offset, codec.encodeUInt32(length)); //write string

                    codec.encodeStr(buffer, offset, value);
                    offset += length;
                    break;

                default:
                    var message = protos.__messages[type] || MsgEncoder.protos['message ' + type];

                    if (!!message) {
                        //Use a tmp buffer to build an internal msg
                        var tmpBuffer = new ArrayBuffer(codec.byteLength(JSON.stringify(value)) * 2);
                        var length = 0;
                        length = encodeMsg(tmpBuffer, length, message, value); //Encode length

                        offset = writeBytes(buffer, offset, codec.encodeUInt32(length)); //contact the object

                        for (var i = 0; i < length; i++) {
                            buffer[offset] = tmpBuffer[i];
                            offset++;
                        }
                    }

                    break;
            }

            return offset;
        }
        /**
         * Encode reapeated properties, simple msg and object are decode differented
         */


        function encodeArray(array, proto, offset, buffer, protos) {
            var i = 0;

            if (util.isSimpleType(proto.type)) {
                offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));

                for (i = 0; i < array.length; i++) {
                    offset = encodeProp(array[i], proto.type, offset, buffer);
                }
            } else {
                for (i = 0; i < array.length; i++) {
                    offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                    offset = encodeProp(array[i], proto.type, offset, buffer, protos);
                }
            }

            return offset;
        }

        function writeBytes(buffer, offset, bytes) {
            for (var i = 0; i < bytes.length; i++, offset++) {
                buffer[offset] = bytes[i];
            }

            return offset;
        }

        function encodeTag(type, tag) {
            var value = constant.TYPES[type] || 2;
            return codec.encodeUInt32((tag << 3) | value);
        }
    })('undefined' !== typeof protobuf ? protobuf : module.exports, this);
    /**
     * decoder module
     */


    (function (exports, global) {
        var protobuf = exports;
        var MsgDecoder = exports.decoder = {};
        var codec = protobuf.codec;
        var util = protobuf.util;
        var buffer;
        var offset = 0;

        MsgDecoder.init = function (protos) {
            this.protos = protos || {};
        };

        MsgDecoder.setProtos = function (protos) {
            if (!!protos) {
                this.protos = protos;
            }
        };

        MsgDecoder.decode = function (route, buf) {
            var protos = this.protos[route];
            buffer = buf;
            offset = 0;

            if (!!protos) {
                return decodeMsg({}, protos, buffer.length);
            }

            return null;
        };

        function decodeMsg(msg, protos, length) {
            while (offset < length) {
                var head = getHead();
                var type = head.type;
                var tag = head.tag;
                var name = protos.__tags[tag];

                switch (protos[name].option) {
                    case 'optional':
                    case 'required':
                        msg[name] = decodeProp(protos[name].type, protos);
                        break;

                    case 'repeated':
                        if (!msg[name]) {
                            msg[name] = [];
                        }

                        decodeArray(msg[name], protos[name].type, protos);
                        break;
                }
            }

            return msg;
        }
        /**
         * Test if the given msg is finished
         */


        function isFinish(msg, protos) {
            return (!protos.__tags[peekHead().tag]);
        }
        /**
         * Get property head from protobuf
         */


        function getHead() {
            var tag = codec.decodeUInt32(getBytes());
            return {
                type: tag & 0x7,
                tag: tag >> 3
            };
        }
        /**
         * Get tag head without move the offset
         */


        function peekHead() {
            var tag = codec.decodeUInt32(peekBytes());
            return {
                type: tag & 0x7,
                tag: tag >> 3
            };
        }

        function decodeProp(type, protos) {
            switch (type) {
                case 'uInt32':

                    return codec.decodeUInt32(getBytes());

                case 'int32':
                case 'sInt32':
                    return codec.decodeSInt32(getBytes());

                case 'float':
                    var float = codec.decodeFloat(buffer, offset);
                    offset += 4;
                    return float;

                case 'double':
                    var double = codec.decodeDouble(buffer, offset);
                    offset += 8;
                    return double;

                case 'string':
                    var length = codec.decodeUInt32(getBytes());
                    var str = codec.decodeStr(buffer, offset, length);
                    offset += length;
                    return str;

                default:
                    var message = protos && (protos.__messages[type] || MsgDecoder.protos['message ' + type]);

                    if (!!message) {
                        var length = codec.decodeUInt32(getBytes());
                        var msg = {};
                        decodeMsg(msg, message, offset + length);
                        return msg;
                    }

                    break;
            }
        }

        function decodeArray(array, type, protos) {
            if (util.isSimpleType(type)) {
                var length = codec.decodeUInt32(getBytes());

                for (var i = 0; i < length; i++) {
                    array.push(decodeProp(type));
                }
            } else {
                array.push(decodeProp(type, protos));
            }
        }

        function getBytes(flag) {
            var bytes = [];
            var pos = offset;
            flag = flag || false;
            var b;

            do {
                b = buffer[pos];
                bytes.push(b);
                pos++;
            } while (b >= 128);

            if (!flag) {
                offset = pos;
            }

            return bytes;
        }

        function peekBytes() {
            return getBytes(true);
        }
    })('undefined' !== typeof protobuf ? protobuf : module.exports, this);
});
pomeloRequire.register("component~emitter@master", function (exports, module) {
    /**
     * Expose `Emitter`.
     */
    if (typeof module !== 'undefined') {
        module.exports = Emitter;
    }
    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */


    function Emitter(obj) {
        if (obj) return mixin(obj);
    };

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
        for (var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
        }

        return obj;
    }
    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */
    Emitter.prototype.on =
        Emitter.prototype.addEventListener = function (event, fn) {
            this._callbacks = this._callbacks || {};
            (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
                .push(fn);
            return this;
        };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */


    Emitter.prototype.once = function (event, fn) {
        function on() {
            this.off(event, on);
            fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
    };
    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */
    Emitter.prototype.off =
        Emitter.prototype.removeListener =
        Emitter.prototype.removeAllListeners =
        Emitter.prototype.removeEventListener = function (event, fn) {
            this._callbacks = this._callbacks || {};
            // all
            if (0 == arguments.length) {
                this._callbacks = {};
                return this;
            }
            // specific event
            var callbacks = this._callbacks['$' + event];
            if (!callbacks) return this;

            if (1 == arguments.length) {
                delete this._callbacks['$' + event];
                return this;
            } // remove specific handler


            var cb;

            for (var i = 0; i < callbacks.length; i++) {
                cb = callbacks[i];

                if (cb === fn || cb.fn === fn) {
                    callbacks.splice(i, 1);
                    break;
                }
            }

            return this;
        };
    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */


    Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this._callbacks['$' + event];

        if (callbacks) {
            callbacks = callbacks.slice(0);

            for (var i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
            }
        }

        return this;
    };
    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */


    Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
    };
    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */


    Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
    };
});
pomeloRequire.register("netease~pomelo-protocol@master", function (exports, module) {
    (function (exports, ByteArray, global) {
        var Protocol = exports;
        var PKG_HEAD_BYTES = 4;
        var MSG_FLAG_BYTES = 1;
        var MSG_ROUTE_CODE_BYTES = 2;
        var MSG_ID_MAX_BYTES = 5;
        var MSG_ROUTE_LEN_BYTES = 1;
        var MSG_ROUTE_CODE_MAX = 0xffff;
        var MSG_COMPRESS_ROUTE_MASK = 0x1;
        var MSG_COMPRESS_GZIP_MASK = 0x1;
        var MSG_COMPRESS_GZIP_ENCODE_MASK = 1 << 4;
        var MSG_TYPE_MASK = 0x7;
        var Package = Protocol.Package = {};
        var Message = Protocol.Message = {};
        Package.TYPE_HANDSHAKE = 1;
        Package.TYPE_HANDSHAKE_ACK = 2;
        Package.TYPE_HEARTBEAT = 3;
        Package.TYPE_DATA = 4;
        Package.TYPE_KICK = 5;
        Message.TYPE_REQUEST = 0;
        Message.TYPE_NOTIFY = 1;
        Message.TYPE_RESPONSE = 2;
        Message.TYPE_PUSH = 3;
        /**
         * pomele client encode
         * id message id;
         * route message route
         * msg message body
         * socketio current support string
         */

        Protocol.strencode = function (str) {
            if (typeof Buffer !== "undefined" && ByteArray === Buffer) {
                // encoding defaults to 'utf8'
                return new Buffer(str);
            } else {
                return toUTF8ByteArray(str, ByteArray);
            }
        };
        /**
         * client decode
         * msg String data
         * return Message Object
         */


        Protocol.strdecode = function (buffer) {
            if (typeof Buffer !== "undefined" && ByteArray === Buffer) {
                // encoding defaults to 'utf8'
                return buffer.toString();
            } else {
                return byteArrayToUTF8String(ByteArray, buffer);
            }
        };
        /**
         * Package protocol encode.
         *
         * Pomelo package format:
         * +------+-------------+------------------+
         * | type | body length |       body       |
         * +------+-------------+------------------+
         *
         * Head: 4bytes
         *   0: package type,
         *      1 - handshake,
         *      2 - handshake ack,
         *      3 - heartbeat,
         *      4 - data
         *      5 - kick
         *   1 - 3: big-endian body length
         * Body: body length bytes
         *
         * @param  {Number}    type   package type
         * @param  {ByteArray} body   body content in bytes
         * @return {ByteArray}        new byte array that contains encode result
         */


        Package.encode = function (type, body) {
            var length = body ? body.length : 0;
            var buffer = new ByteArray(PKG_HEAD_BYTES + length);
            var index = 0;
            buffer[index++] = type & 0xff;
            buffer[index++] = (length >> 16) & 0xff;
            buffer[index++] = (length >> 8) & 0xff;
            buffer[index++] = length & 0xff;

            if (body) {
                copyArray(buffer, index, body, 0, length);
            }

            return buffer;
        };
        /**
         * Package protocol decode.
         * See encode for package format.
         *
         * @param  {ByteArray} buffer byte array containing package content
         * @return {Object}           {type: package type, buffer: body byte array}
         */


        Package.decode = function (buffer) {
            var offset = 0;
            var bytes = new ByteArray(buffer);
            var length = 0;
            var rs = [];

            while (offset < bytes.length) {
                var type = bytes[offset++];
                length = ((bytes[offset++]) << 16 | (bytes[offset++]) << 8 | bytes[offset++]) >>> 0;
                var body = length ? new ByteArray(length) : null;

                if (body) {
                    copyArray(body, 0, bytes, offset, length);
                }

                offset += length;
                rs.push({
                    'type': type,
                    'body': body
                });
            }

            return rs.length === 1 ? rs[0] : rs;
        };
        /**
         * Message protocol encode.
         *
         * @param  {Number} id            message id
         * @param  {Number} type          message type
         * @param  {Number} compressRoute whether compress route
         * @param  {Number|String} route  route code or route string
         * @param  {Buffer} msg           message body bytes
         * @return {Buffer}               encode result
         */


        Message.encode = function (id, type, compressRoute, route, msg, compressGzip) {
            // caculate message max length
            var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
            var msgLen = MSG_FLAG_BYTES + idBytes;

            if (msgHasRoute(type)) {
                if (compressRoute) {
                    if (typeof route !== 'number') {
                        throw new Error('error flag for number route!');
                    }

                    msgLen += MSG_ROUTE_CODE_BYTES;
                } else {
                    msgLen += MSG_ROUTE_LEN_BYTES;

                    if (route) {
                        route = Protocol.strencode(route);

                        if (route.length > 255) {
                            throw new Error('route maxlength is overflow');
                        }

                        msgLen += route.length;
                    }
                }
            }

            if (msg) {
                msgLen += msg.length;
            }

            var buffer = new ByteArray(msgLen);
            var offset = 0; // add flag

            offset = encodeMsgFlag(type, compressRoute, buffer, offset, compressGzip); // add message id

            if (msgHasId(type)) {
                offset = encodeMsgId(id, buffer, offset);
            } // add route


            if (msgHasRoute(type)) {
                offset = encodeMsgRoute(compressRoute, route, buffer, offset);
            } // add body


            if (msg) {
                offset = encodeMsgBody(msg, buffer, offset);
            }

            return buffer;
        };
        /**
         * Message protocol decode.
         *
         * @param  {Buffer|Uint8Array} buffer message bytes
         * @return {Object}            message object
         */


        Message.decode = function (buffer) {
            var bytes = new ByteArray(buffer);
            var bytesLen = bytes.length || bytes.byteLength;
            var offset = 0;
            var id = 0;
            var route = null; // parse flag

            var flag = bytes[offset++];
            var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
            var type = (flag >> 1) & MSG_TYPE_MASK;
            var compressGzip = (flag >> 4) & MSG_COMPRESS_GZIP_MASK;
            // parse id
            if (msgHasId(type)) {
                var m = 0;
                var i = 0;

                do {
                    m = parseInt(bytes[offset]);
                    id += (m & 0x7f) << (7 * i);
                    offset++;
                    i++;
                } while (m >= 128);
            } // parse route


            if (msgHasRoute(type)) {
                if (compressRoute) {
                    route = (bytes[offset++]) << 8 | bytes[offset++];
                } else {
                    var routeLen = bytes[offset++];

                    if (routeLen) {
                        route = new ByteArray(routeLen);
                        copyArray(route, 0, bytes, offset, routeLen);
                        route = Protocol.strdecode(route);
                    } else {
                        route = '';
                    }

                    offset += routeLen;
                }
            } // parse body


            var bodyLen = bytesLen - offset;
            var body = new ByteArray(bodyLen);
            copyArray(body, 0, bytes, offset, bodyLen);
            return {
                'id': id,
                'type': type,
                'compressRoute': compressRoute,
                'route': route,
                'body': body,
                'compressGzip': compressGzip
            };
        };

        var copyArray = function (dest, doffset, src, soffset, length) {
            if ('function' === typeof src.copy) {
                // Buffer
                src.copy(dest, doffset, soffset, soffset + length);
            } else {
                // Uint8Array
                for (var index = 0; index < length; index++) {
                    dest[doffset++] = src[soffset++];
                }
            }
        };

        var msgHasId = function (type) {
            return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE;
        };

        var msgHasRoute = function (type) {
            return type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY ||
                type === Message.TYPE_PUSH;
        };

        var caculateMsgIdBytes = function (id) {
            var len = 0;

            do {
                len += 1;
                id >>= 7;
            } while (id > 0);

            return len;
        };

        var encodeMsgFlag = function (type, compressRoute, buffer, offset, compressGzip) {
            if (type !== Message.TYPE_REQUEST && type !== Message.TYPE_NOTIFY &&
                type !== Message.TYPE_RESPONSE && type !== Message.TYPE_PUSH) {
                throw new Error('unkonw message type: ' + type);
            }
            buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);
            if (compressGzip) {
                buffer[offset] = buffer[offset] | MSG_COMPRESS_GZIP_ENCODE_MASK;
            }

            return offset + MSG_FLAG_BYTES;
        };

        var encodeMsgId = function (id, buffer, offset) {
            do {
                var tmp = id % 128;
                var next = Math.floor(id / 128);

                if (next !== 0) {
                    tmp = tmp + 128;
                }

                buffer[offset++] = tmp;
                id = next;
            } while (id !== 0);

            return offset;
        };

        var encodeMsgRoute = function (compressRoute, route, buffer, offset) {
            if (compressRoute) {
                if (route > MSG_ROUTE_CODE_MAX) {
                    throw new Error('route number is overflow');
                }
                buffer[offset++] = (route >> 8) & 0xff;
                buffer[offset++] = route & 0xff;
            } else {
                if (route) {
                    buffer[offset++] = route.length & 0xff;
                    copyArray(buffer, offset, route, 0, route.length);
                    offset += route.length;
                } else {
                    buffer[offset++] = 0;
                }
            }

            return offset;
        };

        var encodeMsgBody = function (msg, buffer, offset) {
            copyArray(buffer, offset, msg, 0, msg.length);
            return offset + msg.length;
        };

        module.exports = Protocol;
        if (typeof (window) != "undefined") {
            window.Protocol = Protocol;
        }
    })(typeof (window) == "undefined" ? module.exports : (this.Protocol = {}), typeof (window) == "undefined" ? Buffer : Uint8Array, this);
});
pomeloRequire.register("pomelonode~pomelo-jsclient-websocket@master", function (exports, module) {
    (function () {
        var JS_WS_CLIENT_TYPE = 'js-websocket';
        var JS_WS_CLIENT_VERSION = '0.0.1';
        var Protocol = window.Protocol;
        var protobuf = window.protobuf;
        var decodeIO_protobuf = window.decodeIO_protobuf;
        var decodeIO_encoder = null;
        var decodeIO_decoder = null;
        var Package = Protocol.Package;
        var Message = Protocol.Message;
        var EventEmitter = window.EventEmitter;
        var rsa = window.rsa;
        if (typeof (window) != "undefined" && typeof (sys) != 'undefined' && sys.localStorage) {
            window.localStorage = sys.localStorage;
        }

        var RES_OK = 200;
        var RES_FAIL = 500;
        var RES_OLD_CLIENT = 501;

        if (typeof Object.create !== 'function') {
            Object.create = function (o) {
                function F() { }

                F.prototype = o;
                return new F();
            };
        }

        var root = window;
        var pomelo = Object.create(EventEmitter.prototype); // object extend from object

        root.pomelo = pomelo;
        var socket = null;
        var reqId = 0;
        var callbacks = {};
        var handlers = {};
        //Map from request id to route
        var routeMap = {};
        var dict = {}; // route string to code

        var abbrs = {}; // code to route string

        var serverProtos = {};
        var clientProtos = {};
        var protoVersion = 0;
        var dictVersion = 0;
        var heartbeatInterval = 0;
        var heartbeatTimeout = 0;
        var nextHeartbeatTimeout = 0;
        var gapThreshold = 100; // heartbeat gap threashold

        var heartbeatId = null;
        var heartbeatTimeoutId = null;
        var handshakeCallback = null;
        var decode = null;
        var encode = null;
        var reconnect = false;
        var reconncetTimer = null;
        var reconnectUrl = null;
        var reconnectAttempts = 0;
        var reconnectionDelay = 5000;
        var DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
        var useCrypto;

        var _log;

        var handshakeBuffer = {
            'sys': {
                type: JS_WS_CLIENT_TYPE,
                version: JS_WS_CLIENT_VERSION,
                rsa: {}
            },
            'user': {}
        };
        var initCallback = null;

        pomelo.init = function (params, _log_, cb) {
            _log = _log_;
            initCallback = cb;
            var host = params.host;
            var port = params.port;
            encode = params.encode || defaultEncode;
            decode = params.decode || defaultDecode;
            var url = host;

            if (port) {
                url += ':' + port;
            }

            handshakeBuffer.user = params.user;

            if (params.encrypt) {
                useCrypto = true;
                rsa.generate(1024, "10001");
                var data = {
                    rsa_n: rsa.n.toString(16),
                    rsa_e: rsa.e
                }
                handshakeBuffer.sys.rsa = data;
            }

            handshakeCallback = params.handshakeCallback;
            _log("pomelo 开始链接")
            connect(params, url, cb);
        };

        var defaultDecode = pomelo.decode = function (data) {
            //probuff decode
            var msg = Message.decode(data);

            if (msg.id > 0) {
                msg.route = routeMap[msg.id];
                delete routeMap[msg.id];

                if (!msg.route) {
                    return;
                }
            }

            msg.body = deCompose(msg);
            return msg;
        };

        var defaultEncode = pomelo.encode = function (reqId, route, msg) {
            var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY; //compress message by protobuf

            if (protobuf && clientProtos[route]) {
                msg = protobuf.encode(route, msg);
            } else if (decodeIO_encoder && decodeIO_encoder.lookup(route)) {
                var Builder = decodeIO_encoder.build(route);
                msg = new Builder(msg).encodeNB();
            } else {
                msg = Protocol.strencode(JSON.stringify(msg));
            }

            var compressRoute = 0;

            if (dict && dict[route]) {
                route = dict[route];
                compressRoute = 1;
            }

            return Message.encode(reqId, type, compressRoute, route, msg);
        };

        var connect = function (params, url, cb) {
            var params = params || {};
            var maxReconnectAttempts = params.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
            reconnectUrl = url; //Add protobuf and dict version

            if (window.localStorage && window.localStorage.getItem('protos') && protoVersion === 0) {
                var protos = JSON.parse(window.localStorage.getItem('protos'));
                protoVersion = protos.version || 0;
                serverProtos = protos.server || {};
                clientProtos = protos.client || {};

                if (!!protobuf) {
                    protobuf.init({
                        encoderProtos: clientProtos,
                        decoderProtos: serverProtos
                    });
                }

                if (!!decodeIO_protobuf) {
                    decodeIO_encoder = decodeIO_protobuf.loadJson(clientProtos);
                    decodeIO_decoder = decodeIO_protobuf.loadJson(serverProtos);
                }
            }

            if (window.localStorage && window.localStorage.getItem('dicts') && dictVersion === 0) {
                var dicts = JSON.parse(window.localStorage.getItem('dicts'));
                dictVersion = (dicts && dicts.version) || 0;
                dict = (dicts.routeToCode) || {};
                abbrs = (dicts.codeToRoute) || {};
            } //Set protoversion


            handshakeBuffer.sys.protoVersion = protoVersion;
            handshakeBuffer.sys.dictVersion = dictVersion;

            var onopen = function (event) {
                _log("pomelo onOpen")

                if (!!reconnect) {
                    pomelo.emit('reconnect');
                }

                reset();

                _log("pomelo start handshake")

                var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
                send(obj);
            };

            var onmessage = function (event) {
                processPackage(Package.decode(event.data), cb); // new package arrived, update the heartbeat timeout

                if (heartbeatTimeout) {
                    nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
                }
            };

            var onerror = function (event) {
                pomelo.emit('io-error', event);

                _log("pomelo on error" + JSON.stringify(event))

                console.error('socket error: ', event);
            };

            var onclose = function (event) {
                pomelo.emit('close', event);
                pomelo.emit('disconnect', event); // console.error('socket close: ', event);

                if (!!params.reconnect && reconnectAttempts < maxReconnectAttempts) {
                    reconnect = true;
                    reconnectAttempts++;
                    reconncetTimer = setTimeout(function () {
                        connect(params, reconnectUrl, cb);
                    }, reconnectionDelay);
                    reconnectionDelay *= 2;
                }
            };

            socket = new WebSocket(url);
            socket.binaryType = 'arraybuffer';
            socket.onopen = onopen;
            socket.onmessage = onmessage;
            socket.onerror = onerror;
            socket.onclose = onclose;
        };

        pomelo.disconnect = function () {
            if (socket) {
                if (socket.disconnect) socket.disconnect();
                if (socket.close) socket.close(); // console.log('disconnect');

                socket = null;
            }

            if (heartbeatId) {
                clearTimeout(heartbeatId);
                heartbeatId = null;
            }

            if (heartbeatTimeoutId) {
                clearTimeout(heartbeatTimeoutId);
                heartbeatTimeoutId = null;
            }
        };

        var reset = function () {
            reconnect = false;
            reconnectionDelay = 1000 * 5;
            reconnectAttempts = 0;
            clearTimeout(reconncetTimer);
        };

        pomelo.request = function (route, msg, cb) {
            if (arguments.length === 2 && typeof msg === 'function') {
                cb = msg;
                msg = {};
            } else {
                msg = msg || {};
            }

            route = route || msg.route;

            if (!route) {
                return;
            }

            reqId++;
            sendMessage(reqId, route, msg);
            callbacks[reqId] = cb;
            routeMap[reqId] = route;
        };

        pomelo.notify = function (route, msg) {
            msg = msg || {};
            sendMessage(0, route, msg);
        };

        var sendMessage = function (reqId, route, msg) {
            if (console) {
                // console.info("====>" + route + "::" + JSON.stringify(msg));
            }

            if (useCrypto) {
                msg = JSON.stringify(msg);
                var sig = rsa.signString(msg, "sha256");
                msg = JSON.parse(msg);
                msg['__crypto__'] = sig;
            }

            if (encode) {
                msg = encode(reqId, route, msg);
            }

            var packet = Package.encode(Package.TYPE_DATA, msg);
            send(packet);
        };

        var send = function (packet) {
            if (socket)
                socket.send(packet.buffer);
        };

        var handler = {};

        var heartbeat = function (data) {
            if (!heartbeatInterval) {
                // no heartbeat
                return;
            }

            var obj = Package.encode(Package.TYPE_HEARTBEAT);

            if (heartbeatTimeoutId) {
                clearTimeout(heartbeatTimeoutId);
                heartbeatTimeoutId = null;
            }

            if (heartbeatId) {
                // already in a heartbeat interval
                return;
            }

            heartbeatId = setTimeout(function () {
                heartbeatId = null;
                send(obj);
                nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
                heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, heartbeatTimeout);
            }, heartbeatInterval);
        };

        var heartbeatTimeoutCb = function () {
            var gap = nextHeartbeatTimeout - Date.now();

            if (gap > gapThreshold) {
                heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap);
            } else {
                console.error('server heartbeat timeout');
                pomelo.emit('heartbeat timeout');
                pomelo.disconnect();
            }
        };

        var lzw_decode = function (s) {
            var dict = {};
            var data = (s + "").split("");
            var currChar = data[0];
            var oldPhrase = currChar;
            var out = [currChar];
            var code = 256;
            var phrase;

            for (var i = 1; i < data.length; i++) {
                var currCode = data[i].charCodeAt(0);

                if (currCode < 256) {
                    phrase = data[i];
                } else {
                    phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                }

                out.push(phrase);
                currChar = phrase.charAt(0);
                dict[code] = oldPhrase + currChar;
                code++;
                oldPhrase = phrase;
            }

            return out.join("");
        }

        var handshake = function (data) {
            _log("pomelo handshake end")

            data = JSON.parse(lzw_decode(Protocol.strdecode(data)));

            if (data.code === RES_OLD_CLIENT) {
                pomelo.emit('error', 'client version not fullfill');
                return;
            }

            if (data.code !== RES_OK) {
                pomelo.emit('error', 'handshake fail');
                return;
            }

            handshakeInit(data);
            var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
            send(obj);

            if (initCallback) {
                initCallback(socket);
            }
        };

        var onData = function (data) {
            var msg = data;

            if (decode) {
                msg = decode(msg);
            }

            processMessage(pomelo, msg);
        };

        var onKick = function (data) {
            data = JSON.parse(Protocol.strdecode(data));
            pomelo.emit('onKick', data);
        };

        handlers[Package.TYPE_HANDSHAKE] = handshake;
        handlers[Package.TYPE_HEARTBEAT] = heartbeat;
        handlers[Package.TYPE_DATA] = onData;
        handlers[Package.TYPE_KICK] = onKick;
        var processPackage = function (msgs) {
            if (Array.isArray(msgs)) {
                for (var i = 0; i < msgs.length; i++) {
                    var msg = msgs[i];
                    handlers[msg.type](msg.body);
                }
            } else {
                handlers[msgs.type](msgs.body);
            }
        };
        var processMessage = function (pomelo, msg) {
            if (console) {
                // console.info("<====" + msg.route + "::" + JSON.stringify(msg.body));
            }

            if (!msg.id) {
                // server push message
                pomelo.emit(msg.route, msg.body);
                return;
            }
            //if have a id then find the callback function with the request
            var cb = callbacks[msg.id];
            delete callbacks[msg.id];

            if (typeof cb !== 'function') {
                return;
            }

            cb(msg.body);
            return;
        };
        var processMessageBatch = function (pomelo, msgs) {
            for (var i = 0, l = msgs.length; i < l; i++) {
                processMessage(pomelo, msgs[i]);
            }
        };
        var deCompose = function (msg) {
            var route = msg.route;
            //Decompose route from dict
            if (msg.compressRoute) {
                if (!abbrs[route]) {
                    return {};
                }

                route = msg.route = abbrs[route];
            }

            if (protobuf && serverProtos[route]) {
                return protobuf.decode /*Str*/(route, msg.body);
            } else if (decodeIO_decoder && decodeIO_decoder.lookup(route)) {
                return decodeIO_decoder.build(route).decode(msg.body);
            } else {
                return JSON.parse(Protocol.strdecode(msg.body));
            }

            return msg;
        };
        var handshakeInit = function (data) {
            if (data.sys && data.sys.heartbeat) {
                heartbeatInterval = data.sys.heartbeat * 1000; // heartbeat interval

                heartbeatTimeout = heartbeatInterval * 2; // max heartbeat timeout
            } else {
                heartbeatInterval = 0;
                heartbeatTimeout = 0;
            }

            initData(data);

            if (typeof handshakeCallback === 'function') {
                handshakeCallback(data.user);
            }
        };
        //Initilize data used in pomelo client
        var initData = function (data) {
            if (!data || !data.sys) {
                return;
            }

            var dictRouteToCode = data.sys.routeToCode;
            var dictCodeToRoute = data.sys.codeToRoute;
            var dictVersion = data.sys.dictVersion;
            var protos = data.sys.protos;
            var dictLocalStorage = undefined;
            //Init compress dict
            if (dictRouteToCode && dictCodeToRoute && dictVersion) {
                dict = dictRouteToCode;
                abbrs = dictCodeToRoute;
                dictLocalStorage = {
                    routeToCode: dictRouteToCode,
                    codeToRoute: dictCodeToRoute,
                    version: dictVersion
                }
            }
            var protosLocalStorage = undefined;
            //Init protobuf protos
            if (protos) {
                protosLocalStorage = protos;
                protoVersion = protos.version || 0;
                serverProtos = protos.server || {};
                clientProtos = protos.client || {}; //Save protobuf protos to localStorage
                //window.localStorage.setItem('protos', JSON.stringify(protos));

                if (!!protobuf) {
                    protobuf.init({
                        encoderProtos: protos.client,
                        decoderProtos: protos.server
                    });
                }

                if (!!decodeIO_protobuf) {
                    decodeIO_encoder = decodeIO_protobuf.loadJson(clientProtos);
                    decodeIO_decoder = decodeIO_protobuf.loadJson(serverProtos);
                }
            }

            if (dictLocalStorage) {
                window.localStorage.setItem('dicts', JSON.stringify(dictLocalStorage));


            }

            if (protosLocalStorage) {
                window.localStorage.setItem('protos', JSON.stringify(protosLocalStorage));
                // console.log(JSON.stringify(protosLocalStorage))
            }
        };

        module.exports = pomelo;
    })();
});
pomeloRequire.register("./local/boot", function (exports, module) {
    var Emitter = pomeloRequire('component~emitter@master');
    window.EventEmitter = Emitter;
    var protocol = pomeloRequire('netease~pomelo-protocol@master');
    window.Protocol = protocol;
    var protobuf = pomeloRequire('pomelonode~pomelo-protobuf@master');
    window.protobuf = protobuf;
    var pomelo = pomeloRequire('pomelonode~pomelo-jsclient-websocket@master');
    window.pomelo = pomelo;
});
pomeloRequire("./local/boot");