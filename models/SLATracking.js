import mongoose from "mongoose";

const slaTrackingSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    acknowledgedAt: { type: Date, default: null },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    targetHours: { type: Number, required: true },
    breached: { type: Boolean, default: false },
  },
  { timestamps: true }
);

slaTrackingSchema.index({ issueId: 1 });

export const SLATracking = mongoose.models.SLATracking || mongoose.model("SLATracking", slaTrackingSchema);
