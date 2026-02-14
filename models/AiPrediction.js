import mongoose from "mongoose";

const aiPredictionSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true, unique: true },
    category: { type: String, default: null },
    priorityScore: { type: Number, default: null },
    estimatedResolutionDays: { type: Number, default: null },
    riskZone: { type: String, default: null },
    rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export const AiPrediction = mongoose.models.AiPrediction || mongoose.model("AiPrediction", aiPredictionSchema);
