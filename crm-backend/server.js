const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ================= 1. DATABASE CONNECTION =================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_db";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ DB Connection Error:", err.message));

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ================= 2. MONGOOSE MODELS =================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "telecaller"],
      default: "superadmin",
    },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, default: "" },
    status: { type: String, default: "New" },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const Customer = mongoose.model("Customer", customerSchema);

// ================= 3. AUTH MIDDLEWARE =================
const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token verification failed" });
  }
};

// ================= 4. API ENDPOINTS =================

// Test Route
app.get("/", (req, res) =>
  res.send("🚀 CRM Master API is Running Flawlessly!"),
);

// --- AUTH ROUTES ---
app.post("/api/v1/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, Email & Password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "superadmin",
      phone,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(201).json({
      success: true,
      message: "Registered!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({
      success: true,
      message: "Logged in!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CUSTOMER / LEADS ROUTES ---
app.get("/api/v1/customers", protect, async (req, res) => {
  try {
    const customers = await Customer.find().populate(
      "assignedTo",
      "name email",
    );
    res
      .status(200)
      .json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/v1/customers", protect, async (req, res) => {
  try {
    const { name, email, phone, company, status, assignedTo } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ message: "Name, Email & Phone required" });

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      status,
      assignedTo,
    });
    res
      .status(201)
      .json({ success: true, message: "Customer Created!", data: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DASHBOARD ROUTE ---
app.get("/api/v1/dashboard/stats", protect, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalTelecallers = await User.countDocuments({ role: "telecaller" });
    res
      .status(200)
      .json({ success: true, data: { totalCustomers, totalTelecallers } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= 5. START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Master Server running on port ${PORT}`));
