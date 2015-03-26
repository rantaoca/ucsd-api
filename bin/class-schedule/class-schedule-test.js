var ClassScheduleSearcher = require('./class_schedule_searcher.js');

var courses = ['cse 100-150'];
searcher = new ClassScheduleSearcher();

searcher.search(courses, function (err, data) {
  if (err) {
    console.log('Http error: ' + err.message);
    return;
  }
  console.log(data);
});
