function Course(term, departmentCode, courseNumber, units, restrictionCode) {
    this.departmentCode = departmentCode;
    this.courseNumber = courseNumber;
    this.term = term;
    this.units = units;
    this.restrictionCode = restrictionCode;

    this.sectionList = [];
}

Course.prototype.addSection = function(sectionId, meetingType, sectionLetter, sectionNumber,
        days, time, place, instructor, availability, limit) {

    this.sectionList[this.sectionList.length] = new Section(sectionId, meetingType, sectionLetter, sectionNumber,
            days, time, place, instructor, availability, limit);
}

// Course.prototype.toJSON = function() {
//     var sectionListJSON = this.sectionList.length > 0 ? "\n[" : "[";

//     for (var i = 0; i < this.sectionList.length; i++) {
//         sectionListJSON += sectionList[i].toJSON() + ",\n";
//     }
//     sectionListJSON += "]";

//     return "{ term: " + this.term + ",\n" +
//         "departmentCode: " + this.departmentCode + ",\n" +
//         "courseNumber: " + this.courseNumber + ",\n" +
//         "units: " + this.units + ",\n" +
//         "restrictionCode" + this.restrictionCode + ",\n" +
//         "sectionList:" + sectionListJSON + "\n}";
// }

function Section(sectionId, meetingType, sectionLetter, sectionNumber,
    days, time, place, instructor, availability, limit) {
    this.meetingType = meetingType;
    this.sectionLetter = sectionLetter;
    this.sectionNumber = sectionNumber;

    this.days = days;
    this.time = time;
    this.place = place;
    this.instructor = instructor;
    this.sectionId = sectionId;

    // Availability can be "Unlim" or "FULL waitlist(29)" or "29"
    // Waitlist is represented as negative availability.
    this.availability = availability;
    // Limit can be nothing if availability is "Unlim"
    this.limit = limit;
}

// Section.prototype.toJSON = function() {
//     return "{ sectionId: " + this.sectionId + ",\n" +
//         "meetingType: " + this.meetingType + ",\n" +
//         "sectionLetter: " + this.sectionLetter + ",\n" +
//         "sectionNumber: " + this.sectionNumber + "\n}";
// }

module.exports = Course;
