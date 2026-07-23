import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const fixAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI not found in .env file!");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("⚡ Connected to MongoDB Atlas...");

    // Remove any previous conflicting accounts
    await User.deleteMany({
      email: {
        $in: ["vaishnavi.admin@gmail.com", "vaishnavi1.admin@gmail.com"],
      },
    });

    // Encrypt password
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // Try Capital 'Admin' first (which matches common schemas)
    let roleValue = "Admin";

    // Check user schema enum values if available
    const roleEnum = User.schema.path("role")?.enumValues;
    if (roleEnum && roleEnum.length > 0) {
      console.log("📋 Your Schema Allowed Roles are:", roleEnum);
      roleValue = roleEnum.includes("admin") ? "admin" : roleEnum[0];
    }

    // Create fresh Admin
    const newAdmin = await User.create({
      name: "Vaishnavi Admin",
      email: "vaishnavi1.admin@gmail.com",
      password: hashedPassword,
      role: roleValue,
    });

    console.log("-----------------------------------------");
    console.log("✅ NEW ADMIN CREATED SUCCESSFULLY!");
    console.log("📧 Email:", newAdmin.email);
    console.log("🔑 Password: Password@123");
    console.log("👤 Role assigned:", newAdmin.role);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

fixAdmin();
