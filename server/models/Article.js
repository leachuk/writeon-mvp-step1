var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var cookie = "";
//var schema = new Schema('nano', {url: config.couchuriadmin + '/article_documents'}); //find way of connecting as user, rather than admin
//AuthSession=d3JpdGVvbm12cHN0ZXAxLTFAdGVzdC5jb206NTUwNTQ3MkE6G9gbqSnKj9b4qoHdjDEPZvK4ALc; Version=1; Expires=Mon, 16-Mar-2015 00:04:32 GMT; Max-Age=99999; Path=/; HttpOnly
console.log("In Article model");

// var schema = new Schema('nano', {url: config.couchuri + '/article_documents', cookie: cookie});

// // define models 
// var Article = schema.define('Article', {
// 	_id: 		{ type: String}, 
//     title:     	{ type: String, length: 255 },
//     bodyText:   { type: Schema.Text }, //Text is used for large strings
//     authorName: { type: String },
//     authorEmail:{ type: String},
//     createdDate:{ type: Number,  default: Date.now },
//     createdDateFormatted:{ type: String},
//     published: 	{ type: Boolean, default: false, index: true }
// });

var initCookie = function (setcookie) {
    // Initialize here
    cookie = setcookie;
    schema = new Schema('nano', {url: config.couchuri + '/article_documents', cookie: cookie});
    console.log("cookie:" + cookie);
    
    Article = schema.define('Article', {
		_id: 		{ type: String}, 
	    title:     	{ type: String, length: 255 },
	    bodyText:   { type: Schema.Text }, //Text is used for large strings
	    authorName: { type: String },
	    authorEmail:{ type: String},
	    createdDate:{ type: Number,  default: Date.now },
	    createdDateFormatted:{ type: String},
	    published: 	{ type: Boolean, default: false, index: true }
	});
    return Article;
};
//module.exports = Article;
module.exports = initCookie;