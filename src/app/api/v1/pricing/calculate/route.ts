import { NextRequest } from "next/server";
import { z } from "zod";
import { PricingEngine } from "@/domains/pricing/pricing.engine";
import { apiSuccess, apiError } from "@/lib/errors/app-errors";

const calculatePricingSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
  travelDateFrom: z.string().transform((val) => new Date(val)),
  travelDateTo: z.string().transform((val) => new Date(val)),
  travellers: z.object({
    adults: z.number().min(1).default(2),
    children: z.number().min(0).default(0),
    infants: z.number().min(0).default(0),
  }),
  hotelCategory: z.string().optional(),
  selectedActivities: z.array(z.string()).optional(),
  selectedTransfers: z.array(z.string()).optional(),
  selectedAddOns: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = calculatePricingSchema.parse(body);

    const result = await PricingEngine.calculate(data);

    return apiSuccess(result, 200);
  } catch (error) {
    return apiError(error);
  }
}
