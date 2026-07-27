const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Absolute CORS Permissions
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// DB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_db";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ DB Connection Error:", err.message));

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "manager", "telecaller"],
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

// Protect Middleware
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

// Routes
app.get("/", (req, res) => res.send("🚀 CRM API Running!"));

app.post("/api/v1/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Fields required" });

    const cleanEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || "superadmin",
      phone,
    });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res
      .status(201)
      .json({
        success: true,
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
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res
      .status(200)
      .json({
        success: true,
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

app.get("/api/v1/customers", protect, async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
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
      status: status || "New",
      assignedTo:
        assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)
          ? assignedTo
          : null,
    });

    res
      .status(201)
      .json({ success: true, message: "Customer Created!", data: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clean ObjectId Patch Route
app.patch("/api/v1/customers/:id", protect, async (req, res) => {
  try {
    const cleanId = String(req.params.id)
      .split(":")[0]
      .replace(/[^a-fA-F0-9]/g, "")
      .trim();

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid MongoDB Customer ID" });
    }

    const updateData = { ...req.body };
    if (
      !updateData.assignedTo ||
      !mongoose.Types.ObjectId.isValid(updateData.assignedTo)
    ) {
      delete updateData.assignedTo;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      cleanId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("assignedTo", "name email");

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer record not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Updated successfully!",
        data: updatedCustomer,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/v1/customers/:id", protect, async (req, res) => {
  try {
    const cleanId = String(req.params.id)
      .split(":")[0]
      .replace(/[^a-fA-F0-9]/g, "")
      .trim();
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deletedCustomer = await Customer.findByIdAndDelete(cleanId);
    if (!deletedCustomer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Master Server running on port ${PORT}`));
