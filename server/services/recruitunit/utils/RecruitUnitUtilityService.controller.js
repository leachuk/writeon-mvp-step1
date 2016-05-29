'use strict';

require('rootpath')()
var _ = require('lodash');

function RecruitUnitUtilityService(){};

// ********************************************************************************************************************************** //
//
// Comparison Services
//
// ********************************************************************************************************************************** //

RecruitUnitUtilityService.prototype.compare = function(sourceDocId, comparisonDocId, func_callback){
  console.log("in RecruitUnitContentService, compare");
  console.log("sourceDocId:");
  console.log(sourceDocId);
  console.log("comparisonDocId:");
  console.log(comparisonDocId);
  //make sure JSON structure in sourceDocId matches specified elements in comparisonDocId.
  //then return JSON report for each element which matches saying if it is greater, less or equal to the source
  var sourceJson = {
    "_id": "comparisonDocumentTest1",
    "_rev": "1-ff676e6634b3d17a022c59a01b3bc9e6",
    "model": "RecruitUnitComparisonTest",
    "roleType": {"value":"contractor", "rule":"assertEqualTo"},
    "payBracketLower": {"value":110, "rule":"assertGreaterThan"},
    "locationDescription":  {"value": ["sydneyx","cbd"], "rule":"assertArrayContains"},
    "skills": {"value" : ["bar","aem","foo"], "rule":"assertArrayContains"},
    "authorName": "developer1@gmail.com",
    "createdDate": 1463906114820
  }

  var comparisonJson = {
    "id": "sampleRecruitUnitJobSubmitDoc1",
    "model": "RecruitUnitJobItem",
    "jobDescription": "sdfjhsd sdkjfh sf sdkjsdkfj hsdfjkdsfsjkdhf skdjf skdf hkk",
    "roleType": "developer",
    "payBracketLower": 90,
    "payBracketUpper": 110,
    "locationDescription":  "sydney cbd, near circular quay",
    "skills":["angular", "javascript", "nodejs", "aemx", "java"],
    "authorName": "recruiter1",
    "authorEmail": "recruiter1@gmail.com",
    "createdDate":  1463906114820,
    "createdDateFormatted":  "24 May, 2016",
    "lastUpdatedDate":  "1463906114820",
    "lastUpdatedDateFormatted": "24 May, 2016",
    "published": false,
    "submitTo": "developer11@gmail.com"
  }

  var comparisonTests = {
    "assertEqualTo" : assertEqualTo,
    "assertGreaterThan" : assertGreaterThan,
    "assertLessThan" : assertLessThan,
    "assertArrayContains" : assertArrayContains
  }

  //loop over sourceJson and get the keys
  _.forEach(sourceJson, function(value, key) {
    //console.log("key:" + key, "value:" + value);
    var found = _.get(comparisonJson, key);
    if (found !== undefined && sourceJson[key]['rule'] !== undefined) {
      console.log("[" + key + "]:" + found + ",rule[" + sourceJson[key]['rule'] + "], compare to source [" + sourceJson[key]['value'] + "]");
      var sourceRule = sourceJson[key]['rule'];
      var test = comparisonTests[sourceRule];
      console.log(test(sourceJson[key]['value'],found));
    }
  });

  func_callback(null, "compare success\n");
};

// ********************************************************************************************************************************** //
//
// Private Test Functions
//
// ********************************************************************************************************************************** //

function assertGreaterThan(sourceValue, comparisonValue){
  console.log("assertGreaterThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  return sourceValue > comparisonValue;
}

function assertLessThan(sourceValue, comparisonValue){
  console.log("assertLessThan: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  return sourceValue < comparisonValue;
}

function assertEqualTo(sourceValue, comparisonValue){
  console.log("assertEqualTo: sourceValue["+ sourceValue +"], comparisonValue["+ comparisonValue +"]")

  return sourceValue === comparisonValue;
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
