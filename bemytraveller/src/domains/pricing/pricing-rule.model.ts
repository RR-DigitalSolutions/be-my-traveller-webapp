// ============================================================
// Pricing Rule Model
// Authoritative server-side pricing for packages.
// NEVER trust frontend pricing — always compute server-side.
// ============================================================

import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ISeasonRule {
  _id: mongoose.Types.ObjectId;
  name: string;
  fromDate: Date;
  toDate: Date;
  surchargeType: "FLAT" | "PERCENTAGE";
  surchargeValue: number;
  appliesToAdult: boolean;
  appliesToChild: boolean;
}

export interface IOccupancyPricing {
  pax: number;
  pricePerAdult: number;
}

export interface IActivityPricing {
  activity: mongoose.Types.ObjectId;
  pricePerAdult: number;
  pricePerChild?: number;
  isIncluded: boolean;
}

export interface ITransferPricing {
  transfer: mongoose.Types.ObjectId;
  pricePerUnit: number;
  isIncluded: boolean;
}

export interface IHotelUpgradePricing {
  category: string;
  additionalPerPerson: number;
}

export interface IPricingRule extends Document {
  package: mongoose.Types.ObjectId;
  currency: string;

  baseAdultPrice: number;
  baseSingleSupplement: number;
  baseChildPrice?: number;
  baseChildNoSeatPrice?: number;
  baseInfantPrice?: number;

  occupancyPricing: IOccupancyPricing[];
  seasonRules: ISeasonRule[];
  hotelUpgrades: IHotelUpgradePricing[];
  activityPricing: IActivityPricing[];
  transferPricing: ITransferPricing[];

  markupType: "FLAT" | "PERCENTAGE";
  markupValue: number;

  taxRules: mongoose.Types.ObjectId[];

  validFrom: Date;
  validTo?: Date;
  isActive: boolean;

  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonRuleSchema = new Schema<ISeasonRule>(
  {
    name: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    surchargeType: { type: String, enum: ["FLAT", "PERCENTAGE"], required: true },
    surchargeValue: { type: Number, required: true, min: 0 },
    appliesToAdult: { type: Boolean, default: true },
    appliesToChild: { type: Boolean, default: false },
  },
  { _id: true }
);

const PricingRuleSchema = new Schema<IPricingRule>(
  {
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    currency: { type: String, default: "INR", maxlength: 3 },

    baseAdultPrice: { type: Number, required: true, min: 0 },
    baseSingleSupplement: { type: Number, default: 0, min: 0 },
    baseChildPrice: { type: Number, min: 0 },
    baseChildNoSeatPrice: { type: Number, min: 0 },
    baseInfantPrice: { type: Number, min: 0 },

    occupancyPricing: [
      {
        pax: { type: Number, required: true },
        pricePerAdult: { type: Number, required: true, min: 0 },
      },
    ],
    seasonRules: { type: [SeasonRuleSchema], default: [] },
    hotelUpgrades: [
      {
        category: { type: String, required: true },
        additionalPerPerson: { type: Number, required: true, min: 0 },
      },
    ],
    activityPricing: [
      {
        activity: { type: Schema.Types.ObjectId, ref: "Activity", required: true },
        pricePerAdult: { type: Number, required: true, min: 0 },
        pricePerChild: { type: Number, min: 0 },
        isIncluded: { type: Boolean, default: false },
      },
    ],
    transferPricing: [
      {
        transfer: { type: Schema.Types.ObjectId, ref: "Transfer", required: true },
        pricePerUnit: { type: Number, required: true, min: 0 },
        isIncluded: { type: Boolean, default: false },
      },
    ],

    markupType: { type: String, enum: ["FLAT", "PERCENTAGE"], default: "PERCENTAGE" },
    markupValue: { type: Number, default: 0, min: 0 },

    taxRules: [{ type: Schema.Types.ObjectId, ref: "TaxRule" }],

    validFrom: { type: Date, required: true },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    collection: "pricing_rules",
  }
);

PricingRuleSchema.index({ package: 1, isActive: 1 });
PricingRuleSchema.index({
  "seasonRules.fromDate": 1,
  "seasonRules.toDate": 1,
});

export const PricingRuleModel: Model<IPricingRule> =
  mongoose.models.PricingRule ??
  mongoose.model<IPricingRule>("PricingRule", PricingRuleSchema);

export default PricingRuleModel;
