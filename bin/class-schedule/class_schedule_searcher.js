var async = require('async');
var querystring = require('querystring');
var request = require('request');
var SearchResultPage = require('./search_result_page.js');

// Template JSON of the post data.
var DATA_TEMPLATE = require('./class-schedule-data.json');


function ClassScheduleSearcher() {}

/**
 * Performs a search on the 'Schedule of Classes' page.
 * @param {string[]} classes List of class names to be searched.
 * @param {function(Error, Course[])} callback
 */
ClassScheduleSearcher.prototype.search = function(query, callback) {
  this.query = query;

  this.getPage(1, (function(err, page) {
    if (err) return callback(err);

    // Get the rest of the pages if there are more.
    if (page.numPages > 1) {
      var functionList = [];
      for (var pageNum = 2; pageNum <= page.numPages; pageNum++) {
        functionList.push(this.generatePostFunction(pageNum));
      }

      // Use parallel to get all the pages, and combine results.
      async.parallel(functionList, function combineResults(err, results) {
        if (err) callback(err);

        var combinedClassList = page.classList
        for (var i = 0; i < results.length; i++) {
          combinedClassList = combinedClassList.concat(results[i].classList);
        }

        callback(null, combinedClassList);
      });
    } else {
      callback(null, page.classList);
    }
  }).bind(this));
}


/**
 * Make a post to get the results page.
 * @param {int} pageNum
 * @param {function(Error, SearchResultPage)} callback
 */
ClassScheduleSearcher.prototype.getPage = function(pageNum, callback) {
  var formUrl = "https://act.ucsd.edu/scheduleOfClasses/" +
    "scheduleOfClassesStudentResult.htm?page=" + pageNum;

  // Make a deep copy of data template, as hacky as this seems, it is the
  // fastest method according to stack overflow analysis.
  postData = JSON.parse(JSON.stringify(DATA_TEMPLATE));

  postData["courses"] = this.query;

  var postQuery = querystring.stringify(postData);

  var postOptions = {
    url: formUrl,
    form: postQuery
  };

  // Send a post to the Schedule of Classes page.
  request.post(postOptions, function (err, response, body) {
    if (err) {
      return callback(err);
    }

    page = new SearchResultPage(body);
    // If there are no pages, there was an error with the search input.
    if (page.numPages == 0) {
      callback(new Error("The search was formatted incorrectly."));
    } else {
      callback(null, page);
    }
  });
}

/**
 * Generate the post functions for the parallel call to get all the pages.
 * @returns {function(PageCallback)}
 */
ClassScheduleSearcher.prototype.generatePostFunction = function(pageNum) {
  return (function(callback) {
    this.getPage(pageNum, callback);
  }).bind(this);
}

module.exports = ClassScheduleSearcher;
