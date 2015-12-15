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
		id: 					{ type: String},
		model: 					{ type: String},
	    jobDescription:   { type: String, length: 255 },
	    roleType:   			{ type: String }, //Text is used for large strings
      payBracketLower:  { type: Number},
      payBracketUpper:  { type: Number},
	    locationDescription: 				{ type: String},
	    requiredSkills: 	{ type: String},
	    authorName: 			{ type: String },
	    authorEmail:    	{ type: String},
	    createdDate: 			{ type: Number,  default: Date.now },
	    createdDateFormatted:   { type: String},
	    lastUpdatedDate: 	{ type: Number,  default: Date.now },
	    lastUpdatedDateFormatted:{ type: String},
	    published: 	 			{ type: Boolean, default: false, index: true }
	}

	console.log("returnModelObj");
	console.log(returnModelObj);

    JobItem = schema.define('RecruitUnitJobItem', returnModelObj);
    return JobItem;
};
//module.exports = Article;
module.exports = initCookie;
