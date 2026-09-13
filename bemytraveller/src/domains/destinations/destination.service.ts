import connectDB from "@/lib/db/mongoose";
import { DestinationModel, IDestination } from "./destination.model";
import { NotFoundError } from "@/lib/errors/app-errors";

export interface DestinationFilter {
  type?: string;
  parent?: string;
  isFeatured?: boolean;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class DestinationService {
  /**
   * Find a published destination by its unique slug.
   */
  static async findBySlug(slug: string): Promise<IDestination> {
    await connectDB();
    const destination = await DestinationModel.findOne({
      slug: slug.toLowerCase(),
      status: "PUBLISHED",
    })
      .populate("parent", "name slug type")
      .populate("coverImage")
      .populate("gallery")
      .populate({
        path: "attractions",
        match: { status: "PUBLISHED" },
        populate: { path: "coverImage" },
      })
      .populate({
        path: "featuredActivities",
        match: { status: "PUBLISHED" },
        populate: { path: "coverImage" },
      });

    if (!destination) {
      throw new NotFoundError(`Destination "${slug}"`);
    }

    return destination;
  }

  /**
   * List destinations with filtering and pagination.
   */
  static async list(filter: DestinationFilter = {}) {
    await connectDB();
    const {
      type,
      parent,
      isFeatured,
      status = "PUBLISHED",
      search,
      page = 1,
      limit = 20,
    } = filter;

    const query: Record<string, unknown> = { status };

    if (type) query.type = type;
    if (parent) query.parent = parent;
    if (typeof isFeatured === "boolean") query.isFeatured = isFeatured;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DestinationModel.find(query)
        .select("name slug type tagline shortDescription coverImage isFeatured sortOrder")
        .populate("coverImage", "publicUrl altText")
        .sort({ sortOrder: 1, isFeatured: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationModel.countDocuments(query),
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
    return DestinationModel.find({ status: "PUBLISHED", isIndexable: true })
      .select("slug updatedAt")
      .lean();
  }
}
