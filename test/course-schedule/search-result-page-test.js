dot = '../../bin/course-schedule';
var SearchResultPage = require(dot + '/search_result_page.js');
var fs = require('fs');
var testHtml = fs.readFileSync('./schedules-results.html');
var postData = require('./post-data.json');


var page = new SearchResultPage(testHtml, postData);

var courseList = page.getCourseList();

for (var i = 0; i < courseList.length; i++) {
    var sectionList = courseList[i].sectionList;
    console.log(courseList[i]);
}
