var Article = function (obj) {
    var self = this;

    if (!obj) {
        self.Title = null;
        self.BodyText = null;
        self.AuthorName = null;
        self.AuthorEmail = null;
        self.CreatedDate = null;
        self.LastUpdatedDate = null;
        self.LastUpdatedDateFormatted = null;

    } else {
        self = obj;
    }

    return self;
}