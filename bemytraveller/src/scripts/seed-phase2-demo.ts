import mongoose from "mongoose";
import { DestinationModel } from "../domains/destinations/destination.model";
import { MediaModel } from "../domains/media/media.model";
import { FAQModel } from "../domains/cms/faq.model";
import { ReviewModel } from "../domains/cms/review.model";
import { RedirectModel } from "../domains/seo/redirect.model";
import { UserModel } from "../domains/auth/user.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bemytraveller";

async function seedPhase2() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  // 1. Get or create admin user for createdBy references
  let admin = await UserModel.findOne({ role: "SUPER_ADMIN" });
  if (!admin) {
    admin = await UserModel.create({
      email: "admin@bemytraveller.com",
      name: "Be My Traveller Admin",
      passwordHash: "hash_placeholder",
      role: "SUPER_ADMIN",
      isActive: true,
    });
  }

  console.log("Creating demo media items...");
  const mediaItems = await MediaModel.insertMany([
    {
      filename: "himachal-snow-peaks.webp",
      r2Key: "destinations/himachal-snow-peaks.webp",
      publicUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80",
      mimeType: "image/webp",
      size: 320000,
      altText: "Snow clad Himalayan peaks of Himachal Pradesh",
      folder: "destinations",
      tags: ["himachal", "mountains", "snow"],
      uploadedBy: admin._id,
    },
    {
      filename: "kerala-tea-gardens.webp",
      r2Key: "destinations/kerala-tea-gardens.webp",
      publicUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80",
      mimeType: "image/webp",
      size: 410000,
      altText: "Lush green tea plantations in Munnar Kerala",
      folder: "destinations",
      tags: ["kerala", "munnar", "tea"],
      uploadedBy: admin._id,
    },
    {
      filename: "jaipur-amber-fort.webp",
      r2Key: "destinations/jaipur-amber-fort.webp",
      publicUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80",
      mimeType: "image/webp",
      size: 280000,
      altText: "Historic Amber Fort in Jaipur Rajasthan",
      folder: "destinations",
      tags: ["rajasthan", "jaipur", "forts"],
      uploadedBy: admin._id,
    },
  ]);

  console.log("Creating demo destinations...");
  const existingDest = await DestinationModel.findOne({ slug: "himachal-pradesh" });
  if (!existingDest) {
    const himachal = await DestinationModel.create({
      slug: "himachal-pradesh",
      name: "Himachal Pradesh",
      type: "STATE",
      tagline: "Land of Gods and Majestic Himalayan Heights",
      shortDescription: "A northern Indian state in the Himalayas known for dramatic mountain towns, trekking circuits, and scenic valleys.",
      highlights: ["Solang Valley ATV", "Rohtang Snow Pass", "Old Manali Cafes", "Spiti High Desert"],
      coverImage: mediaItems[0]._id,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 1,
      seo: {
        title: "Himachal Pradesh Tour Packages & Travel Guide | BMT",
        metaDescription: "Explore bespoke Himachal Pradesh tour packages with curated stays in Manali, Shimla, Dharamshala, and Spiti Valley.",
        primaryKeyword: "himachal tour packages",
      },
      faqs: [
        {
          question: "When is the best time to see snow in Himachal?",
          answer: "December through February offers heavy snowfall in Manali, Solang Valley, and Rohtang Pass.",
        },
      ],
      createdBy: admin._id,
    });

    await DestinationModel.create({
      slug: "manali",
      name: "Manali",
      type: "CITY",
      parent: himachal._id,
      ancestors: [himachal._id],
      tagline: "High-Altitude Resort Town & Adventure Capital",
      shortDescription: "A rustic Himalayan resort town set on the Beas River, famed for snow sports, pine forests, and vibrant cafe culture.",
      highlights: ["Solang Valley Adventure", "Hadimba Temple", "Jogini Waterfalls Trek"],
      coverImage: mediaItems[0]._id,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 2,
      seo: {
        title: "Manali Tour Packages & Local Experiences | Be My Traveller",
        metaDescription: "Book hand-crafted Manali tour packages with luxury riverside resorts, ATV rides, and private local transfers.",
        primaryKeyword: "manali tour packages",
      },
      createdBy: admin._id,
    });

    await DestinationModel.create({
      slug: "kerala",
      name: "Kerala",
      type: "STATE",
      tagline: "God's Own Country",
      shortDescription: "A tropical coastal paradise renowned for palm-lined backwaters, spice plantations, and Ayurvedic retreats.",
      highlights: ["Alleppey Houseboat", "Munnar Tea Hills", "Varkala Cliff Beach"],
      coverImage: mediaItems[1]._id,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 3,
      seo: {
        title: "Kerala Tour Packages & Backwaters Cruises | Be My Traveller",
        metaDescription: "Experience authentic Kerala with luxury houseboat cruises, tea estate villas, and private cultural tours.",
        primaryKeyword: "kerala tour packages",
      },
      createdBy: admin._id,
    });

    await DestinationModel.create({
      slug: "rajasthan",
      name: "Rajasthan",
      type: "STATE",
      tagline: "The Royal Land of Forts and Palaces",
      shortDescription: "India's desert jewel adorned with grand palaces, invincible hilltop forts, and vibrant folk heritage.",
      highlights: ["Amber Fort Light Show", "Thar Desert Safari", "Lake Pichola Sunset Boat"],
      coverImage: mediaItems[2]._id,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 4,
      seo: {
        title: "Rajasthan Heritage Tour Packages | Be My Traveller",
        metaDescription: "Discover royal Rajasthan packages covering Jaipur, Udaipur, Jodhpur, and Jaisalmer with heritage havelis.",
        primaryKeyword: "rajasthan tour packages",
      },
      createdBy: admin._id,
    });
  }

  console.log("Creating demo FAQs & Redirects...");
  await FAQModel.create([
    {
      question: "Can I customize the hotel category and room types?",
      answer: "Yes! Every Be My Traveller package allows seamless hotel upgrades between Standard, Deluxe, Luxury Resort, and Heritage Villa tiers.",
      category: "CUSTOMIZATION",
      isGlobal: true,
      createdBy: admin._id,
    },
    {
      question: "Are airport transfers included in all packages?",
      answer: "All our private itineraries include dedicated sanitized vehicles for arrival pickup, local sightseeing, and departure drop-off.",
      category: "BOOKING",
      isGlobal: true,
      createdBy: admin._id,
    },
  ]);

  await RedirectModel.create({
    fromPath: "/old-himachal-tours",
    toPath: "/destinations/himachal-pradesh",
    statusCode: 301,
    reason: "Taxonomy migration",
    createdBy: admin._id,
  });

  console.log("✅ Phase 2 Demo Seed completed successfully.");
  await mongoose.disconnect();
}

seedPhase2().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
