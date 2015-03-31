dot = '../../bin/course-schedule';
var CourseScheduleSearcher = require(dot + '/course_schedule_searcher.js');
var courses = ['cse 100-150'];

searcher = new CourseScheduleSearcher();

searcher.query.courses = ["cse 100-150"];

searcher.search(function (err, data) {
  if (err) {
    console.log('Http error: ' + err.message);
    return;
  }
  for (var i = 0; i < data.length; i++) {
    console.log(data[i]);
  }
});
