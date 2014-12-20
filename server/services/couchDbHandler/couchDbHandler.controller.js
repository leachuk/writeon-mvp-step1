'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');

var couchnano = require("nano")(config.couchuri)

exports.index = function(req, res) {
  //res.json([]);
  res.send("<p>text out</p>")
};

exports.createNewUserDatabase = function createNewUserDatabase(dbname,useremail,userpassword,res){
//When a user signs up, create a new database for them and grant them r/w access
	var dbname = useremail;
	//dbname is to be the email address with @ converted to $ (couchdb requirement)
	var dbname = dbname.replace("@","$"); 
	//replace '.' with '+'
	var dbname = dbname.replace(".","+");
	
	console.log("createNewUserDatabase: dbname["+ dbname +"], useremail["+ useremail +"], userpassword["+ userpassword +"]");
	
	
	
	//create user in _users table
	var _users = couchnano.use("_users");
	var json = {"_id":"org.couchdb.user:" + useremail,"name":useremail,"roles":[],"type":"user","password":userpassword};
	_users.insert(json, "", function(error, body, headers){
		if (error) {
			console.log(error.message);
			return res.status(error["status-code"]).send(error.message);
			//response.send(error.message, error["status-code"]);			
		}
		console.log(body);		
	});

	//create db for user
	couchnano.db.create(dbname, function(error, body, headers){
		if (error) {
			console.log(error.message);
			return res.status(error["status-code"]).send(error.message);
		}
		console.log(body);
		//response.send(body, 200);
		res.status(200).send(body);
	});

	//update the db security object
	var usersecurity = couchnano.use(dbname);
	var json = {"admins":{"names":[],"roles":[]},"members":{"names":[useremail],"roles":[]}};
	usersecurity.insert(json, "_security", function(error, body, headers){
		if (error) {
			console.log("create user error");
			console.log(error.message);
			return response.status(error["status-code"]).send(error.message);
			//response.send(error.message, error["status-code"]);
		}
		console.log("no create error");
		console.log(body);
			
	});	
};

exports.getUser = function (req, res){
  var username = req.body.username;
  console.log(username);
  var _users = couchnano.db.use('_users');
  _users.get('org.couchdb.user:' +  username, function(err, body) {
    if (!err) {
      console.log(body);
      return res.status(200).send(body);
    }else{
      console.log(err);
      return res.status(404).send('user name not found');
    }
  });  
};

function CouchDBService(){};//to go at top of file
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

function ServiceTest() {	

};
ServiceTest.prototype.testService = function(text) {
    return "hello" + text;
};
exports.ServiceTest = new ServiceTest;





