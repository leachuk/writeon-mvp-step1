var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;

console.log("In User model");

var init = function (model, options) {
  // Initialize here
  //cookie = setcookie; //connect to db as user via cookie
  schema = new Schema('nano', {url: config.couchuriadmin + '/_users'});
  console.log("options:");
  console.log(options);

  //console.log("typeof options.returnAll" + typeof options.returnAll)
  var returnAllData = true;
  if (typeof options != 'undefined') {
    if (typeof options.returnAll != 'undefined') {
      returnAllData = options.returnAll === 'true' || options.returnAll === true;
    }
  }
  console.log("returnAllData:" + returnAllData);

  var returnModelObj = returnAllData ? { //full model
    id: 		    { type: String, default : "org.couchdb.user:" + model.email},//TODO:use dbUtils to convert to valid name //couchdb user document requirement
    name:       { type: String}, //couchdb requirement
    roles:      { type: String, default: []}, //couchdb requirement
    type:       { type: String, default: "user"}, //couchdb requirement. Must be 'user'
    email:     	{ type: String},
    displayName:{ type: String},
    jobRole:    { type: String},
    createdDate:{ type: Number,  default: Date.now },
    createdDateFormatted: { type: String},
    lastUpdatedDate: { type: Number,  default: Date.now },
    lastUpdatedDateFormatted: { type: String}
  } : { //partial model. Shouldn't be needed as the full model doesn't contain large data sets
    id: 		    { type: String, default : "org.couchdb.user:" + model.email}, //couchdb user document requirement
    name:       { type: String}, //couchdb requirement
    roles:      { type: String, default: []}, //couchdb requirement
    type:       { type: String, default: "user"}, //couchdb requirement. Must be 'user'
    email:     	{ type: String},
    displayName:{ type: String}
  };

  console.log("returnModelObj");
  console.log(returnModelObj);

  User = schema.define('User', returnModelObj);
  return User;
};
//module.exports = Article;
module.exports = init;
