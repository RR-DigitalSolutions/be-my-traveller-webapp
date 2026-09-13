import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongoose";
import { LeadModel } from "@/domains/crm/lead.model";
import { apiSuccess, apiError } from "@/lib/errors/app-errors";

const createLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  packageId: z.string().optional(),
  destinations: z.array(z.string()).optional(),
  travelDates: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
      flexible: z.boolean().default(false),
    })
    .optional(),
  travellers: z
    .object({
      adults: z.number().min(1).default(2),
      children: z.number().default(0),
      infants: z.number().default(0),
    })
    .default({ adults: 2, children: 0, infants: 0 }),
  budget: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default("INR"),
    })
    .optional(),
  hotelCategory: z.string().optional(),
  themes: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
  source: z.string().default("DIRECT"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  landingPage: z.string().optional(),
  referrer: z.string().optional(),
  device: z.enum(["MOBILE", "TABLET", "DESKTOP"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createLeadSchema.parse(body);

    await connectDB();

    const lead = await LeadModel.create({
      ...data,
      travelDates: data.travelDates
        ? {
            from: data.travelDates.from ? new Date(data.travelDates.from) : undefined,
            to: data.travelDates.to ? new Date(data.travelDates.to) : undefined,
            flexible: data.travelDates.flexible,
          }
        : undefined,
      status: "NEW",
    });

    return apiSuccess(
      {
        id: lead._id,
        message: "Enquiry submitted successfully. Our travel specialists will contact you shortly.",
      },
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
