"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.AdminDecision = exports.FeedbackStatus = exports.FeedbackType = exports.SubscriptionPlan = exports.DocumentStatus = exports.DocumentType = exports.ClientStatus = exports.ClientType = exports.Priority = exports.CaseStatus = exports.CaseType = exports.UserRole = void 0;
// Enums
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["LAWYER"] = "lawyer";
    UserRole["PARALEGAL"] = "paralegal";
    UserRole["CLERK"] = "clerk";
    UserRole["CLIENT"] = "client";
})(UserRole || (exports.UserRole = UserRole = {}));
var CaseType;
(function (CaseType) {
    CaseType["COMMERCIAL"] = "commercial";
    CaseType["CIVIL"] = "civil";
    CaseType["CRIMINAL"] = "criminal";
    CaseType["LABOR"] = "labor";
    CaseType["FAMILY"] = "family";
    CaseType["REAL_ESTATE"] = "real_estate";
    CaseType["INTELLECTUAL_PROPERTY"] = "intellectual_property";
    CaseType["ADMINISTRATIVE"] = "administrative";
    CaseType["CYBER_CRIME"] = "cyber_crime";
    CaseType["INHERITANCE"] = "inheritance";
})(CaseType || (exports.CaseType = CaseType = {}));
var CaseStatus;
(function (CaseStatus) {
    CaseStatus["NEW"] = "new";
    CaseStatus["IN_PROGRESS"] = "in_progress";
    CaseStatus["UNDER_REVIEW"] = "under_review";
    CaseStatus["PENDING_DOCUMENTS"] = "pending_documents";
    CaseStatus["COURT_HEARING"] = "court_hearing";
    CaseStatus["SETTLED"] = "settled";
    CaseStatus["WON"] = "won";
    CaseStatus["LOST"] = "lost";
    CaseStatus["CLOSED"] = "closed";
})(CaseStatus || (exports.CaseStatus = CaseStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
})(Priority || (exports.Priority = Priority = {}));
var ClientType;
(function (ClientType) {
    ClientType["INDIVIDUAL"] = "individual";
    ClientType["COMPANY"] = "company";
    ClientType["GOVERNMENT"] = "government";
    ClientType["NGO"] = "ngo";
})(ClientType || (exports.ClientType = ClientType = {}));
var ClientStatus;
(function (ClientStatus) {
    ClientStatus["ACTIVE"] = "active";
    ClientStatus["INACTIVE"] = "inactive";
    ClientStatus["SUSPENDED"] = "suspended";
    ClientStatus["ARCHIVED"] = "archived";
})(ClientStatus || (exports.ClientStatus = ClientStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CONTRACT"] = "contract";
    DocumentType["MEMORANDUM"] = "memorandum";
    DocumentType["PETITION"] = "petition";
    DocumentType["EVIDENCE"] = "evidence";
    DocumentType["CORRESPONDENCE"] = "correspondence";
    DocumentType["COURT_DOCUMENT"] = "court_document";
    DocumentType["LEGAL_OPINION"] = "legal_opinion";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "draft";
    DocumentStatus["REVIEW"] = "review";
    DocumentStatus["APPROVED"] = "approved";
    DocumentStatus["REJECTED"] = "rejected";
    DocumentStatus["ARCHIVED"] = "archived";
    DocumentStatus["SIGNED"] = "signed";
    DocumentStatus["EXECUTED"] = "executed";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["BASIC"] = "basic";
    SubscriptionPlan["PROFESSIONAL"] = "professional";
    SubscriptionPlan["ENTERPRISE"] = "enterprise";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
// Enums for RLHF
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["INACCURATE"] = "inaccurate";
    FeedbackType["INCOMPLETE"] = "incomplete";
    FeedbackType["OUTDATED"] = "outdated";
    FeedbackType["WRONG_JURISDICTION"] = "wrong_jurisdiction";
    FeedbackType["MISSING_PROCEDURE"] = "missing_procedure";
    FeedbackType["INCORRECT_REFERENCE"] = "incorrect_reference";
    FeedbackType["PERFECT"] = "perfect";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["PENDING"] = "pending";
    FeedbackStatus["UNDER_REVIEW"] = "under_review";
    FeedbackStatus["APPROVED"] = "approved";
    FeedbackStatus["REJECTED"] = "rejected";
    FeedbackStatus["IMPLEMENTED"] = "implemented";
})(FeedbackStatus || (exports.FeedbackStatus = FeedbackStatus = {}));
var AdminDecision;
(function (AdminDecision) {
    AdminDecision["NEEDS_LAWYER_VERIFICATION"] = "needs_lawyer_verification";
    AdminDecision["ADMIN_CAN_FIX"] = "admin_can_fix";
    AdminDecision["REJECT_INVALID"] = "reject_invalid";
    AdminDecision["ALREADY_CORRECT"] = "already_correct";
})(AdminDecision || (exports.AdminDecision = AdminDecision = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["CASE_UPDATE"] = "case_update";
    NotificationType["DOCUMENT_UPLOADED"] = "document_uploaded";
    NotificationType["HEARING_REMINDER"] = "hearing_reminder";
    NotificationType["PAYMENT_DUE"] = "payment_due";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=index.js.map