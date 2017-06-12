'use strict';

var appDir = require('path').dirname(require.main.filename);
var config = require(appDir + '/config/environment');
var nano = require("nano")(config.couchuriadmin);

function DbUtils(){};

DbUtils.prototype.convertToDbName = function(inName){
	console.log("in convertToDbName");
	console.log(inName);

	var dbName = inName;
	//dbName is to be the email address with @ converted to $ (couchdb requirement)
	var dbName = dbName.replace("@","$");
	//replace '.' with '+'
	var dbName = dbName.replace(".","+");

	return dbName;
};

DbUtils.prototype.enableDatabaseContinuousReplication = function(targetHost){
  console.log("in enableDatabaseContinuousReplication");
  console.log("targetHost:" + targetHost);

  var articleDb = config.dbNameArticles;
  var usersDb = config.dbNameUsers;
  var targetDbArticleUrl = targetHost + "/" + articleDb;
  var targetDbUserUrl = targetHost + "/" + userDb;

  nano.db.replicate(usersDb, targetDbUserUrl,
    { create_target: true,
      continuous: true },
    function(err, body) {
      if (!err) {
        console.log(body);
      } else {
        console.log(err);
      }
  });
};

exports.DbUtils = new DbUtils;
