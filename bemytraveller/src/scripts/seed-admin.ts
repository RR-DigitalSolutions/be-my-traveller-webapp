// ============================================================
// Seed Script — Creates the first SUPER_ADMIN user
// Run once during initial setup:
//   npx ts-node --project tsconfig.json src/scripts/seed-admin.ts
// Or via package.json script: npm run seed:admin
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Direct import — no path aliases in scripts
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set. Create a .env.local file first.");
  process.exit(1);
}

async function seedAdmin() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("✅ Connected");

  // Inline schema to avoid circular import issues in scripts
  const UserSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true },
      name: { type: String, required: true },
      passwordHash: { type: String, required: true },
      role: { type: String, required: true },
      permissions: [String],
      isActive: { type: Boolean, default: true },
      isTwoFactorEnabled: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

  const email = "admin@bemytraveller.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const password = "ChangeMe@2025!"; // CHANGE ON FIRST LOGIN
  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    email,
    name: "Be My Traveller Admin",
    passwordHash,
    role: "SUPER_ADMIN",
    permissions: [],
    isActive: true,
  });

  console.log("✅ Super Admin created:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("⚠️  IMPORTANT: Change the password after first login!");

  await mongoose.disconnect();
  console.log("✅ Done.");
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
