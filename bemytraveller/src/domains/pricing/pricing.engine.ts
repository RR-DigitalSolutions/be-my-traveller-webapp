// ============================================================
// Pricing Engine — Server-Side Calculation Service
//
// This is the authoritative price calculation service.
// It is ONLY called server-side (Server Actions, Route Handlers).
// The frontend NEVER submits a price — only a PricingInput.
// The server re-runs this calculation before every booking.
// ============================================================

import connectDB from "@/lib/db/mongoose";
import { PricingRuleModel } from "./pricing-rule.model";
import { CouponModel } from "./coupon.model";
import { TaxRuleModel } from "./tax-rule.model";

// ── Types ────────────────────────────────────────────────────

export interface PricingInput {
  packageId: string;
  travelDateFrom: Date;
  travelDateTo: Date;
  travellers: {
    adults: number;
    children: number;
    infants: number;
  };
  hotelCategory?: string;
  selectedActivities?: string[]; // Activity ObjectIds (non-included)
  selectedTransfers?: string[];  // Transfer ObjectIds (non-included)
  selectedAddOns?: string[];
  couponCode?: string;
  agentId?: string;
}

export type LineItemType =
  | "BASE"
  | "SINGLE_SUPPLEMENT"
  | "SEASON_SURCHARGE"
  | "HOTEL_UPGRADE"
  | "ACTIVITY"
  | "TRANSFER"
  | "ADDON"
  | "MARKUP"
  | "DISCOUNT"
  | "COUPON"
  | "TAX";

export interface PricingLineItem {
  type: LineItemType;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  isIncluded: boolean; // part of base price, not an extra charge
}

export interface PricingResult {
  items: PricingLineItem[];
  subtotal: number;
  discountAmount: number;
  couponDiscount: number;
  taxAmount: number;
  totalAmount: number;
  pricePerAdult: number;
  currency: string;
  validUntil: Date;
  calculatedAt: Date;
  pricingRuleId: string;
}

// ── Engine ───────────────────────────────────────────────────

export class PricingEngine {
  /**
   * Calculate the full authoritative price for a given PricingInput.
   * Throws if no active pricing rule is found for the package.
   */
  static async calculate(input: PricingInput): Promise<PricingResult> {
    await connectDB();

    const { travellers, travelDateFrom, hotelCategory, couponCode } = input;
    const { adults, children, infants } = travellers;

    // 1. Fetch active pricing rule
    const rule = await PricingRuleModel.findOne({
      package: input.packageId,
      isActive: true,
      validFrom: { $lte: travelDateFrom },
      $or: [
        { validTo: { $exists: false } },
        { validTo: null },
        { validTo: { $gte: travelDateFrom } },
      ],
    }).populate("taxRules");

    if (!rule) {
      throw new Error(
        `No active pricing rule found for package ${input.packageId}`
      );
    }

    const currency = rule.currency;
    const items: PricingLineItem[] = [];

    // 2. Base price (occupancy-based)
    let pricePerAdult = rule.baseAdultPrice;
    const occupancyOverride = rule.occupancyPricing.find(
      (o) => o.pax === adults
    );
    if (occupancyOverride) {
      pricePerAdult = occupancyOverride.pricePerAdult;
    }

    const baseAdultTotal = pricePerAdult * adults;
    items.push({
      type: "BASE",
      name: "Base Package Price",
      description: `${adults} adult${adults > 1 ? "s" : ""} × ₹${pricePerAdult.toLocaleString()}`,
      quantity: adults,
      unitPrice: pricePerAdult,
      totalPrice: baseAdultTotal,
      currency,
      isIncluded: true,
    });

    // 3. Child pricing
    if (children > 0 && rule.baseChildPrice) {
      const childTotal = rule.baseChildPrice * children;
      items.push({
        type: "BASE",
        name: "Child Price (with bed)",
        quantity: children,
        unitPrice: rule.baseChildPrice,
        totalPrice: childTotal,
        currency,
        isIncluded: true,
      });
    }

    // 4. Infant pricing
    if (infants > 0 && rule.baseInfantPrice) {
      const infantTotal = rule.baseInfantPrice * infants;
      items.push({
        type: "BASE",
        name: "Infant Price",
        quantity: infants,
        unitPrice: rule.baseInfantPrice,
        totalPrice: infantTotal,
        currency,
        isIncluded: true,
      });
    }

    // 5. Single supplement
    if (adults === 1 && rule.baseSingleSupplement > 0) {
      items.push({
        type: "SINGLE_SUPPLEMENT",
        name: "Single Occupancy Supplement",
        quantity: 1,
        unitPrice: rule.baseSingleSupplement,
        totalPrice: rule.baseSingleSupplement,
        currency,
        isIncluded: false,
      });
    }

    // 6. Season surcharges
    for (const season of rule.seasonRules) {
      const travelDate = travelDateFrom;
      if (travelDate >= season.fromDate && travelDate <= season.toDate) {
        let surchargeTotal = 0;
        const paxCount =
          (season.appliesToAdult ? adults : 0) +
          (season.appliesToChild ? children : 0);

        if (season.surchargeType === "FLAT") {
          surchargeTotal = season.surchargeValue * paxCount;
        } else {
          // PERCENTAGE — applied on base adult price
          surchargeTotal =
            (pricePerAdult * season.surchargeValue) / 100 * paxCount;
        }

        items.push({
          type: "SEASON_SURCHARGE",
          name: `${season.name} Surcharge`,
          description: `${season.surchargeType === "PERCENTAGE" ? season.surchargeValue + "%" : "₹" + season.surchargeValue} per person`,
          quantity: paxCount,
          unitPrice:
            season.surchargeType === "FLAT"
              ? season.surchargeValue
              : (pricePerAdult * season.surchargeValue) / 100,
          totalPrice: surchargeTotal,
          currency,
          isIncluded: false,
        });
      }
    }

    // 7. Hotel category upgrade
    if (hotelCategory) {
      const upgrade = rule.hotelUpgrades.find(
        (h) => h.category === hotelCategory
      );
      if (upgrade && upgrade.additionalPerPerson > 0) {
        const upgradeTotal = upgrade.additionalPerPerson * adults;
        items.push({
          type: "HOTEL_UPGRADE",
          name: `${hotelCategory} Hotel Upgrade`,
          quantity: adults,
          unitPrice: upgrade.additionalPerPerson,
          totalPrice: upgradeTotal,
          currency,
          isIncluded: false,
        });
      }
    }

    // 8. Selected activities (non-included)
    if (input.selectedActivities?.length) {
      for (const activityId of input.selectedActivities) {
        const ap = rule.activityPricing.find(
          (a) => a.activity.toString() === activityId && !a.isIncluded
        );
        if (ap) {
          const actTotal =
            ap.pricePerAdult * adults +
            (ap.pricePerChild ?? 0) * children;
          items.push({
            type: "ACTIVITY",
            name: "Activity",
            description: `Activity ID: ${activityId}`,
            quantity: adults + children,
            unitPrice: ap.pricePerAdult,
            totalPrice: actTotal,
            currency,
            isIncluded: false,
          });
        }
      }
    }

    // 9. Subtotal before discount
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    // 10. Coupon validation
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
      });

      if (coupon) {
        if (
          coupon.applicablePackages.length === 0 ||
          coupon.applicablePackages
            .map((p) => p.toString())
            .includes(input.packageId)
        ) {
          if (coupon.discountType === "FLAT") {
            couponDiscount = coupon.discountValue;
          } else {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount) {
              couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
            }
          }

          items.push({
            type: "COUPON",
            name: `Coupon: ${couponCode.toUpperCase()}`,
            quantity: 1,
            unitPrice: -couponDiscount,
            totalPrice: -couponDiscount,
            currency,
            isIncluded: false,
          });

          // Increment usage count
          await CouponModel.updateOne(
            { _id: coupon._id },
            { $inc: { usageCount: 1 } }
          );
        }
      }
    }

    const afterDiscount = subtotal - couponDiscount;

    // 11. Tax calculation
    let taxAmount = 0;
    // taxRules are populated from the rule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const taxRule of rule.taxRules as any[]) {
      if (!taxRule.isActive) continue;
      const taxBase = taxRule.isCompound ? afterDiscount + taxAmount : afterDiscount;
      const thisTax = (taxBase * taxRule.rate) / 100;
      taxAmount += thisTax;
    }

    if (taxAmount > 0) {
      items.push({
        type: "TAX",
        name: "Taxes & Fees (GST)",
        quantity: 1,
        unitPrice: taxAmount,
        totalPrice: taxAmount,
        currency,
        isIncluded: false,
      });
    }

    const totalAmount = Math.round((afterDiscount + taxAmount) * 100) / 100;

    // 12. Quote validity: 7 days from calculation
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: 0,
      couponDiscount: Math.round(couponDiscount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount,
      pricePerAdult: Math.round(pricePerAdult * 100) / 100,
      currency,
      validUntil,
      calculatedAt: new Date(),
      pricingRuleId: rule._id.toString(),
    };
  }
}
