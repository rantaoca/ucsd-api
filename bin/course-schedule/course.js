function Course(term, departmentCode, courseNumber, units, restrictionCodes) {
    this.departmentCode = departmentCode;
    this.courseNumber = courseNumber;
    this.term = term;
    this.units = units;
    this.restrictionCodes = restrictionCodes;

    this.sectionList = [];
}

Course.prototype.addSection = function(sectionId, meetingType, sectionLetter, sectionNumber,
        days, time, place, instructor, availability, limit) {

    this.sectionList[this.sectionList.length] = new Section(sectionId, meetingType, sectionLetter, sectionNumber,
            days, time, place, instructor, availability, limit);
}

function Section(sectionId, meetingType, sectionLetter, sectionNumber) {
    this.sectionId = null;
    this.meetingType = meetingType;
    this.sectionLetter = sectionLetter;
    this.sectionNumber = sectionNumber;

    this.days = null;
    this.time = null;
    this.place = null;
    this.instructor = null;

    // Availability can be "Unlim" or "FULL waitlist(29)" or "29"
    // Waitlist is represented as negative availability.
    this.availability = null;
    // Limit can be nothing if availability is "Unlim"
    this.limit = null;
}

module.exports = Course;
