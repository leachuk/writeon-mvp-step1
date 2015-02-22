var config = require('server/config/environment');
var Schema = require('jugglingdb').Schema;
var schema = new Schema('nano', {url: config.couchuriadmin + '/article_documents'}); //find way of connecting as user, rather than admin
// define models 
var Article = schema.define('Article', {
    title:     { type: String, length: 255 },
    content:   { type: Schema.Text },
    date:      { type: Date,    default: function () { return new Date;} },
    createdDate: { type: Number,  default: Date.now },
    published: { type: Boolean, default: false, index: true }
});

module.exports = Article;