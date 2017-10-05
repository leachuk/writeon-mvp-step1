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

  if (targetHost !== null && targetHost !== undefined && targetHost !== "") {
    var articleDb = config.dbNameArticles;
    var usersDb = config.dbNameUsers;
    var targetDbArticleUrl = "http://" + config.couchadminusername + ":" + config.couchadminpassword + "@" + targetHost + "/" + articleDb;
    var sourceDbArticleUrl = "http://" + config.couchadminusername + ":" + config.couchadminpassword + "@localhost:" + config.couchport + "/" + articleDb;
    var targetDbUserUrl = "http://" + config.couchadminusername + ":" + config.couchadminpassword + "@" + targetHost + "/" + usersDb;
    var sourceDbUserUrl = "http://" + config.couchadminusername + ":" + config.couchadminpassword + "@localhost:" + config.couchport + "/" + usersDb;

    //replicate users
    nano.db.replication.enable(sourceDbUserUrl, targetDbUserUrl,
      {
        //create_target: true,
        continuous: true
      },
      function (err, body) {
        if (!err) {
          console.log(body);
        } else {
          console.log(err);
        }
    });

    //replicate main test documents
    nano.db.replication.enable(articleDb, targetDbArticleUrl,
      {
        //create_target: true,
        continuous: true
      },
      function (err, body) {
        if (!err) {
          console.log(body);
        } else {
          console.log(err);
        }
    });

  }
};

exports.DbUtils = new DbUtils;
