import connectDB from "@/lib/db/mongoose";
import { PackageModel, IPackage } from "./package.model";
import { NotFoundError } from "@/lib/errors/app-errors";

export interface PackageFilter {
  destination?: string;
  theme?: string;
  travelType?: string;
  nightsMin?: number;
  nightsMax?: number;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class PackageService {
  /**
   * Find a published package by its unique slug with populated components.
   */
  static async findBySlug(slug: string): Promise<IPackage> {
    await connectDB();
    const pkg = await PackageModel.findOne({
      slug: slug.toLowerCase(),
      status: "PUBLISHED",
    })
      .populate("primaryDestination", "name slug type countryCode")
      .populate("destinations", "name slug")
      .populate("coverImage")
      .populate("gallery")
      .populate("itinerary.location", "name slug")
      .populate("itinerary.hotel")
      .populate("itinerary.mealPlan")
      .populate("itinerary.activities")
      .populate("itinerary.transfers.transfer")
      .populate("itinerary.images")
      .populate("relatedPackages", "name slug startingPrice nights coverImage");

    if (!pkg) {
      throw new NotFoundError(`Tour package "${slug}"`);
    }

    return pkg;
  }

  /**
   * List packages with multi-facet filtering and pagination.
   */
  static async list(filter: PackageFilter = {}) {
    await connectDB();
    const {
      destination,
      theme,
      travelType,
      nightsMin,
      nightsMax,
      priceMin,
      priceMax,
      search,
      status = "PUBLISHED",
      page = 1,
      limit = 20,
    } = filter;

    const query: Record<string, unknown> = { status };

    if (destination) {
      query.$or = [
        { primaryDestination: destination },
        { destinations: destination },
      ];
    }
    if (theme) query.theme = theme;
    if (travelType) query.travelType = travelType;
    if (nightsMin !== undefined || nightsMax !== undefined) {
      query.nights = {};
      if (nightsMin !== undefined) (query.nights as Record<string, number>).$gte = nightsMin;
      if (nightsMax !== undefined) (query.nights as Record<string, number>).$lte = nightsMax;
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      query.startingPrice = {};
      if (priceMin !== undefined) (query.startingPrice as Record<string, number>).$gte = priceMin;
      if (priceMax !== undefined) (query.startingPrice as Record<string, number>).$lte = priceMax;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PackageModel.find(query)
        .select(
          "name slug tagline shortDescription primaryDestination nights days startingPrice startingPriceCurrency coverImage theme travelType averageRating reviewCount"
        )
        .populate("primaryDestination", "name slug")
        .populate("coverImage", "publicUrl altText")
        .sort({ publishedAt: -1, startingPrice: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PackageModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all published slugs for SSG / sitemap generation.
   */
  static async getPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    await connectDB();
    return PackageModel.find({ status: "PUBLISHED", isIndexable: true })
      .select("slug updatedAt")
      .lean();
  }
}
