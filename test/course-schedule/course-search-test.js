dot = '../../bin/course-schedule';
var search = require(dot + '/course-search.js');

search({'courses': 'cse 100-150'}, function(err, result) {
    console.log(result);
});
