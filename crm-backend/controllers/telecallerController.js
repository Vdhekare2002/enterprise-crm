const User = require("../models/User");
const Customer = require("../models/Customer");

// Get all telecallers with active lead count
exports.getTelecallers = async (req, res) => {
  try {
    const telecallers = await User.find({ role: "telecaller" }).select(
      "-password",
    );

    const telecallersWithCounts = await Promise.all(
      telecallers.map(async (tc) => {
        const leadCount = await Customer.countDocuments({ assignedTo: tc._id });
        return {
          ...tc.toObject(),
          totalAssignedLeads: leadCount,
        };
      }),
    );

    return res
      .status(200)
      .json({
        success: true,
        count: telecallersWithCounts.length,
        data: telecallersWithCounts,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Toggle Telecaller Active/Inactive status
exports.toggleTelecallerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Telecaller not found." });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Telecaller status set to ${user.isActive ? "Active" : "Inactive"}`,
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
