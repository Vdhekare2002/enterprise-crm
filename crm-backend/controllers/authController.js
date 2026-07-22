const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || "super_secret_crm_jwt_key_2026_production",
    { expiresIn: "7d" },
  );
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required.",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "telecaller",
      phone: phone || "",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide email and password.",
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Account disabled. Contact administrator.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
