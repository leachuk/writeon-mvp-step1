'use strict';

var appDir = require('path').dirname(require.main.filename);
var RecruitUnitJobDescriptionModel = require(appDir + '/models/RecruitUnit.JobDescription.js');
var RecruitUnitComparisonTestModel = require(appDir + '/models/RecruitUnit.ComparisonTest.js');
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
// Search Services
//
// ********************************************************************************************************************************** //

RecruitUnitUtilityService.prototype.getJobDescriptionSpecDocs = function(userEmail, authCookie, callback){
  console.log("RecruitUnitUtilityService getJobDescriptionSpecDocs");

  //get recruiters job item documents list
  var jobItemModelAuth = RecruitUnitJobDescriptionModel(authCookie, {returnAll: true}); //only allow recruiter to retrieve their own documents
  var jobItemSearchJson = '{"authorEmail": "' + userEmail + '"}';
  jobItemModelAuth.all({where: JSON.parse(jobItemSearchJson)}, function (err, jobItemDocResults) {
    if (!err) {
      console.log("jobItemModelAuth success result. jobItemDocResults:");
      if (jobItemDocResults.length > 0) {
        console.log(jobItemDocResults);
        callback (null, jobItemDocResults)
      } else {
        callback ("no results returned", null);
      }
    } else {
      console.log("jobItemModelAuth error");
      callback(err, null);
    }
  });
}

RecruitUnitUtilityService.prototype.getComparisonTestDocs = function(userEmail, authCookie, callback){
  console.log("RecruitUnitUtilityService getComparisonTestDocs");

  //get recruiters job item documents list
  var jobItemModelAuth = RecruitUnitComparisonTestModel(authCookie, {returnAll: true}); //only allow developer to retrieve their own documents
  var jobItemSearchJson = '{"authorEmail": "' + userEmail + '"}';
  jobItemModelAuth.all({where: JSON.parse(jobItemSearchJson)}, function (err, jobItemDocResults) {
    if (!err) {
      console.log("jobItemModelAuth success result. jobItemDocResults:");
      if (jobItemDocResults.length > 0) {
        console.log(jobItemDocResults);
        var dataCopy = [];
        _.forEach(jobItemDocResults, function(item) {
          var jsonItem = JSON.parse(JSON.stringify(item));
          delete jsonItem.authorEmail ///remove personal info before returning to client
          //Array.prototype.push.apply(dataCopy,jsonItem);
          dataCopy.push(jsonItem);
        });

        callback(null, dataCopy)
      } else if (jobItemDocResults.length == 0){
        callback(null, []);
      } else {
        callback(err, null);
      }
    } else {
      console.log("jobItemModelAuth error");
      callback(err, null);
    }
  });
}

RecruitUnitUtilityService.prototype.getMangoSelectorFromJobItem = function(jobItemResults, callback){
  console.log("RecruitUnitUtilityService getMangoSelectorFromJobItem");
  var selectorJson = {};
  if (jobItemResults.length == 0) {
    callback(null, [])
  } else if(jobItemResults !== 'undefined' && jobItemResults !== null && (jobItemResults[0].model === "RecruitUnitJobDescription" || jobItemResults[0].model === "RecruitUnitComparisonTest")) {
    //todo: don't forget to handle multiple job description documents from the recruiter.
    //doing now.
    //hacky mchack hack. Basically hardcoding the model types to developer=RecruitUnitJobDescription and recruiter=RecruitUnitComparisonTest
    var selectorArray = [];
    for(var i=0; i < jobItemResults.length; i++) {
      var selector = "";
      var jsonResult = JSON.parse(JSON.stringify(jobItemResults[i]));
      //todo: revisit and make this more flexible, if it's ever worth the effort.
      var selectorModel = jsonResult.model == "RecruitUnitComparisonTest" ? "RecruitUnitJobDescription" : "RecruitUnitComparisonTest";
      _.forEach(jsonResult, function (itemvalue, itemname) {
        if (itemvalue.value !== undefined && !itemvalue.disabled) {
          //add model type to work for both recruiters and developers
          selectorJson.model = selectorModel;
          console.log("value type:" + itemvalue.value.constructor.name, "value:" + itemvalue.value);
          switch (itemvalue.value.constructor.name){
            case 'Array':
              console.log("   Array");
              if (itemname === "roleType") {
                selectorJson.roleType = JSON.parse('{"value":{"$elemMatch":{"$eq": "' + itemvalue.value[0] + '"}}}');
              } else if (itemname === "skills") {
                if (itemvalue.rule == "assertArrayContains") {
                  var addSkillsCombinationOperatorJson = getCombinationOperatorJson("$or","skills",itemvalue.value);
                  _.assignIn(selectorJson, addSkillsCombinationOperatorJson);
                }
              } else if (itemname === "locationDescription") {
                var addArray = JSON.parse('{"value":{"$all": []}}');
                Array.prototype.push.apply(addArray.value.$all,[itemvalue.value[0]]);
                selectorJson.locationDescription = addArray;
              }
              break;
            case 'String':
              console.log("   String");
              break;
            case 'Number':
              console.log("   Number");
              if (itemname === "payBracketLower") {
                selectorJson.payBracketLower = JSON.parse('{"value":{"$gte":'+ itemvalue.value +'}}');
              }
              break;
            default:
              console.log("   Not recognised:" + itemvalue.value.constructor.name);
          }
        }
        console.log("key:" + itemname, "value:" + itemvalue);
      });
      selector = "{\"jobSpecDocId\":"+ JSON.stringify(jsonResult.id) + ",\"selector\":"+ JSON.stringify(selectorJson) +"}";
      selectorArray.push(selector);
    }
    callback(null, selectorArray)
  } else {
    console.log("getMangoSelectorFromJobItem error. Incorrect model");
    callback("Incorrect model", null)
  }
}

RecruitUnitUtilityService.prototype.combineJobSpecsWithSearchResults = function(jobSpecResults, jobSearchResults){
  console.log("RecruitUnitUtilityService combineJobSpecsWithSearchResults");
}
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

function getCombinationOperatorJson(operator, key, valueArray) {
  console.log("getCombinationOperatorJson operator["+operator+"], key["+key+"], valueArray["+valueArray+"]");
  var operatorJson = JSON.parse('{"'+ operator +'": []}');

  for (var i=0; i < valueArray.length; i++) {
    console.log("   valueArray value["+valueArray[i]+"]");
    var json = {};
    json[key] = {"value":{"$all":{}}};
    json[key].value.$all = [valueArray[i]];
    Array.prototype.push.apply(operatorJson[operator], [json]);
  };

  return operatorJson;
}

exports.Service = new RecruitUnitUtilityService;
