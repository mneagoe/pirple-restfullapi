/*
* Request handlers
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');


// Define the handlers
let handlers = {};

// Users
handlers.users = function(data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container fo the users submethods
handlers._users = {};

// Users - post
// Require data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out
  let firstName = typeof(data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  let lastName = typeof(data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  let password = typeof(data.payload.password) == 'string'
    && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean'
    && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, function(err, data) {
      if(err) {
        // Hash the password
        let hashedPassword = helpers.hash(password);

        if(hashedPassword) {
          // Create user object
          let userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          }

          // Store the user
          _data.create('users', userObject.phone, userObject, function(err) {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: 'A user with that phone number already exists' });
            }
          });

        } else {
          callback(500, { error: 'Could not has the user\'s password' });
        }

      } else {
        // User already exist
        callback(400, { error: 'A user with that phone number already exist' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone elses
handlers._users.get = function(data, callback) {
  // Check that the phone number provided is valid
  let phone = typeof(data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Lookup the user
    _data.read('users', phone, function(err, data) {
      if(!err && data) {
        // Remove the hashed password from user object before returning to requestor
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { error: 'Missing required field'} );
  }
};

// Users - put
// Requierd data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let authenticated user update their own object
handlers._users.put = function(data, callback) {
  // Check for the required field
  let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for the optional fields
  let firstName = typeof(data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  let lastName = typeof(data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  let password = typeof(data.payload.password) == 'string'
    && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if(phone) {
    // Error if nothing is sent to update
    if(firstName || lastName || password) {
      // Lookup the user
      _data.read('users', phone, function(err, userData) {
        if(!err && userData) {
          // Update the fields necessary
          if(firstName)   {
            userData.firstName = firstName;
          }

          if(lastName)   {
            userData.lastName = lastName;
          }

          if(password)   {
            userData.hashedPassword = helpers.hash(password);
          }

          // Store the new updates
          _data.update('users', phone, userData, function(err) {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: 'Could not update the user' })
            }
          });

        } else {
          callback(400, { error: 'The specified user does not exist' });
        }
      });
    } else {
      callback(400, { error: 'Missing fields to update' });
    }
  } else {
    callback(400, { error: 'Missing required field' });
  }
};

// Users - delete
// Requierd field: phone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data, callback) {
  // Check that the phone number is valid
  let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  if(phone) {
    // Lookup the user
    _data.read('users', phone, function(err, data) {
      if(!err && data) {
        _data.delete('users', phone, function(err) {
          if(!err) {
            callback(200);
          } else {
            callback(500, { error: 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400, { error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { error: 'Missing required field'} );
  }
};

 // Ping handlers
handlers.ping = function (data, callback) {
  callback(200);
};

// Not found handlers
handlers.notFound = function (data, callback) {
  callback(404);
};


module.exports = handlers;