'use strict';

var appDir = require('path').dirname(require.main.filename);

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
    "assertRangeGreaterThan" : assertRangeGreaterThan,
    "assertLessThan" : assertLessThan,
    "assertStringContains" : assertStringContains,
    "assertArrayContains" : assertArrayContains
  }

  var results = [];
  var isPass = false;
  var isPartialPass = false;
  var sourceDocId = comparisonJson.id;
  //loop over sourceJson and get the keys
  _.forEach(sourceJson, function(value, key) {
    //console.log("key:" + key, "value:" + value);
    var foundJson = _.get(comparisonJson, key);
    if (foundJson !== undefined && sourceJson[key]['rule'] !== undefined && !sourceJson[key]['disabled']) {
      //console.log("[" + key + "]:" + foundJson + ",rule[" + sourceJson[key]['rule'] + "], compare to source [" + sourceJson[key]['value'] + "]");

      var sourceRule = sourceJson[key]['rule'];
      var sourceParam = key;
      var testMethod = comparisonTests[sourceRule];
      if(sourceRule=="assertRangeGreaterThan"){
        results.push({"field": sourceParam, "rule": sourceRule, "result": testMethod(comparisonJson['payBracketLower'],comparisonJson['payBracketUpper'],sourceJson[key]['value'])});
      } else {
        results.push({"field": sourceParam, "rule": sourceRule, "result": testMethod(sourceJson[key]['value'],foundJson)});
      }
    }
  });
  //add isPass and isPartialPass property to test result
  isPass = _.every(results, ['result', true]);
  isPartialPass = (isPass === false) && (_.find(results, {'result': true}) !== undefined);

  results = {'docId': sourceDocId, 'isPass': isPass, 'isPartialPass': isPartialPass, 'results': results};
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
  console.log("assertGreaterThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"], result["+ (sourceValue >= comparisonValue) +"]");

  return (sourceValue >= comparisonValue);
}

function assertLessThan(sourceValue, comparisonValue){
  console.log("assertLessThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"], result["+ (sourceValue < comparisonValue) +"]");

  return (sourceValue <= comparisonValue);
}

function assertRangeGreaterThan(sourceLowerValue, sourceUpperValue, comparisonValue){
  console.log("assertRangeGreaterThan: sourceLowerValue["+ sourceLowerValue +"], sourceUpperValue["+ sourceUpperValue +"], comparisonValue["+ comparisonValue +"], result["+ ((sourceLowerValue <= comparisonValue && sourceUpperValue >= comparisonValue) || sourceLowerValue >= comparisonValue) +"]");

  return ((sourceLowerValue <= comparisonValue && sourceUpperValue >= comparisonValue) || sourceLowerValue >= comparisonValue);
}

function assertEqualTo(sourceValue, comparisonValue){
  console.log("assertEqualTo: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  return (sourceValue.toLowerCase() === comparisonValue.toLowerCase());
}

function assertStringContains(sourceValue, comparisonValue){
  console.log("assertStringContains: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  var matchExists = false;
  var wordArray = _.words(comparisonValue.toLowerCase());
  console.log("   wordArray:" + wordArray);

  _.forEach(sourceValue, function(value, key){
    console.log("   value:"+ value +", key:" + key);
    matchExists = _.indexOf(wordArray, value.toLowerCase()) != -1;
    if(matchExists){
      console.log("   matchExists:" + matchExists);
      return !matchExists; //exit loop when match found i.e. return false
    }
  })
  console.log("   returning:" + matchExists);
  return matchExists;
}

function assertArrayContains(sourceValue, comparisonValue){
  console.log("assertArrayContains: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  var matchExists = false;
  var wordArray = _.values(_.mapValues(comparisonValue, _.method("toLowerCase")));
  console.log("   wordArray:" + wordArray);

  _.forEach(sourceValue, function(value, key){
    console.log("   value:"+ value +", key:" + key);
    matchExists = _.indexOf(wordArray, value.toLowerCase()) != -1;
    if(matchExists){
      console.log("   matchExists:" + matchExists);
      return false; //exit loop when match found
    }
  })
  console.log("   returning:" + matchExists);
  return matchExists;
}

exports.Service = new RecruitUnitUtilityService;
