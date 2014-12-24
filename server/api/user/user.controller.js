'use strict';

require('rootpath')();
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var authHandlers = require('server/api/auth/auth.controller');

//create user database on signup
exports.signup = function(req, res) {
  var useremail = req.body.email;
  var userpassword = req.body.password;
  var databasename = useremail;

  console.log("Signup with email["+ useremail +"], password["+ userpassword +"]");
  
  //refactor into servive. Include use-case where user already exists.
  couchDbHandlers.createNewUserDatabase(databasename,useremail,userpassword, res);
  
  res.send("Signup with email["+ useremail +"], password["+ userpassword +"]");
};

//testing authentication endpoint
exports.testgetuser = function(req, res){
  console.log("in testgetuser");
  couchDbHandlers.getUser(req, res);
};


exports.authenticate = function(req, res){
  console.log("in users.authenticate");
  var token = req.body.token;
  console.log(token);
  //var decodedToken = null;

  var authService = authHandlers.AuthService;
  authService.decodetoken(req, token, function(result){
    res.json(result);
  });
  //todo refactor to extract token from header


  //var profile = {username: username,ip: clientip};
  // We are encoding the profile inside the token
  //var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60 * 5 });

}

//sign in a user. differs from authenticate as this is a user driven action, i.e. via login form.
//generates a unique jwt for subsequent requests
exports.signin = function(req, res){
  console.log("in signin");
  var username = req.body.username;
  var password = req.body.password;
  var clientip = req.ip;
  var couchService = couchDbHandlers.CouchDBService;

  couchService.authenticate(username, password, function(err, result){
    if (!err){
      console.log("success");
        var profile = { username: result.name,
                        ok: result.ok,
                        roles: result.roles,
                        ip: clientip };
        // We are encoding the profile inside the token
        var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60 * 5 });
        res.json({ token: token });
    }else{
      console.log("error:" + err);
      res.status(401).send(err.message);
    }
  });

};
