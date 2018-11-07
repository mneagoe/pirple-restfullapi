/*
* Helpers for various tasks
*/

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// Container for all helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
  if(typeof(str) == 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLenght) {
  strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
  if(strLenght) {
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(i = 1; i <= strLenght; i++) {
      // Get random character from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;

  } else {
    return false;
  }
}

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
  // Validate the parameters
  phone = typeof(phone) === 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  
  if(phone && msg) {
    // Configure request payload
    let payload = {
      From: config.twilio.fromPhone,
      To: `+5411${phone}`,
      Body: msg,
    };

    // Stringify the payload
    let stringPayload = querystring.stringify(payload);

    // Configure the request details
    let requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.accoutSid}/Messages.json`,
      auth: `${config.twilio.accoutSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-length': Buffer.byteLength(stringPayload),
      }
    };

    // Instantiate the request object
    let req = https.request(requestDetails, function(res) {
      // Grab the status of the sent request
      let status = res.statusCode;
      // Callback successfully if the request went through
      if(status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind the the error event so it doesn't get throw
    req.on('error', function(e) {
      callback(e);
    })
    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
}

// Export the module
module.exports = helpers;
