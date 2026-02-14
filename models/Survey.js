import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema);
