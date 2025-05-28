
//Admin Enrollment Functions:
exports.getAdminEnrollmentStudentList = require("./src/triggers/http/getAdminEnrollmentStudentList").getAdminEnrollmentStudentList;
exports.getAdminEnrollmentDropdownOptions = require("./src/triggers/http/getAdminEnrollmentDropdownOptions").getAdminEnrollmentDropdownOptions;
exports.getStudentProfileById = require("./src/triggers/http/getStudentProfileById").getStudentProfileById;
exports.getEnrollmentStatusByStudentNumber = require("./src/triggers/http/getEnrollmentStatusByStudentNumber").getEnrollmentStatusByStudentNumber;
exports.getNotEnrolledStudentList = require("./src/triggers/http/getNotEnrolledStudentList").getNotEnrolledStudentList;
exports.getCourseAdvisingProfile = require("./src/triggers/http/getCourseAdvisingProfile").getCourseAdvisingProfile;
exports.getSectionSchedule = require("./src/triggers/http/getSectionSchedule").getSectionSchedule;
exports.adviseStudent = require("./src/triggers/http/adviseStudent").adviseStudent;
exports.getSectionDropdownOptions = require("./src/triggers/http/getSectionDropdownOptions").getSectionDropdownOptions;
exports.getStudentCourseRequests = require("./src/triggers/http/getStudentCourseRequests").getStudentCourseRequests;
exports.handleRequestDecision = require("./src/triggers/http/handleRequestDecision").handleRequestDecision;

console.log('Firebase Functions initialized');