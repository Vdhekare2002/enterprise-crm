const jwt = require("jsonwebtoken");

// Protect routes via JWT Verification
exports.protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_crm_jwt_key_2026_production",
    );
    req.user = decoded; // Contains id, role, and email
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token expired or invalid." });
  }
};

// Role-Based Access Control (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};
