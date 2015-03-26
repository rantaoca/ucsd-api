var cheerio = require('cheerio');

/**
 * Parse the html returned by a Schedule of Classes search.
 * @param {string} html the html of the search result page.
 * @returns {Array.<Class>} classes in the page, or null if an error is found.
 */
function SearchResultPage(html) {
  this._TABLE_SELECTOR = '.tbrdr';
  this._TABLE_ROW_SELECTOR = '.tbrdr tr';
  this._PAGE_DATA_SELECTOR = 'table>tbody>tr>td:last-child';
  this.curPage = 0;
  this.numPages = 0;
  this.$ = cheerio.load(html);

  this._parsePagesData();
  this._parseScheduleTable();
}

/**
 * Parse the page number and total pages.
 */
SearchResultPage.prototype._parsePagesData = function() {
  var $ = this.$;
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
    this.curPage = parseInt(pageData[1]);
    this.numPages = parseInt(pageData[2]);
  }
}

/**
 * Parse each row iteratively. The table is formatted in a tree-like
 * data structure, so a stack will be used to keep track of which layer
 * of the tree it's on.
 * There are a finite number row types in this table:
 * 1.
 *
 */
SearchResultPage.prototype._parseScheduleTable = function() {
  var $ = this.$;
  var rows = $(this._TABLE_ROW_SELECTOR);

  var stack = [];
  for (var i = 0; i < rows.length; i++) {

  }
  this.classList = [rows.length];
}

module.exports = SearchResultPage;
