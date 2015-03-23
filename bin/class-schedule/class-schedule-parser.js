var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');

module.exports = function(courses, callback) {
  var url = 'https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm'
    var data = {
      selectedTerm: "SP15",
      xsoc_term: "",
      loggedIn: "false",
      tabNum: "tabs-crs",
      _selectedSubjects: "1",
      schedOption1: "true",
      _schedOption1: "on",
      _schedOption11: "on",
      _schedOption12: "on",
      schedOption2: "true",
      _schedOption2: "on",
      _schedOption4: "on",
      _schedOption5: "on",
      _schedOption3: "on",
      _schedOption7: "on",
      _schedOption8: "on",
      _schedOption13: "on",
      _schedOption10: "on",
      _schedOption9: "on",
      schDay: "M",
      _schDay: "on",
      schDay: "T",
      _schDay: "on",
      schDay: "W",
      _schDay: "on",
      schDay: "R",
      _schDay: "on",
      schDay: "F",
      _schDay: "on",
      schDay: "S",
      _schDay: "on",
      schStartTime: "12:00",
      schStartAmPm: "0",
      schEndTime: "12:00",
      schEndAmPm: "0",
      _selectedDepartments: "1",
      schedOption1Dept: "true",
      _schedOption1Dept: "on",
      _schedOption11Dept: "on",
      _schedOption12Dept: "on",
      schedOption2Dept: "true",
      _schedOption2Dept: "on",
      _schedOption4Dept: "on",
      _schedOption5Dept: "on",
      _schedOption3Dept: "on",
      _schedOption7Dept: "on",
      _schedOption8Dept: "on",
      _schedOption13Dept: "on",
      _schedOption10Dept: "on",
      _schedOption9Dept: "on",
      schDayDept: "M",
      _schDayDept: "on",
      schDayDept: "T",
      _schDayDept: "on",
      schDayDept: "W",
      _schDayDept: "on",
      schDayDept: "R",
      _schDayDept: "on",
      schDayDept: "F",
      _schDayDept: "on",
      schDayDept: "S",
      _schDayDept: "on",
      schStartTimeDept: "12:00",
      schStartAmPmDept: "0",
      schEndTimeDept: "12:00",
      schEndAmPmDept: "0",
      courses: courses,
      sections: "",
      instructorType: "begin",
      instructor: "",
      titleType: "contain",
      title: "",
      _hideFullSec: "on",
      _showPopup: "on"
    }
  
  var query = querystring.stringify(data);

  console.log(query);
  
  var postOptions = {
    url: url,
    form: query
  };
  
  request.post(postOptions, function (err, response, body) {
    if (err) {
      console.log('Error with request: ' + err.message);
      return callback('Bad request');
    }

    parsePage(body, callback);
  }); 
}

function parsePage (html, callback) {
  var TABLE_ROWS = 13;
  
  var $ = cheerio.load(html);
  
  var rows = $('.tbrdr')[0].children;
  
  for (var i = 0; i < rows.length; i++) {
    console.log('row');
    
  }

  callback (null, 'hello');
}


