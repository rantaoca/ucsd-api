var cheerio = require('cheerio');
var Course = require('./course.js');

/**
 * @constructor
 * @param {string} html the html of the search result page.
 */
function SearchResultPage(html, postData) {
  this.postData = postData;
  this._TABLE_SELECTOR = '.tbrdr';
  this._TABLE_ROW_SELECTOR = '.tbrdr tr';
  this._PAGE_DATA_SELECTOR = 'table>tbody>tr>td:last-child';
  this._curPage = null;
  this._numPages = null;
  this._courseList = null;
  this.$ = cheerio.load(html);
}

/**
 * Get the number of total pages.
 * @return {int} number of total pages.
 */
SearchResultPage.prototype.getNumPages = function() {
  if (this._numPages == null) {
    this._parsePagesData();
  }
  return this._numPages;
}

/**
 * Get the number of the current page.
 * @return {int} number of the current page.
 */
SearchResultPage.prototype.getCurPage = function() {
  if (this._curPage == null) {
    this._parsePagesData();
  }
  return this._curPage;
}

/**
 * Get the list of courses on the page.
 * @return {Course[]} list of courses.
 */
SearchResultPage.prototype.getCourseList = function() {
  if (this._courseList == null) {
    this._parseScheduleTable();
  }
  return this._courseList;
}

/**
 * Parse the page number and total pages. Sets the curPage and numPages fields.
 */
SearchResultPage.prototype._parsePagesData = function() {
  var $ = this.$;
  this._curPage = 0;
  this._numPages = 0;

  // Check for errors in the page.
  if ($(this._TABLE_SELECTOR).length ==0) {
    return;
  }

  // Get the page number by regex. Looks like: Page (1 of 1)
  var pageDataRegex = /[Pp]age\s*\(\s*(\d)\s*of\s*(\d)/;

  var pageDataString = $(this._TABLE_SELECTOR).prevAll('div').first()
    .find(this._PAGE_DATA_SELECTOR).text();

  var pageData = pageDataRegex.exec(pageDataString);

  if (pageData != null && pageData.length == 3) {
    this._curPage = parseInt(pageData[1]);
    this._numPages = parseInt(pageData[2]);
  }
}

/**
 * Parse each row iteratively. The table is formatted in a tree-like
 * data structure, so a stack will be used to keep track of which layer
 * of the tree it's on.
 *
 * There are different types of rows that make up each depth of the tree:
 *  [Department Description]?
 *  Department Result Header
 *  Course Column Header
 *    [Section Header]+
 *      [LE | DI | FI]*
 *    [Section Note Header]?
 *      Section Note
 *
 * TODO: Better error handling.
 */
SearchResultPage.prototype._parseScheduleTable = function() {
  var $ = this.$;
  var rows = $(this._TABLE_ROW_SELECTOR);

  var curDepartment = null;
  var courseList = [];
  var prevRowType = null;
  for (var i = 0; i < rows.length; i++) {
    row = new RowParser($, rows[i], prevRowType);

    console.log(row.rowType);
    switch (row.rowType) {
      case "Department Description":
        // Ignore for now
        break;

      case "Department Header":
        curDepartment = row.departmentCode;
        break;

      case "Course Column Header 1":
        // Ignore for now
        break;

      case "Course Column Header 2":
        // Ignore for now
        break;

      case "Course Header":
        // Validity Check
        courseList[courseList.length] = new Course(
          'SP15',
          curDepartment,
          row.courseNumber,
          row.units,
          row.restrictionCode
        );
        break;

      case "Section":
        courseList[courseList.length - 1].addSection(
          row.sectionId,
          row.meetingType,
          row.sectionLetter,
          row.sectionNumber
        );

        break;

      case "Course Note Header":
      case "Course Note":
      case "Invalid Row":
    }

    prevRowType = row.rowType;
  }
  this._courseList = courseList;
}

/**
 * [RowParser description]
 * @param {} row [description]
 */
function RowParser($, row, prevRowType) {
  this.$ = $;
  this.row = $(row);
  this.prevRowType = prevRowType;
  this.rowType = null;

  // rowType = "Department Header"
  this.departmentCode = null;

  // rowType = "Course Header"
  this.courseNumber = null;
  this.units = null;
  this.courseName = null;
  this.restrictionCode = null;

  this._parseType();
}

/**
 * Figure out what kind of row this is.
 *
 * Department Description - These rows are very similar
 * to department result header rows, except the header does not have a
 * "(CSE )" at the end and it doesn't have a "As of: 03/27/2015, 00:57:00"
 * at the bottom.
 *
 * Department Header - These rows have a header text and a bottom timestamp.
 *
 * Course Column Header 1 - Row with the header for each column. Always appears
 * after the Department Header, and should contain 11 td's.
 *
 * Course Column Header 2 - Part 2 of the headers for each column. Always
 * appears after the part 1, and should contain 2 td's.
 *
 * Course Header - Purple row that describes the course, lists many sections.
 * Has 4 td's with ".crsheader" class.
 * Contains a restriction code, found at:
 * http://registrar.ucsd.edu/StudentLink/rstr_codes.html
 * Also contains the course number
 *
 * Course Note Header - Same purple row, but only has 3 "td.crsheader".
 *
 * Course Note - Previous row is course note header.
 */
RowParser.prototype._parseType = function() {
  var $ = this.$;

  // Check for department description and department header.
  var h2 = this.row.find('h2');

  // If it couldn't parse the row, default to invalid row.
  this.rowType = "Invalid Row";

  if (h2.length == 1) {
    // If it's a department header, department code should be found in the h2.
    // The h2 should look like "Computer Science & Engineering (CSE )"
    var DEPARTMENT_CODE_REGEX = /\(\s*([A-Z]+)\s*\)/

    departmentCodeResult = DEPARTMENT_CODE_REGEX.exec(h2.text());

    // If there isn't a department code, then it must be a department header.
    if (departmentCodeResult == null) {
      this.rowType = "Department Description"
      return;

    } else if (departmentCodeResult[1] != null) {
      this.rowType = "Department Header";
      this.departmentCode = departmentCodeResult[1];
      return;
    }

  } else if (h2.length == 0) {
    // Check to see if it's the course column header 1.
    if (this.prevRowType == "Department Header") {
      // Verify.
      if (this.row.children('td').length == 11) {
        this.rowType = "Course Column Header 1";
        return;

      } else {
        console.log('Something went wrong, perhaps the page format changed.');
        return;
      }
    }

    if (this.prevRowType == "Course Column Header 1") {
      // Verify.
      if (this.row.children('td').length == 2) {
        this.rowType = "Course Column Header 2";
        return;

      } else {
        console.log('Something went wrong, perhaps the page format changed.');
        return;
      }
    }

    // Check if it's a course header row.
    courseHeaderColumns = this.row.children('.crsheader');
    if (courseHeaderColumns.length == 4) {
      this.rowType = "Course Header";
      this.restrictionCode = removeSpacing($(courseHeaderColumns[0]).text());
      this.courseNumber = removeSpacing($(courseHeaderColumns[1]).text());

      // Parse course name and units from text.
      // Text looks something like:
      // "    Computer Organiz&Systms Progrm ( 4 Units)  "
      var COURSE_TITLE_REGEX = /\s*(.+?)\s*\(\s*(\d+)\s*[Uu]nits?\s*\)/
      var text = $(courseHeaderColumns[2]).text();
      var result = COURSE_TITLE_REGEX.exec(text);

      if (result != null && result.length == 3) {
        this.courseName = result[1];
        this.units = parseInt(result[2]);
      } else {
        console.log('Something went wrong, perhaps the page format changed.');
      }
    }

    // Check if it's a section. If it doesn't have 13 columns, then it might
    // be a cancelled section.
    if (this.row.hasClass('sectxt') && this.row.children('.brdr').length == 13) {
      this.rowType = "Section";

      var cols = this.row.children('.brdr');
      this.sectionId = removeSpacing($(cols[2]).text());
      this.meetingType = removeSpacing($(cols[3]).text());

      var sectionText = removeSpacing($(cols[4]).text());
      this.sectionLetter = sectionText[0];
      this.sectionNumber = parseInt(sectionText.slice(1,3));
    }


    // Check if it's a coures note header row.
    if (courseHeaderColumns.length == 3) {
      this.rowType = "Course Note Header";
      return;
    }

    // Check if it's a course note.
    if (this.prevRowType = "Course Note Header"
        && this.row.children('.nonenrtxt').length == 2) {
      this.rowType = "Course Note";
      return;
    }

  }
}

function removeSpacing(text) {
  var re = /^\s*(.*?)\s*$/;
  var result = re.exec(text);
  return result != null && result.length == 2 ? result[1] : "";
}



module.exports = SearchResultPage;
