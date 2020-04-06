# aif-request

## Methods to make data requests to a web servers.

Simple methods to make data requests to a web server using the POST, GET methods, and the data encryption with AES algorithm is implemented for both the sending and the arrival of the data.

### Installation

Download the library with npm / Yarn, from your local files.

Via NPM:

    $ npm install aif-request
    
Via YARN:

    $ yarn add aif-request

### Use
The library can be included in your code through imports from CommonJS or ES.

ES2015 (ES6):
```javascript
import online from "aif-request";
```
CommonJS:
```javascript
var online = require("aif-request");
```
With ES imports it is also possible to use individual components. For example:
```javascript
import { post, get } from "aif-request";
```

#### Methods
* **get** (*url*, *callback*)  
 *Returns in function the **callback** the content of the body of the page given the **url***  

* **post** (*url*, *data*, *callback*)  
*Sends **data** that can contain data and files to the **url** and returns the content of the page body in response to the **callback** function.  

* **download** (*url*, *dst*, *callback*)  
It downloads a file from the **url** and stores it in the path **dst**, in case of success it returns true in the **callback** function.

For example:

```javascript
const rq = require("aif-request");
const fs = require('fs');
const url = 'http://localhost/test'

rq.get(url + '/index.php', function(rs, err) {
  console.log('---------------------------------')
  console.log('method get', rs, err && err.toString())
})

rq.post(url + '/post.php', { 
  id: 'X9918',
  'file': fs.createReadStream('data/photo.jpg')
  }, function(rs, err) {
    console.log('------------------------------')
    console.log('method post', rs, err && err.toString())
})

rq.download(url + '/file.zip', './data', function(rs, err) {
  console.log('------------------------------')
  console.log('method dowmload', rs, err && err.toString())
})
```

#### Receive json data
* **getJson** (*url*, *callback*)  
*Returns in the ** callback ** function a JSON of the response from the **url***  

* **postJson** (*url*, *data*, *callback*)  
*Sends the **data** that can contain data and files to the ** url ** and returns a JSON in the **callback** function as a response.*

For example:
```javascript
const rq = require("aif-request");
const url = 'http://localhost/test'

rq.getJson(url + '/data.json', function(rs, err) {
  console.log('---------------------------------')
  console.log('method get json', rs, err && err.toString())
})

rq.postJson(url + '/post-json.php', { id: 'X9918' }, function(rs, err) {
  console.log('------------------------------')
  console.log('method post json', rs, err && err.toString())
})
```

#### Use of data encryption
* **getCrypt** (*url*, *secret*, [*token*], *callback*)  
*Returns in the **callback** function a response from the **url**, only that before sending and receiving the data they are encrypted with a **secret** and **token** key, the latter is optional and must be 32 characters, if not defined one is generated and attached to the content that is sent.*

* **postCrypt** (*url*, *data*, *secret*, [*token*], *callback*)    
*Sends the **data** that can contain data and files to the **url**, only that before sending and receiving the data they are encrypted with a **secret** and **token** key, The latter is optional and must be 32 characters, if not defined, one is generated and attached to the content that is sent, and only the fields will be encrypted, the files that are added will be sent without encryption.*

**Note.** *Encryption is completely transparent to the user, only the data will have to be decrypted on the server.*

For example:
```javascript
const rq = require("aif-request");
const url = 'http://localhost/test'

rq.getCrypt(url + '/crypt.json', '-secret-', function(rs, err) {
  console.log('---------------------------------')
  console.log('method get crypt', rs, err && err.toString())
})

rq.postCrypt(url + '/post-crypt.php', { id: 'X9918' }, '-secret-', function(rs, err) {
  console.log('------------------------------')
  console.log('method post crypt', rs, err && err.toString())
})
```
For example in POST sending to a server with PHP:
```php
<?php
$data = $_POST['id'];
$key = '-secret-';
$token = substr($data, 0, 32);
$data = substr($data, 32);
$iv = substr($token,0,16);
$key = md5($key.$token);
$id = openssl_decrypt(base64_decode($data), 'aes-256-cbc', $key, true, $iv);
})
```

as a response in encrypted form in PHP
```php
<?php
$data = 'Hello word';
$key = '-secret-';
$token = md5($key.uniqid(microtime()));
$iv = substr($token,0,16);
$key = md5($key.$token);
$res = $token.base64_encode(openssl_encrypt($data, 'aes-256-cbc', $key, true, $iv));
die($res);
```

In both cases the token is generated, but you could also use an 
authentication token and handle a secure channel for the duration of the session.

#### use of data encryption and json
* **getCryptJson** (*url*, *secret*, [*token*], *callback*)

* **postCryptJson**(*url*, *data*, *secret*, [*token*], *callback*)  

similar to the previous ones but with a json response.

**Note.**
*For all these methods in case of error, returns the Error object as the second parameter.*

## Tests

    $ npm test

O well

    $ yarn test

## build

    $ npm run build

O well

    $ yarn build



## Security contact information

To report security vulnerabilities, use the following link: https://github.com/mygnet/aif-request/issues

---
[npm-image]: https://img.shields.io/npm/v/aif-request.svg
[npm-url]: https://www.npmjs.com/package/aif-request