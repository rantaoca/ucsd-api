var async = require('async');
var querystring = require('querystring');
var request = require('request');
var SearchResultPage = require('./search_result_page.js');

// Template JSON of the post data.
var DATA_TEMPLATE = require('./course-schedule-data.json');
var DEPARTMENT_CODES = require('./department-codes.json');


function CourseScheduleSearcher() {
  // Make a deep copy of data template, as hacky as this seems, it is the
  // fastest method according to stack overflow analysis.
  this.query = JSON.parse(JSON.stringify(DATA_TEMPLATE));
}

/**
 * Performs a search on the 'Schedule of Classes' page.
 * @param {string[]} query List of course names to be searched.
 * @param {function(Error, Course[])} callback
 */
CourseScheduleSearcher.prototype.search = function(callback) {

  this.getPage(1, (function(err, page) {
    if (err) return callback(err);

    console.log("There are " + page.getNumPages() + " total page(s).");
    // Get the rest of the pages if there are more.
    if (page.getNumPages() > 1) {
      var functionList = [];
      for (var pageNum = 2; pageNum <= page.getNumPages(); pageNum++) {
        functionList.push(this.generatePostFunction(pageNum));
      }

      // Use parallel to get all the pages, and combine results.
      async.parallel(functionList, function combineResults(err, results) {
        if (err) callback(err);

        var combinedList = page.getCourseList();
        for (var i = 0; i < results.length; i++) {
          combinedList = combinedList.concat(results[i].getCourseList());
        }

        callback(null, combinedList);
      });
    } else {
      callback(null, page.getCourseList());
    }
  }).bind(this));
}

CourseScheduleSearcher.prototype.searchAll = function(callback) {
  this.query.selectedSubjects = DEPARTMENT_CODES;
  this.query.tabNum = "";
  this.search(callback);
}

/**
 * Make a post to get the results page.
 * @param {int} pageNum
 * @param {function(Error, SearchResultPage)} callback
 */
CourseScheduleSearcher.prototype.getPage = function(pageNum, callback) {
  var formUrl = "https://act.ucsd.edu/scheduleOfClasses/" +
    "scheduleOfClassesStudentResult.htm?page=" + pageNum;

  var postQuery = querystring.stringify(this.query);

  var postOptions = {
    url: formUrl,
    form: postQuery
  };

  // Send a post to the Schedule of Classes page.
  request.post(postOptions, (function (err, response, body) {
    if (err) {
      console.log("Error with page " + pageNum + ":" + err.message);
      return callback(err);
    }

    console.log("Received page " + pageNum + ".");

    page = new SearchResultPage(body, this.query);
    // If there are no pages, there was an error with the search input.
    if (page.getNumPages() == 0) {
      callback(new Error("The search was formatted incorrectly."));
    } else {
      callback(null, page);
    }
  }).bind(this));
}

/**
 * Generate the post functions for the parallel call to get all the pages.
 * @return {function(PageCallback)} a custom function to be used in async.
 */
CourseScheduleSearcher.prototype.generatePostFunction = function(pageNum) {
  return (function(callback) {
    this.getPage(pageNum, callback);
  }).bind(this);
}

module.exports = CourseScheduleSearcher;
