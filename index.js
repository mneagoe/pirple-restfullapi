// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers')


// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`Server listening on port ${ config.httpPort }`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`Server listening on port ${ config.httpsPort }`);
});

// All the server logic for both the http and https server
const unifiedServer = function (req, res) {
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
      'payload': helpers.parseJsonToObject(buffer),
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
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the response path
      console.log('Returning this response: ', statusCode, payloadString);
    });

  });
}

// Define a request router
let router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
}
