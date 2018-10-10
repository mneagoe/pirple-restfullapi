// Dependencies
const http = require('http');

const server = http.createServer(function (req, res) {
  res.end('hola mundo\n');
})

server.listen(3000, function () {
  console.log('Server listening on port 3000');
})
