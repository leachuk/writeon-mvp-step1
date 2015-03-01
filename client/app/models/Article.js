var Article = function (obj) {
    var self = this;
    //frontend model needs to map to backend model
    self._id =  obj.title ? obj.title : null; //set to title. Will eventually need to convert this to an url friendly format
    self.title = obj.title ? obj.title : null;
    self.bodyText = obj.bodyText ? obj.bodyText : null;
    self.authorName = obj.authorName ? obj.authorName : null;
    self.authorEmail = obj.authorEmail ? obj.authorEmail : null;
    self.createdDate = obj.createdDate ? obj.createdDate : null;
    self.lastUpdatedDate = obj.lastUpdatedDate ? obj.lastUpdatedDate : null;
    self.lastUpdatedDateFormatted = obj.lastUpdatedDateFormatted ? obj.lastUpdatedDateFormatted : null;
    self.titleImagePath = obj.titleImagePath ? obj.titleImagePath : null;

    return self;
}