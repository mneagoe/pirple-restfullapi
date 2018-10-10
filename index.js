// Dependencies
const http = require('http');
const url = require('url');

const server = http.createServer(function (req, res) {

  // Get the URL and parse interval
  let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Send the response
  res.end('hola mundo\n');

  // Log the response path
  console.log(`Request received on path: ${ trimmedPath }`);

});

// Start the server, and hjave it listen on port 3000
server.listen(3000, function () {
  console.log('Server listening on port 3000');
});
