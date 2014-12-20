'use strict';

require('rootpath')();
var _ = require('lodash');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');

//create user database on signup
exports.signup = function(req, res) {
  var useremail = req.body.email;
  var userpassword = req.body.password;
  var databasename = useremail;

  console.log("Signup with email["+ useremail +"], password["+ userpassword +"]");
  
  couchDbHandlers.createNewUserDatabase(databasename,useremail,userpassword, res);
  
  res.send("Signup with email["+ useremail +"], password["+ userpassword +"]");
};

//testing authentication endpoint
exports.testgetuser = function(req, res){
  console.log("in testgetuser");
  couchDbHandlers.getUser(req, res);
};

//testing authentication endpoint
exports.authenticate = function(req, res){
  console.log("in authenticate");
  var username = req.body.username;
  var password = req.body.password;
  var couchService = couchDbHandlers.CouchDBService;

  couchService.authenticate(username, password, function(err, result){
    if (!err){
      console.log("success");
      res.send(result);
    }else{
      console.log("error:" + err);
      res.status(401).send(err.message);
    }
  });

};
