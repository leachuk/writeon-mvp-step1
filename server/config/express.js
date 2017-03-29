/**
 * Express configuration
 */

'use strict';
var couchdbBootstrap = require('couchdb-bootstrap');
var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var expressJwt = require('express-jwt');
var JWT_SECRET = "wqfl3rlk2l4kRED";

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  app.set('secret', JWT_SECRET);
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());

  // Add headers to allow remote API calls
  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    //TODO: Add a whitelist array and check that req.headers.origin is in there before setting Access-Control-Allow-Origin.
    //      This allows us to control who can access the API.
    if (typeof req.headers.origin != 'undefined'){
      //console.log("check ORIGIN:" + req.headers.origin);
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });

  //Set secured routes which require authentication
  app.use('/api', expressJwt({secret : JWT_SECRET}).unless({path: ['/api/things',
                                                                   '/api/users/authenticate',
                                                                   '/api/users/signup',
                                                                   '/api/users/signin',
                                                                   '/api/auths/checktoken',
                                                                   '/api/auths/getuser',
                                                                   new RegExp('/api/articles/.*'),//temp non secured
                                                                   new RegExp('/api/recruitunit/.*'),//temp non secured
                                                                   '/services/couchDbHandler']}));



  if ('production' === env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev')); //whats this for?
    app.use(errorHandler()); // Error handler - has to be last

    console.log("attempting couchdb bootstrap");
    couchdbBootstrap('http://admin:admin@mycouchdb-1:5984', 'couchdb', function(error, response) {
      if (error) {
        console.log("couchdb bootstrap error:");
        console.log(error);
      } else {
        console.log("couchdb bootstrap success:");
        console.log(response);
      }
    })
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    console.log("attempting couchdb bootstrap");
    couchdbBootstrap('http://admin:admin@localhost:5984', 'couchdb', function(error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log(response);
      }
    })
  }
};
