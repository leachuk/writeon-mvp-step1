'use strict';
var Joi = require('joi');
var errorMessage400 = "Invalid request parameters";

var signUpSchema = Joi.object().keys({
  email: Joi.string().email().max(100).required(),
  jobRole: Joi.string().valid(['developer','recruiter']).required(),
  displayName: Joi.string().alphanum().min(3).max(100).required(),
  password: Joi.string().min(3).max(100).required(),
  key: Joi.string().min(3).max(100).required()
});

function UserValidationService(){};

UserValidationService.prototype.signup = function(){
  return function(req, res, next) {
    console.log("UserValidationService: signup");

    Joi.validate(req.body, signUpSchema, function (err, value) {
      if (!err){
        next();
      } else {
        console.log("Validation error: " + err.message);
        return(res.status(400).send(new Error(errorMessage400).message));
      }
    });
  }
}

exports.UserValidationService = new UserValidationService;
