'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.validUrl = validUrl;
exports.parseUrl = parseUrl;
exports.send = send;
exports.postCryptJson = postCryptJson;
exports.postCrypt = postCrypt;
exports.postJson = postJson;
exports.post = post;
exports.content = content;
exports.get = get;
exports.getJson = getJson;
exports.getCrypt = getCrypt;
exports.getCryptJson = getCryptJson;
exports.download = download;

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _aifCipher = require('aif-cipher');

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { stream } from 'stream'
var getHttp = require('http').get;
var getHttps = require('https').get;

function validUrl(value) {
  return (/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/i.test(value)
  );
}

function parseUrl(url) {
  var m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/);
  var r = {
    hash: m[10] || '', // #asd
    host: m[3] || '', // localhost:257
    hostname: m[6] || '', // localhost
    href: m[0] || '', // http://username:password@localhost:257/deploy/?asd=asd#asd
    origin: m[1] || '', // http://username:password@localhost:257
    pathname: m[8] || (m[1] ? '/' : ''), // /deploy/
    port: m[7] || '', // 257
    protocol: m[2] || '', // http:
    search: m[9] || '', // ?asd=asd
    username: m[4] || '', // username
    password: m[5] || '' // password
  };
  if (r.protocol.length === 2) {
    r.protocol = 'file:///' + r.protocol.toUpperCase();
    r.origin = r.protocol + '//' + r.host;
  }
  var p = { 'https:': 443, 'http:': 80, 'ftp:': 21, 'ws:': 80, 'wss:': 443 };
  r.port = r.port || p[r.protocol] || '';
  r.href = r.origin + r.pathname + r.search + r.hash;
  return m && r;
}

function response(res, opts, callback) {
  var err = null;
  if (!res) return callback(null, new Error('an error occurred with the answer'));
  if (res.statusCode !== 200) {
    res.resume();
    return callback(null, new Error('Request Failed. Status Code: ' + res.statusCode));
  }
  var chuck = [];
  res.on('data', function (d) {
    chuck.push(d);
  }).on('end', function () {
    var d = Buffer.concat(chuck).toString();
    if (opts.secret) {
      try {
        d = _aifCipher.Aes.decode(d, opts.secret, opts.token);
      } catch (er) {
        d = null;
        err = er;
      }
    }
    if (d && opts.type === 'json') {
      if (opts.secret || /^application\/json/.test(res.headers['content-type'])) {
        try {
          d = JSON.parse(d);
        } catch (er) {
          d = null;
          err = er;
        }
      } else {
        d = null;
        err = new Error('Invalid content-type.\n' + 'Expected application/json but received ' + res.headers['content-type']);
      }
    }
    callback(d, err);
  });
}

function send(url, data, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
  }
  opts = opts || {};
  if (validUrl(url)) {
    var form = new _formData2.default();
    if (opts.secret) {
      for (var key in data) {
        if (_typeof(data[key]) === 'object' && typeof data[key]._read === 'function' && _typeof(data[key]._readableState) === 'object') {
          form.append(key, data[key]);
        } else {
          form.append(key, _aifCipher.Aes.encode(data[key], opts.secret, opts.token));
        }
      }
    } else {
      for (var _key in data) {
        form.append(_key, data[_key]);
      }
    }
    form.submit(url, function (er, res) {
      if (er) callback(null, er);else response(res, opts, callback);
    });
  } else callback(null, 'url not valid');
}

function postCryptJson(url, data, secret, token, callback) {
  callback = typeof token === 'function' ? token : callback;
  token = typeof token === 'string' ? token : '';
  send(url, data, { type: 'json', secret: secret, token: token }, callback);
}

function postCrypt(url, data, secret, token, callback) {
  callback = typeof token === 'function' ? token : callback;
  token = typeof token === 'string' ? token : '';
  send(url, data, { secret: secret, token: token }, callback);
}

function postJson(url, data, callback) {
  send(url, data, { type: 'json' }, callback);
}

function post(url, data, callback) {
  send(url, data, callback);
}

function content(url, opts, callback) {
  callback = typeof opts === 'function' ? opts : callback;
  opts = (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object' ? opts : {};
  url = parseUrl(url);
  if (url) {
    var _get = url.protocol === 'https:' ? getHttps : getHttp;
    _get(url.href, function (res) {
      response(res, opts, callback);
    }).on('error', function (err) {
      callback(null, err);
    });
  } else {
    callback(null, new Error('url not valid: '));
  }
}

function get(url, callback) {
  content(url, callback);
}

function getJson(url, callback) {
  content(url, { type: 'json' }, callback);
}

function getCrypt(url, secret, token, callback) {
  content(url, { secret: secret, token: token }, callback);
}

function getCryptJson(url, secret, token, callback) {
  content(url, { type: 'json', secret: secret, token: token }, callback);
}

function download(url, dst, callback) {
  url = parseUrl(url);
  if (url) {
    var _get2 = url.protocol === 'https:' ? getHttps : getHttp;
    _get2(url.href, function (response) {
      var file = (0, _fs.createWriteStream)(dst);
      response.pipe(file);
      file.on('finish', function () {
        file.close(function () {
          callback(true);
        });
      });
    }).on('error', function (err) {
      callback(null, err);
    });
  } else {
    callback(null, new Error('url not valid'));
  }
}