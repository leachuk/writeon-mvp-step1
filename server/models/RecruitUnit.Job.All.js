var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var cookie = "";

console.log("In RecruitUnitJobItem model");

var initCookie = function (setcookie, options) {
    // Initialize here
    cookie = setcookie;
    schema = new Schema('nano', {url: config.couchuri + '/' + config.dbNameArticles, cookie: cookie}); //set couchdb documents directory
    console.log("cookie:" + cookie);
    console.log("options:");
    console.log(options);

    var returnModelObj = {
		  id: 					    { type: String},
		  model: 					  { type: String},
	    jobDescription:   { type: String, length: 255 },
	    roleType:   			{ type: String },
      payBracketLower:  { type: Number},
      payBracketUpper:  { type: Number},
	    locationDescription:    { type: String},
      location:         { type: String},
	    skills: 	        { type: JSON},
	    authorName: 			{ type: String },
	    authorEmail:    	{ type: String},
	    createdDate: 			{ type: Number,  default: Math.floor(Date.now()/1000) },
	    createdDateFormatted:   { type: String},
	    lastUpdatedDate: 	{ type: Number,  default: Math.floor(Date.now()/1000) },
	    lastUpdatedDateFormatted:{ type: String},
	    published: 	 			{ type: Boolean, default: false, index: true },
      submitTo:         { type: String},
      displayDevEmail: 	{ type: Boolean, default: false, index: true }
	}

	console.log("returnModelObj");
	console.log(returnModelObj);

    JobItem = schema.define('RecruitUnitJobItem', returnModelObj);
    return JobItem;
};
//module.exports = Article;
module.exports = initCookie;
