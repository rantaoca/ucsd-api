// Used for api calls
var CourseScheduleSearcher = require('./course_schedule_searcher.js');

/**
 * Performs a search given the search parameter object.
 * @param  {object}   options  search options. e.g. {'courses':'cse 100-150'}
 * @param  {Function} callback
 */
function search(options, callback) {
  searcher = new CourseScheduleSearcher();

  searcher.query.courses = options.courses;

  searcher.search(function (err, data) {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  });
}

module.exports = search;
