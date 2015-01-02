'use strict';

function DbUtils(){};

DbUtils.prototype.convertToDbName = function(inName){
	console.log("in convertToDbName");

	var dbName = inName;
	//dbName is to be the email address with @ converted to $ (couchdb requirement)
	var dbName = dbName.replace("@","$"); 
	//replace '.' with '+'
	var dbName = dbName.replace(".","+");

	return dbName;
};

exports.DbUtils = new DbUtils;