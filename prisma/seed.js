/**
 * CivicBridge seed – demo data for hackathon/MVP.
 * Run: npx prisma db seed
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Demo123!", 12);

  // Departments
  const deptPublic = await prisma.department.upsert({
    where: { slug: "public-works" },
    create: { name: "Public Works", slug: "public-works", description: "Roads, sanitation, drainage", city: "Demo City" },
    update: {},
  });
  const deptWater = await prisma.department.upsert({
    where: { slug: "water-board" },
    create: { name: "Water Board", slug: "water-board", description: "Water supply", city: "Demo City" },
    update: {},
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@civicbridge.demo" },
    create: { email: "admin@civicbridge.demo", passwordHash: hash, name: "Admin User", role: "ADMIN" },
    update: {},
  });
  const official1 = await prisma.user.upsert({
    where: { email: "official@civicbridge.demo" },
    create: { email: "official@civicbridge.demo", passwordHash: hash, name: "Jane Official", role: "OFFICIAL", departmentId: deptPublic.id },
    update: {},
  });
  const official2 = await prisma.user.upsert({
    where: { email: "official2@civicbridge.demo" },
    create: { email: "official2@civicbridge.demo", passwordHash: hash, name: "John Officer", role: "OFFICIAL", departmentId: deptWater.id },
    update: {},
  });
  const journalist = await prisma.user.upsert({
    where: { email: "journalist@civicbridge.demo" },
    create: { email: "journalist@civicbridge.demo", passwordHash: hash, name: "News Reporter", role: "JOURNALIST" },
    update: {},
  });
  const resident1 = await prisma.user.upsert({
    where: { email: "resident@civicbridge.demo" },
    create: { email: "resident@civicbridge.demo", passwordHash: hash, name: "Alex Resident", role: "RESIDENT" },
    update: {},
  });
  const resident2 = await prisma.user.upsert({
    where: { email: "maria@civicbridge.demo" },
    create: { email: "maria@civicbridge.demo", passwordHash: hash, name: "Maria Garcia", role: "RESIDENT" },
    update: {},
  });

  const issuesData = [
    { title: "Pothole on Main St", category: "Road", severity: "High", status: "Resolved", lat: 28.5355, lng: 77.3910, authorId: resident1.id, departmentId: deptPublic.id },
    { title: "Garbage pile near park", category: "Garbage", severity: "Medium", status: "InProgress", lat: 28.5360, lng: 77.3920, authorId: resident2.id, departmentId: deptPublic.id },
    { title: "Water leak at block 5", category: "Water", severity: "Critical", status: "Assigned", lat: 28.5345, lng: 77.3900, authorId: resident1.id, departmentId: deptWater.id },
    { title: "Streetlight out on Oak Ave", category: "Streetlight", severity: "Low", status: "Submitted", lat: 28.5370, lng: 77.3930, authorId: resident2.id, departmentId: deptPublic.id },
    { title: "Drainage clogged after rain", category: "Drainage", severity: "High", status: "Acknowledged", lat: 28.5350, lng: 77.3915, authorId: resident1.id, departmentId: deptPublic.id },
    { title: "Broken pavement near school", category: "Road", severity: "Medium", status: "Verified", lat: 28.5365, lng: 77.3925, authorId: resident2.id, departmentId: deptPublic.id },
  ];

  for (const d of issuesData) {
    const issue = await prisma.issue.create({
      data: {
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
      },
    });
    await prisma.issueTimeline.create({
      data: { issueId: issue.id, status: issue.status, updatedById: official1.id },
    });
    await prisma.slaTracking.create({
      data: {
        issueId: issue.id,
        targetHours: 72,
        acknowledgedAt: d.status !== "Submitted" ? new Date(Date.now() - 86400000) : null,
        resolvedAt: d.status === "Resolved" || d.status === "Verified" ? new Date() : null,
      },
    });
  }

  const firstTwoIssues = await prisma.issue.findMany({ take: 2 });
  for (const issue of firstTwoIssues) {
    await prisma.comment.create({ data: { issueId: issue.id, authorId: official1.id, body: "We have received your report and will inspect shortly." } });
    await prisma.comment.create({ data: { issueId: issue.id, authorId: resident1.id, body: "Thank you for the update." } });
    await prisma.vote.create({ data: { issueId: issue.id, userId: resident2.id } });
  }

  await prisma.notification.create({
    data: {
      userId: resident1.id,
      type: "StatusUpdate",
      title: "Issue status updated",
      body: "Your report 'Pothole on Main St' is now Resolved.",
      link: "/dashboard/issues",
    },
  });

  const survey = await prisma.survey.create({
    data: {
      title: "Public Works Satisfaction",
      description: "Help us improve services.",
      createdById: official1.id,
      departmentId: deptPublic.id,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      published: true,
    },
  });
  const q = await prisma.surveyQuestion.create({
    data: { surveyId: survey.id, text: "How would you rate road maintenance?", order: 0, options: ["Poor", "Fair", "Good", "Excellent"] },
  });
  await prisma.surveyResponse.create({
    data: { surveyId: survey.id, questionId: q.id, userId: resident1.id, answer: 2 },
  });

  console.log("Seed complete. Login: admin@civicbridge.demo, official@civicbridge.demo, resident@civicbridge.demo — password: Demo123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
