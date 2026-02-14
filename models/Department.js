import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    city: { type: String, default: null },
  },
  { timestamps: true }
);

export const Department = mongoose.models.Department || mongoose.model("Department", departmentSchema);
