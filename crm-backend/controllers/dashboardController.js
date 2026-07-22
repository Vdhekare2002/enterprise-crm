const Customer = require("../models/Customer");
const User = require("../models/User");
const Interaction = require("../models/Interaction");

exports.getDashboardStats = async (req, res) => {
  try {
    let customerQuery = {};
    let interactionQuery = {};

    // Telecallers get their personal analytics
    if (req.user.role === "telecaller") {
      customerQuery.assignedTo = req.user.id;
      interactionQuery.telecaller = req.user.id;
    }

    const totalCustomers = await Customer.countDocuments(customerQuery);
    const totalTelecallers = await User.countDocuments({ role: "telecaller" });
    const totalInteractions =
      await Interaction.countDocuments(interactionQuery);

    // Group leads by status
    const statusStats = await Customer.aggregate([
      { $match: customerQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formattedStatus = {};
    statusStats.forEach((item) => {
      formattedStatus[item._id] = item.count;
    });

    // Total Pipeline Valuation
    const revenueStats = await Customer.aggregate([
      { $match: customerQuery },
      { $group: { _id: null, totalValue: { $sum: "$estimatedValue" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalTelecallers,
        totalInteractions,
        pipelineValue: revenueStats[0]?.totalValue || 0,
        leadsByStatus: formattedStatus,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
