import mongoose from "mongoose";

const surveyQuestionSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
    text: { type: String, required: true },
    order: { type: Number, default: 0 },
    options: { type: [String], default: [] },
  },
  { timestamps: true }
);

surveyQuestionSchema.index({ surveyId: 1 });

export const SurveyQuestion = mongoose.models.SurveyQuestion || mongoose.model("SurveyQuestion", surveyQuestionSchema);
