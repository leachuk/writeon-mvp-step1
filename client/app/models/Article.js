var Article = function (obj) {
    var self = this;

    self.Title = obj.Title ? obj.Title : null;
    self.BodyText = obj.BodyText ? obj.BodyText : null;
    self.AuthorName = obj.AuthorName ? obj.AuthorName : null;
    self.AuthorEmail = obj.AuthorEmail ? obj.AuthorEmail : null;
    self.CreatedDate = obj.CreatedDate ? obj.CreatedDate : null;
    self.LastUpdatedDate = obj.LastUpdatedDate ? obj.LastUpdatedDate : null;
    self.LastUpdatedDateFormatted = obj.LastUpdatedDateFormatted ? obj.LastUpdatedDateFormatted : null;
    self.TitleImagePath = obj.TitleImagePath ? obj.TitleImagePath : null;

    return self;
}