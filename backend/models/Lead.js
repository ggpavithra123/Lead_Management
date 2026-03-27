const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    businessName: { type: String, required: true },
    service: { type: String, required: true },
    source: { type: String, required: true },
    notes: { type: String },
    status: { type: String, default: "New Lead" },
    followupDate: { type: String },
    documentsStatus: { type: String, default: "Pending" },
    conversion: { type: Boolean, default: false },
    conversionDate: { type: String },
    serviceFee: { type: Number },
    // GST checklist fields
    gstPan: { type: Boolean, default: false },
    gstAadhaar: { type: Boolean, default: false },
    gstAddressProof: { type: Boolean, default: false },
    gstRentAgreementNoc: { type: Boolean, default: false },
    gstBankProof: { type: Boolean, default: false },
    gstBusinessProof: { type: Boolean, default: false },
    gstDsc: { type: Boolean, default: false },
    gstChecklistSubmitted: { type: Boolean, default: false },
    gstChecklistSubmittedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
