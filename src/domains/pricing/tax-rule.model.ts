import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ITaxRule extends Document {
  name: string;
  type: "GST" | "VAT" | "SERVICE_TAX";
  rate: number;
  appliesTo: string[];
  isCompound: boolean;
  isActive: boolean;
  validFrom?: Date;
  createdAt: Date;
}

const TaxRuleSchema = new Schema<ITaxRule>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["GST", "VAT", "SERVICE_TAX"], required: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    appliesTo: [{ type: String }],
    isCompound: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date },
  },
  { timestamps: false, collection: "tax_rules" }
);

TaxRuleSchema.index({ isActive: 1, type: 1 });

export const TaxRuleModel: Model<ITaxRule> =
  mongoose.models.TaxRule ?? mongoose.model<ITaxRule>("TaxRule", TaxRuleSchema);

export default TaxRuleModel;
