# aif-request

## Métodos para realizar solicitudes de datos a un ser vidores web.

Métodos sencillos para realizar solicitudes de datos a un ser vidores web mediante los métodos POST, GET, ademas que se implementa el cifrado de datos con algoritmo AES tanto para el envío como la llegada de los datos.

### Instalación

Descargue la biblioteca con npm / yarn, desde sus archivos locales.

Vía NPM:

    $ npm install aif-request
    
Vía YARN:

    $ yarn add aif-request

### Uso
La biblioteca se puede incluir en su código a través de importaciones de CommonJS o ES.

ES2015 (ES6):
```javascript
import * as cipher from "aif-request";
```
CommonJS:
```javascript
var cipher = require("aif-request");
```

Con las importaciones de ES también es posible usar componentes individuales. Por ejemplo:
```javascript
import { get, post } from "aif-request";
```

 #### Methods

* **get** (*url*, *callback*)  
*Devuelve en la función **callback** el contenido del cuerpo de la página, dada la **url***  

* **post** (*url*, *data*, *callback*)  
*Envía el **data** que puede contener campos y archivos a la **url** y devuelve en la función **callback** el contenido del cuerpo de la página como respuesta.* 

* **download** (*url*, *dst*, *callback*)  
*Descarga un archivo de la **url** y lo almacena en la ruta **dst**, en caso de éxito devuelve true en la función **callback**.*

Por ejemplo:

```javascript
const fs = require('fs');
const rq = require("aif-request");
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
 
```

#### Recibir respuesta como un JSON
* **getJson** (*url*, *callback*)  
*Devuelve en la función **callback** un JSON de la respuesta de la **url***  

* **postJson** (url*, *data*, *callback*)  
*Envía el **data** que puede contener datos y archivos a la **url**  y devuelve en la función **callback** un JSON como respuesta.

Por ejemplo:
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

#### Enviar datos cifrados
* **getCrypt** (*url*, *secret*, [*token*], *callback*)  
*Devuelve en la función **callback** un de la respuesta de 
la **url**, solo que antes de enviarse y al recibir los 
datos se cifran  con una llave **secret** y **token**, este 
último es opcional y debe de ser de 32 caracteres, si no 
se define se genera uno y se adjunta al contenido que se envía.*

* **postCrypt** (url*, *data*, *callback*)
*Envía el **data** que puede contener datos y archivos a la **url**, 
solo que antes de enviarse y al recibir los datos se cifran  
con una llave **secret** y **token**, este último es opcional y 
debe de ser de 32 caracteres, si no se define se genera uno y 
se adjunta al contenido que se envía, y solo se cifraran los 
campos, los archivos que se agreguen pasarán en el formato de 
archivos.*

**Nota.** *El cifrado es totalmente transparente para el usuario, 
solo que en el servidor tendrán que descifrar los datos.*

Por ejemplo:

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

Por ejemplo en envios por POST a un servidor con PHP:

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

como respuesta de forma cifrada en PHP:
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
*En ambos casos el token se genera, pero también se podría que se 
usará uno de autentificación y 
manejar un canal seguro mientras dura la sesión.*

#### Cifrado con respuesta JSON
* **getCryptJson** (*url*, *secret*, [*token*], *callback*)

* **postCryptJson**(*url*, *data*, *secret*, [*token*], *callback*)  

similar a los anteriores pero con respuesta de un json.


**Note.**
*Para todas estos métodos en caso de error, devuelve como segundo parámetro el objeto de Error.*
## Tests

    $ npm test

o bien 

    $ yarn test

## build

    $ npm run build

o bien

    $ yarn build



## Información de contacto de seguridad

Para informar vulnerabilidades de seguridad, utilice el siguiente link: https://github.com/mygnet/aif-request/issues

---
[npm-image]: https://img.shields.io/npm/v/aif-request.svg
[npm-url]: https://www.npmjs.com/package/aif-request