var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var cookie = "";

console.log("In SocialListListItem model");

var initCookie = function (setcookie, options) {
    // Initialize here
    cookie = setcookie;
    schema = new Schema('nano', {url: config.couchuri + '/article_documents', cookie: cookie});
    console.log("cookie:" + cookie);
    console.log("options:");
    console.log(options);

    var returnModelObj = {
		id: 		{ type: String},
		model: 		{ type: String}, 
	    title:     	{ type: String, length: 255 },
	    bodyText:   { type: Schema.Text }, //Text is used for large strings
	    authorName: { type: String },
	    authorEmail:{ type: String},
	    createdDate:{ type: Number,  default: Date.now },
	    createdDateFormatted:{ type: String},
	    lastUpdatedDate:{ type: Number,  default: Date.now },
	    lastUpdatedDateFormatted:{ type: String},
	    published: 	{ type: Boolean, default: false, index: true }
	} 

	console.log("returnModelObj");
	console.log(returnModelObj);

    Article = schema.define('SocialListListItem', returnModelObj);
    return Article;
};
//module.exports = Article;
module.exports = initCookie;