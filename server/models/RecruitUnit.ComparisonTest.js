var appDir = require('path').dirname(require.main.filename);

var config = require(appDir + '/config/environment');
var Schema = require('jugglingdb').Schema;
var cookie = "";

console.log("In RecruitUnit.Comparison model");

var initCookie = function (setcookie, options) {
  // Initialize here
  cookie = setcookie;
  var schema = new Schema('nano', {url: config.couchuri + '/' + config.dbNameArticles, cookie: cookie}); //set couchdb documents directory
  console.log("cookie:" + cookie);
  console.log("options:");
  console.log(options);

  var returnModelObj = {
    id: 					    { type: String },
    title:       			{ type: String },
    description: 			{ type: String },
    model: 					  { type: String }, //auto populated. Doesn't require submitted data
    roleType:   			{ type: JSON   },
    locationDescription: { type: JSON   },
    payBracketLower:  { type: JSON },
    skills: 	        { type: JSON },
    authorEmail: 			{ type: String },
    published:        { type: Boolean },
    createdDate: 			{ type: Number,  default: Date.now }
  }

  console.log("returnModelObj");
  console.log(returnModelObj);

  var ComparisonTest = schema.define('RecruitUnitComparisonTest', returnModelObj);
  return ComparisonTest;
};
//module.exports = Article;
module.exports = initCookie;
