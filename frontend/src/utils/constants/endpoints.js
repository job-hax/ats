export const apiRoot = "http://0.0.0.0:8001";
//"https://jobposting-be.jobhax.com"; //"https://backend.jobhax.com"; //"http://10.0.0.75:8000"; "http://0.0.0.0:8001";

//USER REQUESTS//
export const USERS = type => `${apiRoot}/api/users/${type}/`;

//POS_APPS REQUESTS//
export const JOB_APPS = `${apiRoot}/api/positionapps/`;

export const GET_SOURCES = `${apiRoot}/api/positionapps/sources/`;

export const GET_STATUSES = `${apiRoot}/api/positionapps/statuses/`;

export const CONTACTS = posappId => `${apiRoot}/api/positionapps/${posappId}/contacts/`;

export const GET_NEW_JOBAPPS = timestamp => `${apiRoot}/api/positionapps/?timestamp=${timestamp}`;

export const NOTES = posappId => `${apiRoot}/api/positionapps/${posappId}/notes/`;

export const POS_FEEDBACKS = posappId => `${apiRoot}/api/positionapps/${posappId}/feedbacks/`;

//METRICS REQUESTS//
export const METRICS = type => `${apiRoot}/api/metrics/${type}`;

//COMPANIES REQUESTS//
export const COMPANIES = `${apiRoot}/api/companies/`;

//ALUMNI REQUESTS//
export const ALUMNI = `${apiRoot}/api/alumni/`;

//REVIEWS REQUESTS//
export const REVIEWS = `${apiRoot}/api/reviews/`;

export const SOURCE_TYPES = `${apiRoot}/api/reviews/sourceTypes/`;

export const EMPLOYMENT_AUTHORIZATIONS = `${apiRoot}/api/reviews/employmentAuthorizations/`;

//AUTOCOMPLETE REQUEST//
export const AUTOCOMPLETE = type => `${apiRoot}/api/${type}/`;

//NOTIFICATIONS REQUESTS//
export const NOTIFICATIONS = `${apiRoot}/api/notifications/`;

//TOKENLESS REQUESTS//
export const FAQS = `${apiRoot}/api/faqs/`;

export const AGREEMENTS = `${apiRoot}/api/agreements/`;

export const FEEDBACKS = `${apiRoot}/api/feedbacks/`;

// COMPANY //
export const COMPANY = id => `${apiRoot}/api/companies/${id}`;

// COMPANY POSITIONS //
export const COMPANY_POSITIONS = `${apiRoot}/api/positions/company`;
export const GET_COMPANY_POSITIONS = id => `${COMPANY_POSITIONS}?id=${id}`;

// RESUME PARSER //
export const RESUME_PARSER = id => (id ? `${apiRoot}/api/parser/?id=${id}` : `${apiRoot}/api/parser/`);
export const RESUME_PARSER_METRICS = `${apiRoot}/api/parser/metrics`;
