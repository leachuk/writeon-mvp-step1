var User = function (obj) {
    var self = this;

    self.Email = obj.email ? obj.email : null;
    self.Name = obj.name ? obj.name : null;
    self.CreatedDate = obj.createdDate ? obj.createdDate : null;
    self.Roles = obj.roles ? obj.roles : null;

    return self;
}

module.exports = User;
