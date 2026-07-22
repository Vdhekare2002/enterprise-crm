const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, default: "" },
    city: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Interested",
        "In Negotiation",
        "Closed Won",
        "Closed Lost",
      ],
      default: "New",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    estimatedValue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
