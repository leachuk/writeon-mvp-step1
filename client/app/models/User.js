var User = function (obj) {
    var self = this;

    self.Email = obj.Email ? obj.Email : null;
    self.Name= obj.Name ? obj.Name : null;
    self.CreatedDate= obj.CreatedDate ? obj.CreatedDate : null;
    self.Roles= obj.Roles ? obj.Roles : null;

    return self;
}
