import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Road", "Garbage", "Water", "Electricity", "Sanitation", "Streetlight", "Drainage", "Other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Acknowledged", "Assigned", "InProgress", "Resolved", "Verified"],
      default: "Submitted",
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: null },
    city: { type: String, default: null },
    priorityScore: { type: Number, default: 0 },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ latitude: 1, longitude: 1 });
issueSchema.index({ departmentId: 1 });
issueSchema.index({ createdById: 1 });

export const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);
