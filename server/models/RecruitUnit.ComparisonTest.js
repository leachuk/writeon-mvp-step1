var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var cookie = "";

console.log("In RecruitUnit.Comparison model");

var initCookie = function (setcookie, options) {
  // Initialize here
  cookie = setcookie;
  schema = new Schema('nano', {url: config.couchuri + '/' + config.dbNameArticles, cookie: cookie}); //set couchdb documents directory
  console.log("cookie:" + cookie);
  console.log("options:");
  console.log(options);

  var returnModelObj = {
    id: 					    { type: String },
    model: 					  { type: String }, //auto populated. Doesn't require submitted data
    roleType:   			{ type: JSON   },
    payBracketLower:  { type: Number },
    skills: 	        { type: String },
    authorName: 			{ type: String },
    createdDate: 			{ type: Number,  default: Date.now }
  }

  console.log("returnModelObj");
  console.log(returnModelObj);

  ComparisonTest = schema.define('RecruitUnitComparisonTest', returnModelObj);
  return ComparisonTest;
};
//module.exports = Article;
module.exports = initCookie;
