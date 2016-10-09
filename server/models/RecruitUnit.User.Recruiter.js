var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;

console.log("In User model");

var init = function (model, options) {
  // Initialize here
  // Must use admin user, not cookie auth, as _users is only accessible by admin. May need alternative approach, e.g. create a seperate user table
  schema = new Schema('nano', {url: config.couchuriadmin + '/_users'});
  console.log("options:");
  console.log(options);

  var returnAllData = true;
  if (typeof options != 'undefined' && options != null) {
    if (typeof options.returnAll != 'undefined') {
      returnAllData = options.returnAll === 'true' || options.returnAll === true;
    }
  }
  console.log("returnAllData:" + returnAllData);

  var returnModelObj = returnAllData ? { //full model
    id: 		    { type: String},//TODO:use dbUtils to convert to valid name //couchdb user document requirement
    name:       { type: String}, //couchdb requirement
    roles:      { type: String, default: ["editor", "recruiter"]}, //couchdb requirement
    type:       { type: String, default: "user"}, //couchdb requirement. Must be 'user'
    userGuid:   { type: String},
    email:     	{ type: String},
    displayName:{ type: String},
    createdDate:{ type: Number,  default: Math.floor(Date.now()/1000) },
    createdDateFormatted: { type: String},
    lastUpdatedDate: { type: Number,  default: Math.floor(Date.now()/1000) },
    lastUpdatedDateFormatted: { type: String},
    password: {type: String}
  } : { //partial model. Shouldn't be needed as the full model doesn't contain large data sets
    id: 		    { type: String}, //couchdb user document requirement
    name:       { type: String}, //couchdb requirement
    roles:      { type: String, default: ["editor", "recruiter"]}, //couchdb requirement
    type:       { type: String, default: "user"}, //couchdb requirement. Must be 'user'
    userGuid:   { type: String},
    email:     	{ type: String},
    displayName:{ type: String}
  };

  console.log("returnModelObj");
  console.log(returnModelObj);

  User = schema.define('RecruitUnitUser', returnModelObj);
  return User;
};
//module.exports = Article;
module.exports = init;
