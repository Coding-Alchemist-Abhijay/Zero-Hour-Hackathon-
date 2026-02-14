import mongoose from "mongoose";

const issueTimelineSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    status: {
      type: String,
      enum: ["Submitted", "Acknowledged", "Assigned", "InProgress", "Resolved", "Verified"],
      required: true,
    },
    note: { type: String, default: null },
    updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

issueTimelineSchema.index({ issueId: 1 });

export const IssueTimeline = mongoose.models.IssueTimeline || mongoose.model("IssueTimeline", issueTimelineSchema);
