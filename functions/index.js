/**
 * Firebase Cloud Functions - Main Entry Point
 * 
 * This file exports all Cloud Functions for deployment
 */

// Import all your function modules
// const rickRollAuthTriggers = require('./triggers/auth/rickRollAuthTrigger');
// const rickRollHTTP = require('./triggers/http/rickRollCallable');


//REGISTER APPLICANT HTTP
const { registerApplicant } = require('./src/triggers/http/registerApplicant');
const { loginStudent } = require('./src/triggers/http/loginStudent');

//AUTH FOR STAFF
const { loginStaff } = require("./src/triggers/http/loginStaff");
const { registerStaff } = require("./src/triggers/http/registerStaff");
const { verifyStaff } = require("./src/triggers/http/verifyStaff");
const { getAllStaffVerification } = require("./src/triggers/http/getAllStaffVerification");

// Export Auth Triggers
// exports.logNewUserRickRoll = rickRollAuthTriggers.logNewUserRickRoll;
// exports.logUserDeletedRickRoll = rickRollAuthTriggers.logUserDeletedRickRoll;

// Export HTTP Functions
// exports.rickRoll = rickRollHTTP.rickRoll;
exports.registerApplicant = registerApplicant;
//exports.verifyReferenceNumber = require('./triggers/http/verifyReferenceNumber').verifyReferenceNumber;
exports.loginStudent = loginStudent; 


exports.loginStaff = loginStaff;
exports.registerStaff = registerStaff;
exports.verifyStaff = verifyStaff;
exports.getAllStaffVerification = getAllStaffVerification;

// You can add more functions as you develop them
// Example:
// exports.anotherFunction = require('./path/to/file').functionName;

//Admin Enrollment Functions:
exports.getAdminEnrollmentStudentList = require("./src/triggers/http/getAdminEnrollmentStudentList").getAdminEnrollmentStudentList;
exports.getAdminEnrollmentDropdownOptions = require("./src/triggers/http/getAdminEnrollmentDropdownOptions").getAdminEnrollmentDropdownOptions;
exports.getStudentProfileById = require("./src/triggers/http/getStudentProfileById").getStudentProfileById;
exports.getEnrollmentStatusByStudentNumber = require("./src/triggers/http/getEnrollmentStatusByStudentNumber").getEnrollmentStatusByStudentNumber;
exports.getNotEnrolledStudentList = require("./src/triggers/http/getNotEnrolledStudentList").getNotEnrolledStudentList;
exports.getCourseAdvisingProfile = require("./src/triggers/http/getCourseAdvisingProfile").getCourseAdvisingProfile;

console.log('Firebase Functions initialized');