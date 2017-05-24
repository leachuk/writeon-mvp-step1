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

app.use(require('express-status-monitor')());

require('./config/express')(app);

//setup datadog before routes
const dd_options = {
  'dogstatsd':  new (require("node-dogstatsd")).StatsD("localhost", null, null, {}),
  'response_code':true,
  'tags': ['app:writeon-api-node-local']
};
app.use(require('connect-datadog')(dd_options));

require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  console.log('DATADOG_HOST env var:' + process.env.DATADOG_HOST);
});

// Expose app
exports = module.exports = app;
