'use strict';

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

DbUtils.prototype.enableDatabaseContinuousReplication = function(sourceHost, targetHost){
  console.log("in enableDatabaseContinuousReplication");
  console.log("sourceHost:" + sourceHost + ", targetHost:" + targetHost);
};

exports.DbUtils = new DbUtils;
