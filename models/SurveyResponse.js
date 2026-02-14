import mongoose from "mongoose";

const surveyResponseSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyQuestion", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

surveyResponseSchema.index({ surveyId: 1 });
surveyResponseSchema.index({ userId: 1 });

export const SurveyResponse = mongoose.models.SurveyResponse || mongoose.model("SurveyResponse", surveyResponseSchema);
