const Customer = require("../models/Customer");

// Get Customers (Telecallers see only assigned leads; Admins see all)
exports.getCustomers = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "telecaller") {
      query.assignedTo = req.user.id;
    }

    const customers = await Customer.find(query)
      .populate("assignedTo", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Create Single Lead
exports.addCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      city,
      status,
      estimatedValue,
      assignedTo,
    } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and phone are required.",
        });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company: company || "",
      city: city || "",
      status: status || "New",
      estimatedValue: estimatedValue || 0,
      assignedTo:
        assignedTo || (req.user.role === "telecaller" ? req.user.id : null),
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Customer added successfully!",
        data: customer,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update Customer Lead Status / Info
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    // Telecallers can only update their assigned leads
    if (
      req.user.role === "telecaller" &&
      customer.assignedTo?.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this customer.",
        });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    return res
      .status(200)
      .json({
        success: true,
        message: "Customer updated successfully!",
        data: customer,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Assign Lead to Telecaller (Admin / Manager Only)
exports.assignCustomer = async (req, res) => {
  try {
    const { telecallerId } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { assignedTo: telecallerId },
      { new: true },
    ).populate("assignedTo", "name email");

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Lead assigned successfully!",
        data: customer,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete Lead (Admin Only)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    await customer.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
