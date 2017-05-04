'use strict';
var Joi = require('joi');

var schema = Joi.object().keys({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
  email: Joi.string().email().required()
});

function UserValidationService(){};

UserValidationService.prototype.signup = function(){
  return function(req, res, next) {
    console.log("UserValidationService: signup");
    console.log(req.body);

    return next();
  }
}

exports.UserValidationService = new UserValidationService;
