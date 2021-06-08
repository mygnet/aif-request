import FormData from 'form-data'
import { Aes } from 'aif-cipher'
import { createWriteStream } from 'fs'
import { get as getHttp } from 'http'
import { get as getHttps } from 'https'

/**
  * validate the format of an email address is correct
  * @param {string} url email address
  * @returns returns success if correct
 */
export function validUrl(url) {
  return /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/i.test(url)
}
/**
  * parse a url getting values separately
  * @param {string} url email address
  * @returns returns a json object with the url data
 */
export function parseUrl(url) {
  const m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/)
  const r = {
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
  }
  if (r.protocol.length === 2) {
    r.protocol = 'file:///' + r.protocol.toUpperCase()
    r.origin = r.protocol + '//' + r.host
  }
  const p = { 'https:': 443, 'http:': 80, 'ftp:': 21, 'ws:': 80, 'wss:': 443 }
  r.port = r.port || p[r.protocol] || ''
  r.href = r.origin + r.pathname + r.search + r.hash
  return m && r
}
/**
  * Make the answer of a requets
  * @param {http.IncomingMessage} res request result object
  * @param {object} opts Options to configure
  * @param {function} callback Function that is invoked at the end of the process
 */
function response(res, opts, callback) {
  let err = null
  if (!res) return callback(null, new Error('an error occurred with the answer'))
  if (res.statusCode !== 200) {
    res.resume()
    return callback(null, new Error('Request Failed. Status Code: ' + res.statusCode))
  }
  const chuck = []
  res.on('data', function(d) {
    chuck.push(d)
  }).on('end', function() {
    let d = Buffer.concat(chuck).toString()
    if (opts.secret) {
      try {
        d = Aes.decode(d, opts.secret, opts.token)
      } catch (er) {
        d = null
        err = er
      }
    }
    if (d && opts.type === 'json') {
      if (opts.secret || /^application\/json/.test(res.headers['content-type'])) {
        try {
          d = JSON.parse(d)
        } catch (er) {
          d = null
          err = er
        }
      } else {
        d = null
        err = new Error('Invalid content-type.\n' +
          'Expected application/json but received ' + res.headers['content-type'])
      }
    }
    callback(d, err)
  })
}

/**
  * Make a request to a url
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {object} opts Options
  * @param {function} callback Method that is invoked at the end of the process
 */
export function send(url, data, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
  }
  opts = opts || {}
  if (validUrl(url)) {
    const form = new FormData()
    if (opts.secret) {
      for (const key in data) {
        if (typeof data[key] === 'object' &&
          typeof data[key]._read === 'function' &&
          typeof data[key]._readableState === 'object') {
          form.append(key, data[key])
        } else {
          form.append(key, Aes.encode(data[key], opts.secret, opts.token))
        }
      }
    } else {
      for (const key in data) form.append(key, data[key])
    }
    form.submit(url, function(er, res) {
      if (er) callback(null, er)
      else response(res, opts, callback)
    })
  } else callback(null, 'url not valid')
}

/**
  * Make a POST request with data encryption, waiting for a json result
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */
export function postCryptJson(url, data, secret, token, callback) {
  callback = typeof token === 'function' ? token : callback
  token = typeof token === 'string' ? token : ''
  send(url, data, { type: 'json', secret: secret, token: token }, callback)
}
/** 
  * Make a POST request with data encryption
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */
export function postCrypt(url, data, secret, token, callback) {
  callback = typeof token === 'function' ? token : callback
  token = typeof token === 'string' ? token : ''
  send(url, data, { secret: secret, token: token }, callback)
}
/**
  * Make a POST request waiting for a json result
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {function} callback Method that is invoked at the end of the process
 */
export function postJson(url, data, callback) {
  send(url, data, { type: 'json' }, callback)
}
/**
  * Make a POST request
  * @param {string} url Email address
  * @param {object} data Data to be sent
  * @param {function} callback Method that is invoked at the end of the process
 */
export function post(url, data, callback) {
  send(url, data, callback)
}
/**
  * Make a GET request
  * @param {string} url Email address
  * @param {object} opts Configuration options
  * @param {function} callback Method that is invoked at the end of the process
 */
export function content(url, opts, callback) {
  callback = typeof opts === 'function' ? opts : callback
  opts = typeof opts === 'object' ? opts : {}
  url = parseUrl(url)
  if (url) {
    const get = url.protocol === 'https:' ? getHttps : getHttp
    get(url.href, (res) => {
      response(res, opts, callback)
    }).on('error', (err) => {
      callback(null, err)
    })
  } else {
    callback(null, new Error('url not valid: '))
  }
}

/**
  * Make a GET request
  * @param {string} url Email address
  * @param {function} callback Method that is invoked at the end of the process
 */
export function get(url, callback) {
  content(url, callback)
}
/**
  * Make a GET request with json result
  * @param {string} url Email address
  * @param {function} callback Method that is invoked at the end of the process 
 */
export function getJson(url, callback) {
  content(url, { type: 'json' }, callback)
}
/** 
  * Make a GET request with data encryption
  * @param {string} url Email address
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */
export function getCrypt(url, secret, token, callback) {
  content(url, { secret: secret, token: token }, callback)
}
/** 
  * Make a request of type GET with data encryption, waiting for a JSON result
  * @param {string} url Email address
  * @param {string} secret secret word for encryption
  * @param {string} token Token that will be used to initialize the encryption verctor
  * @param {function} callback Method that is invoked at the end of the process
 */
export function getCryptJson(url, secret, token, callback) {
  content(url, { type: 'json', secret: secret, token: token }, callback)
}

/**
  * Download a file from a remote hist
  * @param {string} url Email address
  * @param {string} dst Destination path for download
  * @param {function} callback Method that is invoked at the end of the process
 */
export function download(url, dst, callback) {
  url = parseUrl(url)
  if (url) {
    const get = url.protocol === 'https:' ? getHttps : getHttp
    get(url.href, (response) => {
      const file = createWriteStream(dst)
      response.pipe(file)
      file.on('finish', () => {
        file.close(() => {
          callback(true)
        })
      })
    }).on('error', (err) => {
      callback(null, err)
    })
  } else {
    callback(null, new Error('url not valid'))
  }
}
