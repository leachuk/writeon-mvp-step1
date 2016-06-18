'use strict';

require('rootpath')()
var _ = require('lodash');

function RecruitUnitUtilityService(){};

// ********************************************************************************************************************************** //
//
// Comparison Services
//
// ********************************************************************************************************************************** //

RecruitUnitUtilityService.prototype.compare = function(sourceJson, comparisonJson, func_callback){
  console.log("in RecruitUnitUtilityService, compare");
  //console.log("sourceJson:");
  //console.log(sourceJson);
  //console.log("comparisonJson:");
  //console.log(comparisonJson);

  var comparisonTests = {
    "assertEqualTo" : assertEqualTo,
    "assertGreaterThan" : assertGreaterThan,
    "assertLessThan" : assertLessThan,
    "assertArrayContains" : assertArrayContains
  }

  var results = [];
  var isPass = false;
  var isPartialPass = false;
  //loop over sourceJson and get the keys
  _.forEach(sourceJson, function(value, key) {
    console.log("key:" + key, "value:" + value);
    var foundJson = _.get(comparisonJson, key);
    if (foundJson !== undefined && sourceJson[key]['rule'] !== undefined) {
      console.log("[" + key + "]:" + foundJson + ",rule[" + sourceJson[key]['rule'] + "], compare to source [" + sourceJson[key]['value'] + "]");

      var sourceRule = sourceJson[key]['rule'];
      var sourceParam = key;
      var testMethod = comparisonTests[sourceRule];
      results.push({"field": sourceParam, "rule": sourceRule, "result": testMethod(sourceJson[key]['value'],foundJson)});
      //add isPass and isPartialPass property to test result
      isPass = _.every(results, ['result', true]);
      isPartialPass = (isPass === false) && (_.find(results, {'result': true}) !== undefined);
    }
  });


  results = {'isPass': isPass, 'isPartialPass': isPartialPass, 'results': results};
  //console.log("comparison results");
  //console.log(results);
  func_callback(null, results);//do error check
};

// ********************************************************************************************************************************** //
//
// Private Test Functions
//
// ********************************************************************************************************************************** //

function assertGreaterThan(sourceValue, comparisonValue){
  console.log("assertGreaterThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"], result["+ (sourceValue > comparisonValue) +"]");

  return (comparisonValue > sourceValue);
}

function assertLessThan(sourceValue, comparisonValue){
  console.log("assertLessThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"], result["+ (sourceValue > comparisonValue) +"]");

  return (comparisonValue < sourceValue);
}

function assertEqualTo(sourceValue, comparisonValue){
  console.log("assertEqualTo: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  return (sourceValue.toLowerCase() === comparisonValue.toLowerCase());
}

function assertArrayContains(sourceValue, comparisonValue){
  console.log("assertArrayContains: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  var matchExists = false;
  var wordArray = _.words(comparisonValue);
  console.log("wordArray:" + wordArray);

  _.forEach(sourceValue, function(value, key){
    console.log("value:"+ value +", key:" + key);
    matchExists = _.indexOf(wordArray, value) != -1;
    return !matchExists; //exit loop when match found
  })

  return matchExists;
}

exports.Service = new RecruitUnitUtilityService;
