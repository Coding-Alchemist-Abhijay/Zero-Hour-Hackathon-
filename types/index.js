/**
 * Shared constants and enums for CivicBridge.
 */

export const ROLES = {
  RESIDENT: "RESIDENT",
  OFFICIAL: "OFFICIAL",
  JOURNALIST: "JOURNALIST",
  ADMIN: "ADMIN",
};

export const ISSUE_STATUS = [
  "Submitted",
  "Acknowledged",
  "Assigned",
  "InProgress",
  "Resolved",
  "Verified",
];

export const ISSUE_CATEGORIES = [
  "Road",
  "Garbage",
  "Water",
  "Electricity",
  "Sanitation",
  "Streetlight",
  "Drainage",
  "Other",
];

export const ISSUE_SEVERITIES = ["Low", "Medium", "High", "Critical"];

export const NOTIFICATION_TYPES = [
  "StatusUpdate",
  "Comment",
  "Survey",
  "SLAAlert",
  "Assignment",
];
