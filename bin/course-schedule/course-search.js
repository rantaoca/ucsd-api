// Used for api calls
var CourseScheduleSearcher = require('./course_schedule_searcher.js');

/**
 * Performs a search given the search parameter object.
 * @param  {object}   options  search options. e.g. {'courses':'cse 100-150'}
 * @param  {Function} callback
 */
function search(options, callback) {
  var searcher = new CourseScheduleSearcher();

  searcher.query.courses = options.courses;

  searchCallback = function (err, data) {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  }

  if (isTrue(options.all)) {
    searcher.searchAll(searchCallback);
  } else {
    searcher.search(searchCallback);
  }
}

function isTrue(val) {
    if (typeof val === 'undefined') {
        return false;
    }
    if (val == 1 || val == '1' || val == 'true' || val == true) {
        return true;
    } else {
        return false;
    }
}

module.exports = search;
