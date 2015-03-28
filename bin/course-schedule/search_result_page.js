var cheerio = require('cheerio');

/**
 * @constructor
 * @param {string} html the html of the search result page.
 */
function SearchResultPage(html) {
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
 */
SearchResultPage.prototype._parseScheduleTable = function() {
  var $ = this.$;
  var rows = $(this._TABLE_ROW_SELECTOR);

  var stack = [];
  var prevRowType = null;
  for (var i = 0; i < rows.length; i++) {
    row = new RowParser($(rows[i]), prevRowType);

    console.log(row.rowType);
    switch (row.rowType) {
      case "Department Description":
        // Ignore for now
        break;

      case "Department Header":
        console.log("Department Code: " + row.departmentCode);
        break;

      case "Course Column Header 1":
        // Ignore for now
        break;

      case "Course Column Header 2":
        // Ignore for now
        break;

      case "Section Header":
      case "Section":
      case "Section Note Header":
      case "Section Note":
      case "Invalid Row":
    }

    prevRowType = row.rowType;
  }
  this._courseList = [rows.length];
}

/**
 * [RowParser description]
 * @param {} row [description]
 */
function RowParser(row, prevRowType) {
  this.row = row;
  this.prevRowType = prevRowType;
  this.rowType = null;

  // rowType = "Department Description"

  // rowType = "Department Header"
  this.departmentCode = null;

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
 */
RowParser.prototype._parseType = function() {

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


  }
}





module.exports = SearchResultPage;
