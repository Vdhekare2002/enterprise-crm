const Interaction = require("../models/Interaction");
const Customer = require("../models/Customer");

// Log new call / interaction
exports.addInteraction = async (req, res) => {
  try {
    const {
      customerId,
      callType,
      callStatus,
      outcome,
      notes,
      followUpDate,
      updateLeadStatus,
    } = req.body;

    if (!customerId || !outcome || !notes) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Customer ID, outcome, and notes are required.",
        });
    }

    const interaction = await Interaction.create({
      customer: customerId,
      telecaller: req.user.id,
      callType: callType || "Outbound",
      callStatus: callStatus || "Connected",
      outcome,
      notes,
      followUpDate: followUpDate || null,
    });

    // Optionally update lead status dynamically from interaction form
    if (updateLeadStatus) {
      await Customer.findByIdAndUpdate(customerId, {
        status: updateLeadStatus,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Interaction logged successfully!",
      data: interaction,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get interaction history for a specific customer
exports.getCustomerInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({
      customer: req.params.customerId,
    })
      .populate("telecaller", "name email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: interactions.length, data: interactions });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
