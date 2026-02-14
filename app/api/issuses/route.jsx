import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

/* =========================================================
   1️⃣ ZOD SCHEMA – REQUEST BODY VALIDATION
========================================================= */

const createIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description too short"),
  category: z.enum(["Road", "Garbage", "Water", "Electricity"]),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

/* =========================================================
   2️⃣ ZOD SCHEMA – AUTH HEADER VALIDATION
========================================================= */

const authHeaderSchema = z
  .string()
  .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Invalid authorization format");

/* =========================================================
   3️⃣ ROUTE HANDLER
========================================================= */

export async function POST(req) {
  try {
    /* =============================
       AUTHENTICATION
    ============================= */

    const authHeader = req.headers.get("authorization");

    const parsedAuth = authHeaderSchema.safeParse(authHeader);

    if (!parsedAuth.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = parsedAuth.data.split(" ")[1];

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    /* =============================
       REQUEST BODY VALIDATION
    ============================= */

    const body = await req.json();
    const parsedBody = createIssueSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedBody.data;

    /* =============================
       CREATE ISSUE IN DATABASE
    ============================= */

    const issue = await prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        status: "Submitted",
        location: {
          type: "Point",
          coordinates: [data.location.lng, data.location.lat],
        },
        images: data.images || [],
        createdBy: user.id,
        priorityScore: 1, // You can calculate dynamically
      },
    });

    /* =============================
       CREATE TIMELINE ENTRY
    ============================= */

    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        status: "Submitted",
        updatedBy: user.id,
      },
    });

    /* =============================
       SUCCESS RESPONSE
    ============================= */

    return NextResponse.json(
      {
        success: true,
        message: "Issue created successfully",
        data: {
          issueId: issue.id,
          status: issue.status,
          estimatedResponseTime: "48 hours",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/issues error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
