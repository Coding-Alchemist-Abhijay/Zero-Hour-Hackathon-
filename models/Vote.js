import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

voteSchema.index({ issueId: 1, userId: 1 }, { unique: true });
voteSchema.index({ userId: 1 });

export const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);
