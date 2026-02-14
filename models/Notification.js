import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["StatusUpdate", "Comment", "Survey", "SLAAlert", "Assignment"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: null },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1 });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
