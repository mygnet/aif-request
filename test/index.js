const rq = require('../dist/index')

const url = 'http://localhost/truth/Api/test'

rq.get(url + '/index.php', function(rs, err) {
  console.log('---------------------------------')
  console.log('method get', rs, err && err.toString())
})
rq.post(url + '/post.php', { id: 'X9918' }, function(rs, err) {
  console.log('------------------------------')
  console.log('method post', rs, err && err.toString())
})
rq.download(url + '/file.zip', './data', function(rs, err) {
  console.log('------------------------------')
  console.log('method dowmload', rs, err && err.toString())
})
