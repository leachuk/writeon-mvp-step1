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

function AuthService(){};
AuthService.prototype.decodetoken = function(req, token, callback) {
  console.log("in AuthService.decodetoken");
  var token = token;
  var decoded = jwt.decode(token, req.app.secret);

  callback(decoded);
};
exports.AuthService = new AuthService;