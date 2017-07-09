'use strict';
var Joi = require('joi');
var errorMessage400 = "Invalid request parameters";

// ***** Schemas ***** //
var signUpSchema = Joi.object().keys({
  email: Joi.string().email().max(100).required(),
  jobRole: Joi.string().valid(['developer','recruiter']).required(),
  displayName: Joi.string().regex(/^[A-Za-z0-9 _-]+$/).min(3).max(100).required(),
  password: Joi.string().min(3).max(100).required(),
  key: Joi.string().min(3).max(100).required()
});

var signInSchema = Joi.object().keys({
  username: Joi.string().email().min(3).max(100).required(),
  password: Joi.string().min(3).max(100).required()
});

// ***** Middleware Service ****** //
function UserValidationService(){};

UserValidationService.prototype.signup = function(){
  console.log("UserValidationService: signup");
  return validatePost(signUpSchema);
}

UserValidationService.prototype.signin = function(){
  console.log("UserValidationService: signin");
  return validatePost(signInSchema);
}

// **** Private Functions ***** //
function validatePost(schema){
  return function(req, res, next) {
    Joi.validate(req.body, schema, function (err, value) {
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
