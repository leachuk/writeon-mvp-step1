/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);

//digital dog
var dd_options = {
  'response_code':true,
  'tags': ['app:writeon']
}
var connect_datadog = require('connect-datadog')(dd_options);
//Add the datadog-middleware before your router
app.use(connect_datadog);

require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
