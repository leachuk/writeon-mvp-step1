'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');
var UserModel = require('server/models/User');
var _dbUtils = require('server/services/dbUtil/dbUtil.controller').DbUtils;

var authHandlers = require('server/services/auth/auth.controller');

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

CouchDBService.prototype.createNewUserDatabase = function(useremail, userpassword, res, func_callback){
//When a user signs up, create a new database for them and grant them r/w access
	var dbname = dbNameArticles;
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
	  //   createUserDb: function(callback){
	  //   	var returnMessage = {};
			// //create db for user
			// couchnano.db.create(dbname, function(error, body, headers){
			// 	if (error) {
			// 		console.log(error.message);
			// 		//return res.status(error["status-code"]).send(error.message);
			// 		returnMessage["ok"] = false;
			// 		returnMessage["userDbCreatedMessage"] = error.message;
			// 	} else {
			// 		returnMessage["ok"] = true;
			// 	}
			// 	console.log(body);
			// 	callback(null,returnMessage);
			// 	//response.send(body, 200);
			// 	//res.status(200).send(body);

			// });
	  //   },
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

CouchDBService.prototype.getUser = function(username, callback){
  console.log("couchdb service getUser, username: " + username);
  var _users = couchnano.db.use('_users');
  _users.get('org.couchdb.user:' +  username, function(err, body) {
    if (!err) {
      console.log(new UserModel(body));
      callback(null, new UserModel(body));
    }else{
      console.log(err);
      callback(err, null);
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

		callback(err, body, headers);
	});
};

//Article and Content Services
CouchDBService.prototype.saveArticle = function(tablename, jsondata, doctitle, callback){
	console.log("in CouchDBService, saveArticle");
	console.log(jsondata);
	console.log(tablename);

	var dbtable = dbNameArticles;
	var _userDb = couchnano.use(dbtable); //todo replace with users dbname
	_userDb.insert(jsondata, doctitle, function (err, body, headers){
		if(!err) {
			console.log(body);
		}else{
			console.log(err);
		}

		callback(err, body);
	});
};

CouchDBService.prototype.getArticle = function(type, id, callback){
	var dbtable = dbNameArticles;
	var db = couchnano.use(dbtable);
	db.get(id, { revs_info: true, revisions: true }, function(err, body) {
	  if (!err) {
	    console.log(body);
	  }else{
	  	console.log(err);
	  }

	  callback(err, body);
	});
};

CouchDBService.prototype.listAllUserArticles = function(username, callback){
	//var listResultJson = null;
	//var listResultArray = [];
	var dbtable = dbNameArticles;
	var db = couchnano.use(dbtable);
	db.list(function(err, body) {
		if (!err) {
			// body.rows.forEach(function(doc) {
			//   listResultArray.push(doc);
			//   console.log(doc);
			// });
			console.log(body);
		}else{
			console.log(err);
		}

    	callback(err, body);
	});
};

CouchDBService.prototype.updateArticle = function(username, docname, fieldparam, valueparam, callback) {
//change to batch field/param update. looks like an array of json objects can be passed.
	var dbtable = dbNameArticles;
	var db = couchnano.use(dbtable);
    console.log("node params. docname["+ docname +"], field["+ fieldparam +"], value["+ valueparam +"]");
    var returnbody = null;
    db.atomic("example",
        "in-place",
        docname,
        [{field: fieldparam, value: valueparam},{field: "field2", value: "field2foo"}],
        function (err, body) {
            if (!err) {
                console.log(body);
            }else{
                console.log(err);
            }

            callback(err, body);
        });
    
};

CouchDBService.prototype.insertArticle = function(username, docname, field, value, callback) {
	var dbtable = dbNameArticles;
	var db = couchnano.use(dbtable);
	var json = {fieldfoo: value};

	db.insert(json, docname, function (err, body) {
    if(!err) {
    	console.log(body);
    } else {
		console.log(err);
    }
    // db.insert({foo: "bar", "_rev": body.rev}, "foobar", 
    // function (error, response) {
    //   if(!error) {
    //     console.log("it worked");
    //   } else {
    //     console.log("sad panda");
    //   }
    // });
    callback(err, body);
  });
};

CouchDBService.prototype.testCookie = function(req, res, func_callback) {
	console.log("In testCookie");
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var authService = authHandlers.AuthService;
	var clientip = req.ip;
	var returnSuccess = null;
	var returnError = null;

	async.series({
	    authenticateToken: function(callback){
			if (parts.length == 2) {
				var scheme = parts[0];
				var credentials = parts[1];

				if (/^Bearer$/i.test(scheme)) {
				    token = credentials;
				    
				    authService.decodetoken(req, token, function(result){
				      if (result == null){
				        console.log("Invalid token");
				        return next(new Error("Bad token. Permission denied."));
				        callback(new Error("Bad token. Permission denied."),null);
				      } else {
				        returnSuccess = result;
				        callback(null,result);
				      }
				    });
				} else {
				  console.log("Invalid Authorization Header. Format is Authorization: Bearer [token]");
				  return next(new Error('Invalid Authorization Header. Format is Authorization: Bearer [token]'));
				  returnError = new Error('Invalid Authorization Header. Format is Authorization: Bearer [token]');
				  callback(returnError,null);
				}
				} else {
				console.log("Format is Authorization: Bearer [token]");
				return next(new UnauthorizedError('credentials_bad_format', {
				  message : 'Format is Authorization: Bearer [token]'
				}));
				returnError = new UnauthorizedError('credentials_bad_format', {
				  message : 'Format is Authorization: Bearer [token]'
				});
				callback(returnError,null);
			}
			console.log(returnSuccess.cookie);
	    },
	    getSessionWithCookie: function(callback){
			var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
			var returnSuccess2 = null;
			var returnError2 = null;
			couchsetup.session(function(err, session) {
				if (!err) {
					returnSuccess2 = session;
					console.log(session);
					console.log('user is %s and has these roles: %j',
						session.userCtx.name, session.userCtx.roles);
				} else {
					returnError2 = err;
				}
				callback(returnError2, returnSuccess2);
			});	
	    }
	},
	function(err, results) {
	    // results is now equal to: {one: 1, two: 2}
	    console.log(results);
	    func_callback(err, results);
	});

};

exports.CouchDBService = new CouchDBService;






