import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IMealPlan extends Document {
  code: "EP" | "CP" | "MAP" | "AP" | "AI";
  name: string;
  includes: string[];
  costPerAdultPerDay: number;
  costPerChildPerDay?: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    code: {
      type: String,
      enum: ["EP", "CP", "MAP", "AP", "AI"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    includes: [{ type: String }],
    costPerAdultPerDay: { type: Number, required: true, min: 0 },
    costPerChildPerDay: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "meal_plans" }
);

export const MealPlanModel: Model<IMealPlan> =
  mongoose.models.MealPlan ??
  mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);

export default MealPlanModel;
