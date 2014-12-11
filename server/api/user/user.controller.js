'use strict';

require('rootpath')();
var _ = require('lodash');

var couchDbHandlers = require('server/api/couchDbHandler/couchDbHandler.controller');

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
