/**
 * CivicBridge MongoDB seed – demo data.
 * Run: node scripts/seed-mongo.js
 * Ensure MONGODB_URI is set or uses default mongodb://localhost:27017/zerohour
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Department, Issue, IssueTimeline, IssueImage, Comment, Vote, Notification, Survey, SurveyQuestion, SurveyResponse, SLATracking } from "../models/index.js";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/civicbridge";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const hash = await bcrypt.hash("Demo123!", 12);

  await Department.deleteMany({});
  await User.deleteMany({});
  await Issue.deleteMany({});
  await IssueImage.deleteMany({});
  await IssueTimeline.deleteMany({});
  await Comment.deleteMany({});
  await Vote.deleteMany({});
  await Notification.deleteMany({});
  await SurveyResponse.deleteMany({});
  await SurveyQuestion.deleteMany({});
  await Survey.deleteMany({});
  await SLATracking.deleteMany({});

  const deptPublic = await Department.create({ name: "Public Works", slug: "public-works", description: "Roads, sanitation, drainage", city: "Demo City" });
  const deptWater = await Department.create({ name: "Water Board", slug: "water-board", description: "Water supply", city: "Demo City" });

  await User.create({ email: "admin@civicbridge.demo", passwordHash: hash, name: "Admin User", role: "ADMIN" });
  const official1 = await User.create({ email: "official@civicbridge.demo", passwordHash: hash, name: "Jane Official", role: "OFFICIAL", departmentId: deptPublic._id });
  await User.create({ email: "official2@civicbridge.demo", passwordHash: hash, name: "John Officer", role: "OFFICIAL", departmentId: deptWater._id });
  await User.create({ email: "journalist@civicbridge.demo", passwordHash: hash, name: "News Reporter", role: "JOURNALIST" });
  const resident1 = await User.create({ email: "resident@civicbridge.demo", passwordHash: hash, name: "Alex Resident", role: "RESIDENT" });
  const resident2 = await User.create({ email: "maria@civicbridge.demo", passwordHash: hash, name: "Maria Garcia", role: "RESIDENT" });

  const issuesData = [
    { title: "Pothole on Main St", category: "Road", severity: "High", status: "Resolved", lat: 28.5355, lng: 77.391, authorId: resident1._id, departmentId: deptPublic._id },
    { title: "Garbage pile near park", category: "Garbage", severity: "Medium", status: "InProgress", lat: 28.536, lng: 77.392, authorId: resident2._id, departmentId: deptPublic._id },
    { title: "Water leak at block 5", category: "Water", severity: "Critical", status: "Assigned", lat: 28.5345, lng: 77.39, authorId: resident1._id, departmentId: deptWater._id },
    { title: "Streetlight out on Oak Ave", category: "Streetlight", severity: "Low", status: "Submitted", lat: 28.537, lng: 77.393, authorId: resident2._id, departmentId: deptPublic._id },
    { title: "Drainage clogged after rain", category: "Drainage", severity: "High", status: "Acknowledged", lat: 28.535, lng: 77.3915, authorId: resident1._id, departmentId: deptPublic._id },
    { title: "Broken pavement near school", category: "Road", severity: "Medium", status: "Verified", lat: 28.5365, lng: 77.3925, authorId: resident2._id, departmentId: deptPublic._id },
  ];

  const createdIssues = [];
  for (const d of issuesData) {
    const issue = await Issue.create({
      title: d.title,
      description: `Description for ${d.title}. Reported for tracking.`,
      category: d.category,
      severity: d.severity,
      status: d.status,
      latitude: d.lat,
      longitude: d.lng,
      address: `${d.lat}, ${d.lng}`,
      city: "Demo City",
      priorityScore: d.severity === "Critical" ? 10 : d.severity === "High" ? 7 : 4,
      createdById: d.authorId,
      departmentId: d.departmentId,
      resolvedAt: d.status === "Resolved" || d.status === "Verified" ? new Date() : null,
    });
    await IssueTimeline.create({ issueId: issue._id, status: issue.status, updatedById: official1._id });
    await SLATracking.create({
      issueId: issue._id,
      targetHours: 72,
      acknowledgedAt: d.status !== "Submitted" ? new Date(Date.now() - 86400000) : null,
      resolvedAt: d.status === "Resolved" || d.status === "Verified" ? new Date() : null,
    });
    createdIssues.push(issue);
  }

  await Comment.create({ issueId: createdIssues[0]._id, authorId: official1._id, body: "We have received your report and will inspect shortly." });
  await Comment.create({ issueId: createdIssues[0]._id, authorId: resident1._id, body: "Thank you for the update." });
  await Vote.create({ issueId: createdIssues[0]._id, userId: resident2._id });
  if (createdIssues[1]) {
    await Comment.create({ issueId: createdIssues[1]._id, authorId: official1._id, body: "Inspecting this week." });
  }

  await Notification.create({
    userId: resident1._id,
    type: "StatusUpdate",
    title: "Issue status updated",
    body: "Your report 'Pothole on Main St' is now Resolved.",
    link: "/dashboard/issues",
  });

  const survey = await Survey.create({
    title: "Public Works Satisfaction",
    description: "Help us improve services.",
    createdById: official1._id,
    departmentId: deptPublic._id,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    published: true,
  });
  const q = await SurveyQuestion.create({ surveyId: survey._id, text: "How would you rate road maintenance?", order: 0, options: ["Poor", "Fair", "Good", "Excellent"] });
  await SurveyResponse.create({ surveyId: survey._id, questionId: q._id, userId: resident1._id, answer: 2 });

  console.log("Seed complete. Login: admin@civicbridge.demo, official@civicbridge.demo, resident@civicbridge.demo — password: Demo123!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
