'use strict';

var jwt = require('jsonwebtoken');
var _ = require('lodash');

// Get list of auths
exports.index = function(req, res) {
  res.json([]);
};

exports.checktoken = function(req, res) {  
  console.log(req.body);
  var profile = {username: 'some username'};
  // We are encoding the profile inside the token
  var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60 * 5 });
  res.json({ token: token });
};

exports.decodetoken = function(req, res) {
  var token = null;
  var parts = req.headers.authorization.split(' ');
  if (parts.length == 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
        token = credentials;
        var decoded = jwt.decode(token, req.app.secret);
        console.log(req.headers.authorization);
        var username = decoded.username;
        console.log("username from token: " + username);
        res.send(username);
    }
  } else {
    return next(new UnauthorizedError('credentials_bad_format', {
            message : 'Format is Authorization: Bearer [token]'
    }));
  }
  
  
};