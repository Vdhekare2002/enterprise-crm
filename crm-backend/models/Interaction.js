const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    telecaller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["Outbound", "Inbound", "Email", "Meeting"],
      default: "Outbound",
    },
    callStatus: {
      type: String,
      enum: ["Connected", "Busy", "No Answer", "Wrong Number"],
      default: "Connected",
    },
    outcome: {
      type: String,
      enum: [
        "Interested",
        "Follow Up Required",
        "Not Interested",
        "Deal Closed",
      ],
      required: true,
    },
    notes: { type: String, required: true },
    followUpDate: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Interaction", interactionSchema);
