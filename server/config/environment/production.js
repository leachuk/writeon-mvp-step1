'use strict';

var path = require('path');

// Production specific configuration
// =================================
var _couch = {
  "adminusername" : "admin",
  "adminpassword" : "admin",
  "hostname" : "mycouchdb-1",
  "port" : 5984
};

module.exports = {
  root: path.normalize(__dirname + '/../../../..'),
  couchadminusername: _couch.adminusername,
  couchadminpassword: _couch.adminpassword,
  couchuriadmin: "http://" + _couch.adminusername
                           + ":" + _couch.adminpassword
                           + "@" + _couch.hostname
                           + ":" + _couch.port,
  couchuri: "http://" + _couch.hostname
                      + ":" + _couch.port,
  seedDB: true,
  dbNameArticles: "article_documents",
  dbNameProjects: "loom_project_files",
  dbNameUsers: "_users",
  redisHost: "redisdb",
  redisPort: "6379"
};
