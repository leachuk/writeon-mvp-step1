var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var schema = new Schema('nano', {url: config.couchuriadmin + '/article_documents'}); //find way of connecting as user, rather than admin
// define models 
var Article = schema.define('Article', {
	_id: 		{ type: String}, 
    title:     	{ type: String, length: 255 },
    bodyText:   { type: Schema.Text }, //Text is used for large strings
    authorName: { type: String },
    authorEmail:{ type: String},
    createdDate:{ type: Number,  default: Date.now },
    createdDateFormatted:{ type: String},
    published: 	{ type: Boolean, default: false, index: true }
});

module.exports = Article;