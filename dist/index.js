'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a};exports.__esModule=!0;exports.validUrl=validUrl,exports.parseUrl=parseUrl,exports.send=send,exports.postCryptJson=postCryptJson,exports.postCrypt=postCrypt,exports.postJson=postJson,exports.post=post,exports.content=content,exports.get=get,exports.getJson=getJson,exports.getCrypt=getCrypt,exports.getCryptJson=getCryptJson,exports.download=download;var _formData=require('form-data'),_formData2=_interopRequireDefault(_formData),_aifCipher=require('aif-cipher'),_fs=require('fs'),_http=require('http'),_https=require('https');function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}
/**
  * validate the format of an email address is correct
  * @param {string} url email address
  * @returns returns success if correct
 */function validUrl(url){return /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/i.test(url)}
/**
  * parse a url getting values separately
  * @param {string} url email address
  * @returns returns a json object with the url data
 */function parseUrl(url){var a=url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),b={hash:a[10]||'',// #asd
host:a[3]||'',// localhost:257
hostname:a[6]||'',// localhost
href:a[0]||'',// http://username:password@localhost:257/deploy/?asd=asd#asd
origin:a[1]||'',// http://username:password@localhost:257
pathname:a[8]||(a[1]?'/':''),// /deploy/
port:a[7]||'',// 257
protocol:a[2]||'',// http:
search:a[9]||'',// ?asd=asd
username:a[4]||'',// username
password:a[5]||''// password
};2===b.protocol.length&&(b.protocol='file:///'+b.protocol.toUpperCase(),b.origin=b.protocol+'//'+b.host);return b.port=b.port||{"https:":443,"http:":80,"ftp:":21,"ws:":80,"wss:":443}[b.protocol]||'',b.href=b.origin+b.pathname+b.search+b.hash,a&&b}
/**
  * Make the answer of a requets
  * @param {http.IncomingMessage} res request result object
  * @param {object} opts Options to configure
  * @param {function} callback Function that is invoked at the end of the process
 */function response(res,opts,callback){var a=null;if(!res)return callback(null,new Error('an error occurred with the answer'));if(200!==res.statusCode)return res.resume(),callback(null,new Error('Request Failed. Status Code: '+res.statusCode));var b=[];res.on('data',function(a){b.push(a)}).on('end',function(){var c=Buffer.concat(b).toString();if(opts.secret)try{c=_aifCipher.Aes.decode(c,opts.secret,opts.token)}catch(b){c=null,a=b}if(c&&'json'===opts.type)if(opts.secret||/^application\/json/.test(res.headers['content-type']))try{c=JSON.parse(c)}catch(b){c=null,a=b}else c=null,a=new Error('Invalid content-type.\nExpected application/json but received '+res.headers['content-type']);callback(c,a)})}
/**
  * Make a request to a url
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {object} opts Options
  * @param {function} callback Method that is invoked at the end of the process
 */function send(url,data,opts,callback){if('function'==typeof opts&&(callback=opts),opts=opts||{},validUrl(url)){var a=new _formData2.default;if(opts.secret)for(var b in data)'object'===_typeof(data[b])&&'function'==typeof data[b]._read&&'object'===_typeof(data[b]._readableState)?a.append(b,data[b]):a.append(b,_aifCipher.Aes.encode(data[b],opts.secret,opts.token));else for(var c in data)a.append(c,data[c]);a.submit(url,function(a,res){a?callback(null,a):response(res,opts,callback)})}else callback(null,'url not valid')}
/**
  * Make a POST request with data encryption, waiting for a json result
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */function postCryptJson(url,data,secret,token,callback){callback='function'==typeof token?token:callback,token='string'==typeof token?token:'',send(url,data,{type:'json',secret:secret,token:token},callback)}
/** 
  * Make a POST request with data encryption
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */function postCrypt(url,data,secret,token,callback){callback='function'==typeof token?token:callback,token='string'==typeof token?token:'',send(url,data,{secret:secret,token:token},callback)}
/**
  * Make a POST request waiting for a json result
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {function} callback Method that is invoked at the end of the process
 */function postJson(url,data,callback){send(url,data,{type:'json'},callback)}
/**
  * Make a POST request
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {function} callback Method that is invoked at the end of the process
 */function post(url,data,callback){send(url,data,callback)}
/**
  * Make a GET request
  * @param {string} url Email address
  * @param {object} opts Configuration options
  * @param {function} callback Method that is invoked at the end of the process
 */function content(url,opts,callback){if(callback='function'==typeof opts?opts:callback,opts='object'===('undefined'==typeof opts?'undefined':_typeof(opts))?opts:{},url=parseUrl(url),url){var a='https:'===url.protocol?_https.get:_http.get;a(url.href,function(res){response(res,opts,callback)}).on('error',function(a){callback(null,a)})}else callback(null,new Error('url not valid: '))}
/**
  * Make a GET request
  * @param {string} url Email address
  * @param {function} callback Method that is invoked at the end of the process
 */function get(url,callback){content(url,callback)}
/**
  * Make a GET request with json result
  * @param {string} url Email address
  * @param {function} callback Method that is invoked at the end of the process 
 */function getJson(url,callback){content(url,{type:'json'},callback)}
/** 
  * Make a GET request with data encryption
  * @param {string} url Email address
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */function getCrypt(url,secret,token,callback){content(url,{secret:secret,token:token},callback)}
/** 
  * Make a request of type GET with data encryption, waiting for a JSON result
  * @param {string} url Email address
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */function getCryptJson(url,secret,token,callback){content(url,{type:'json',secret:secret,token:token},callback)}
/**
  * Download a file from a remote hist
  * @param {string} url Email address
  * @param {string} dst Destination path for download
  * @param {function} callback Method that is invoked at the end of the process
 */function download(url,dst,callback){if(url=parseUrl(url),url){var a='https:'===url.protocol?_https.get:_http.get;a(url.href,function(a){var b=(0,_fs.createWriteStream)(dst);a.pipe(b),b.on('finish',function(){b.close(function(){callback(!0)})})}).on('error',function(a){callback(null,a)})}else callback(null,new Error('url not valid'))}