var Schema = require('jugglingdb').Schema;
var schema = new Schema('nano', {url: 'http://admin:admin@127.0.0.1:5984/example'}); //port number depends on your configuration 
// define models 
var JugglingModelTest = schema.define('JugglingModelTest', {
	blaa:     { type: String, length: 255, default: "some default text" },
    title:     { type: String, length: 255 },
    content:   { type: Schema.Text },
    date:      { type: Date,    default: function () { return new Date;} },
    timestamp: { type: Number,  default: Date.now },
    published: { type: Boolean, default: false, index: true }
});

module.exports = JugglingModelTest;