import mongoose from "mongoose";

const issueImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

issueImageSchema.index({ issueId: 1 });

export const IssueImage = mongoose.models.IssueImage || mongoose.model("IssueImage", issueImageSchema);
