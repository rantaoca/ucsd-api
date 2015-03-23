var courseParser = require('./course-parser.js');

var courses = ['cse 150', 'cse 110'];
courseParser(courses, function (err, data) {
  if (err) {
    console.log('Course parser error: ' + err);
    return;
  }
  console.log(data);
});
