'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);
var async = require('async');

function CouchDBService(){};

CouchDBService.prototype.asyncTest = function(value1, value2, func_callback){
	console.log("in async test");
	async.series({
	    one: function(callback){
	        setTimeout(function(){
	            callback(null, 1);
	        }, 200);
	    },
	    two: function(callback){
	        setTimeout(function(){
	            callback(null, 2);
	        }, 100);
	    }
	},
	function(err, results) {
	    // results is now equal to: {one: 1, two: 2}
	    console.log(results);
	    func_callback(results);
	});
};

CouchDBService.prototype.createNewUserDatabase = function(dbname, useremail, userpassword, res, func_callback){
//When a user signs up, create a new database for them and grant them r/w access
	var dbname = useremail;
	//dbname is to be the email address with @ converted to $ (couchdb requirement)
	var dbname = dbname.replace("@","$"); 
	//replace '.' with '+'
	var dbname = dbname.replace(".","+");

	//var returnMessage = {};
	
	console.log("createNewUserDatabase: dbname["+ dbname +"], useremail["+ useremail +"], userpassword["+ userpassword +"]");
	
	async.series({
	    createUser: function(callback){
	    	//create user in _users table
	    	var returnMessage = {};
			var _users = couchnano.use("_users");
			var json = {"_id":"org.couchdb.user:" + useremail,"name":useremail,"roles":[],"type":"user","password":userpassword};
			_users.insert(json, "", function(error, body, headers){
				if (error) {
					console.log(error.message);
					returnMessage["ok"] = false;
					returnMessage["createUserMessage"] = error.message;
					//return res.status(error["status-code"]).send(error.message);
					//response.send(error.message, error["status-code"]);			
				} else {
					returnMessage["ok"] = true;
				}
				console.log(body);	
				callback(null,returnMessage);	
			});
	    },
	    createUserDb: function(callback){
	    	var returnMessage = {};
			//create db for user
			couchnano.db.create(dbname, function(error, body, headers){
				if (error) {
					console.log(error.message);
					//return res.status(error["status-code"]).send(error.message);
					returnMessage["ok"] = false;
					returnMessage["userDbCreatedMessage"] = error.message;
				} else {
					returnMessage["ok"] = true;
				}
				console.log(body);
				callback(null,returnMessage);
				//response.send(body, 200);
				//res.status(200).send(body);

			});
	    },
	    createUserSecurity: function(callback){
	    	var returnMessage = {};
			//update the db security object
			var usersecurity = couchnano.use(dbname);
			var json = {"admins":{"names":[],"roles":[]},"members":{"names":[useremail],"roles":[]}};
			usersecurity.insert(json, "_security", function(error, body, headers){
				if (error) {
					console.log("create user error");
					console.log(error.message);
					//return response.status(error["status-code"]).send(error.message);
					returnMessage["ok"] = false;
					returnMessage["userSecurityCreatedMessage"] = error.message;
					//response.send(error.message, error["status-code"]);
				} else {
					returnMessage["ok"] = true;
				}
				console.log(body);	
				callback(null,returnMessage);	
			});	
	    }
	},
	function(err, results) {
	    // results is now equal to: {one: 1, two: 2}
	    console.log(results);
	    func_callback(results);
	});

};

CouchDBService.prototype.getUser = function(req, res, callback){
  var username = req.body.username;
  console.log(username);
  var _users = couchnano.db.use('_users');
  _users.get('org.couchdb.user:' +  username, function(err, body) {
    if (!err) {
      console.log(body);
      callback(null, body);
      //return res.status(200).send(body);
    }else{
      console.log(err);
      callback(err, null);
      //return res.status(404).send('user name not found');
    }
  });  
};

CouchDBService.prototype.authenticate = function(username, password, callback){
	var username = username;
	var password = password;
	console.log("username:" + username);
	couchnano.auth(username, password, function (err, body, headers) {
		console.log("in couchnano.auth");
		//console.log(body);
		if (!err) {
			console.log(headers);
		}else{
			console.log(err);
			//return err.message;
		}

		if (headers && headers['set-cookie']) {
		//cookies[user] = headers['set-cookie'];
		}

		callback(err,body);
	});
};
exports.CouchDBService = new CouchDBService;






