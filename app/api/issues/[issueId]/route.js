import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

/* =========================================================
   1️⃣ ZOD SCHEMA – REQUEST BODY VALIDATION
========================================================= */

const updateIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(20, "Description too short").optional(),
  category: z.enum(["Road", "Garbage", "Water", "Electricity"]).optional(),
  severity: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }).optional(),
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
   3️⃣ ROUTE HANDLERS
========================================================= */

export async function GET(req, { params }) {
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
       FETCH ISSUE
    ============================= */

    const issue = await prisma.issue.findUnique({
      where: {
        id: params.issueId,
        createdBy: user.id,
      },
      include: {
        timeline: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    /* =============================
       SUCCESS RESPONSE
    ============================= */

    return NextResponse.json(
      {
        success: true,
        data: {
          id: issue.id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          severity: issue.severity,
          status: issue.status,
          location: {
            lat: issue.location.coordinates[1],
            lng: issue.location.coordinates[0],
          },
          address: issue.address,
          city: issue.city,
          images: issue.images,
          priorityScore: issue.priorityScore,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          timeline: issue.timeline,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/issues/[issueId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
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
    const parsedBody = updateIssueSchema.safeParse(body);

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
       CHECK IF ISSUE EXISTS AND USER OWNS IT
    ============================= */

    const existingIssue = await prisma.issue.findUnique({
      where: {
        id: params.issueId,
      },
    });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    if (existingIssue.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to edit this issue" },
        { status: 403 }
      );
    }

    /* =============================
       UPDATE ISSUE IN DATABASE
    ============================= */

    const updateData = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.severity) updateData.severity = data.severity;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.images) updateData.images = data.images;

    if (data.location) {
      if (data.location.lat !== undefined && data.location.lng !== undefined) {
        updateData.location = {
          type: "Point",
          coordinates: [data.location.lng, data.location.lat],
        };
      } else if (data.location.lat !== undefined) {
        updateData.location = {
          type: "Point",
          coordinates: [existingIssue.location.coordinates[0], data.location.lat],
        };
      } else if (data.location.lng !== undefined) {
        updateData.location = {
          type: "Point",
          coordinates: [data.location.lng, existingIssue.location.coordinates[1]],
        };
      }
    }

    const updatedIssue = await prisma.issue.update({
      where: {
        id: params.issueId,
      },
      data: updateData,
    });

    /* =============================
       CREATE TIMELINE ENTRY
    ============================= */

    await prisma.issueTimeline.create({
      data: {
        issueId: updatedIssue.id,
        status: updatedIssue.status,
        updatedBy: user.id,
      },
    });

    /* =============================
       SUCCESS RESPONSE
    ============================= */

    return NextResponse.json(
      {
        success: true,
        message: "Issue updated successfully",
        data: {
          id: updatedIssue.id,
          title: updatedIssue.title,
          description: updatedIssue.description,
          category: updatedIssue.category,
          severity: updatedIssue.severity,
          status: updatedIssue.status,
          location: {
            lat: updatedIssue.location.coordinates[1],
            lng: updatedIssue.location.coordinates[0],
          },
          address: updatedIssue.address,
          city: updatedIssue.city,
          images: updatedIssue.images,
          priorityScore: updatedIssue.priorityScore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/issues/[issueId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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
       CHECK IF ISSUE EXISTS AND USER OWNS IT
    ============================= */

    const existingIssue = await prisma.issue.findUnique({
      where: {
        id: params.issueId,
      },
    });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    if (existingIssue.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this issue" },
        { status: 403 }
      );
    }

    /* =============================
       DELETE ISSUE FROM DATABASE
    ============================= */

    await prisma.issue.delete({
      where: {
        id: params.issueId,
      },
    });

    /* =============================
       SUCCESS RESPONSE
    ============================= */

    return NextResponse.json(
      {
        success: true,
        message: "Issue deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/issues/[issueId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}