import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

commentSchema.index({ issueId: 1 });

export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
