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
  // couchDbHandlers.authenticate(function(req, res){
  //   console.log(res);
  // });
  var couchService = couchDbHandlers.CouchDBService;
  //console.log(couchService.authenticate(req));
  couchService.authenticate(req);
  console.log("out authenticate");
  //var test = couchDbHandlers.ServiceTest;
  //console.log(test.testService("tetteet"));
};