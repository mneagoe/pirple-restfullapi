// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer((req, res) => {
  // Get the URL and parse interval
  let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  let queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  let method = req.method.toLowerCase();

  // Get the headers as an object
  let headers = req.headers;

  // Get the payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose the hanlder this request should got to. If one is not found, use the notFound handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct data object to send to the handler
    let data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload' : buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the response path
      console.log('Returning this response: ', statusCode, payloadString);
    });

  });

});

// Start the server, and hjave it listen on port 3000
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Define the handlers
let handlers = {};

// Sample handler
handlers.sample = function (data, callback) {
  // Callback a http status code, and a payload object
  callback(406, {'name': 'sample handler'});
}

// Not found handlers
handlers.notFound = function (data, callback) {
  callback(404);
}

// Define a request router
let router = {
  'sample' : handlers.sample
}
