var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;

console.log("In User model");

var init = function (options) {
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
    id: 		    { type: String},
    email:     	{ type: String},
    name:       { type: String}, //Schema.Text can be used for large strings
    createdDate:{ type: Number,  default: Date.now },
    createdDateFormatted:{ type: String},
    lastUpdatedDate:{ type: Number,  default: Date.now },
    lastUpdatedDateFormatted:{ type: String},
    roles:      { type: String, default: []},
    type:       { type: String, default: "user"}
  } : { //partial model
    id: 		    { type: String},
    email:     	{ type: String},
    name:       { type: String},
    roles:      { type: String, default: []},
    type:       { type: String, default: "user"}
  };

  console.log("returnModelObj");
  console.log(returnModelObj);

  User = schema.define('User', returnModelObj);
  return User;
};
//module.exports = Article;
module.exports = init;
