import { z } from "zod";

const categoryEnum = z.enum([
  "Road",
  "Garbage",
  "Water",
  "Electricity",
  "Sanitation",
  "Streetlight",
  "Drainage",
  "Other",
]);
const severityEnum = z.enum(["Low", "Medium", "High", "Critical"]);
const statusEnum = z.enum([
  "Submitted",
  "Acknowledged",
  "Assigned",
  "InProgress",
  "Resolved",
  "Verified",
]);

export const createIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: categoryEnum,
  severity: severityEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const updateIssueSchema = z.object({
  status: statusEnum.optional(),
  assignedToId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  note: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(100).default(5),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
