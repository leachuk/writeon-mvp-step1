'use strict';

// Development specific configuration
// ==================================
var _couch = {
    "adminusername" : "admin",
    "adminpassword" : "admin",
    "hostname" : "127.0.0.1",
    "port" : 5984
};

module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/writeonmvpstep1-dev'
  },
  couchuriadmin: "http://" + _couch.adminusername
                      + ":" + _couch.adminpassword
                      + "@" + _couch.hostname
                      + ":" + _couch.port,
  couchuri: "http://" + _couch.hostname
                      + ":" + _couch.port,
  seedDB: true,
  dbNameArticles: "article_documents",
  dbNameProjects: "loom_project_files"
};

//console.log = function(){}; //disable all console output to speed up response time. Might not make much difference.
