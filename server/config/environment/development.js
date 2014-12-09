'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/writeonmvpstep1-dev'
  },
  couch:{
    adminusername : "admin",
    adminpassword : "admin",
    hostname : "127.0.0.1",
	port : 5984
  },

  seedDB: true
};
