const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const Lead = require("./models/Lead");

const app = express();
const PORT = process.env.PORT || 4000;

//
// ✅ CORS FIX (supports localhost + all Vercel deployments)
//
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());

//
// ✅ MongoDB Connection
//
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/leadmgmt";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

//
// ✅ Helper Functions
//
const serializeLead = (lead) => {
  if (!lead) return lead;

  const plain = typeof lead.toObject === "function" ? lead.toObject() : lead;
  const { _id, __v, ...rest } = plain;

  return {
    ...rest,
    id: String(_id || rest.id || ""),
  };
};

const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

//
// ✅ Excel Report Generator
//
const buildReportWorkbookBuffer = async (leads) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads Report");

  worksheet.columns = [
    { header: "Lead ID", key: "id", width: 28 },
    { header: "Client Name", key: "name", width: 24 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Business", key: "businessName", width: 24 },
    { header: "Service", key: "service", width: 24 },
    { header: "Source", key: "source", width: 16 },
    { header: "Status", key: "status", width: 16 },
    { header: "Documents", key: "documentsStatus", width: 14 },
    { header: "Follow-up Date", key: "followupDate", width: 14 },
    { header: "Created Date", key: "createdDate", width: 14 },
    { header: "Converted", key: "conversion", width: 12 },
    { header: "Conversion Date", key: "conversionDate", width: 14 },
    { header: "Service Fee", key: "serviceFee", width: 12 },
    { header: "GST Checklist Submitted", key: "gstChecklistSubmitted", width: 20 },
    { header: "GST Submitted At", key: "gstChecklistSubmittedAt", width: 18 },
    { header: "Notes", key: "notes", width: 36 },
  ];

  leads.forEach((lead) => {
    const l = serializeLead(lead);

    worksheet.addRow({
      id: l.id,
      name: l.name || "",
      phone: l.phone || "",
      email: l.email || "",
      businessName: l.businessName || "",
      service: l.service || "",
      source: l.source || "",
      status: l.status || "",
      documentsStatus: l.documentsStatus || "",
      followupDate: l.followupDate || "",
      createdDate: dateOnly(l.createdAt),
      conversion: l.conversion ? "Yes" : "No",
      conversionDate: l.conversionDate || "",
      serviceFee: l.serviceFee || "",
      gstChecklistSubmitted: l.gstChecklistSubmitted ? "Yes" : "No",
      gstChecklistSubmittedAt: dateOnly(l.gstChecklistSubmittedAt),
      notes: l.notes || "",
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

//
// ✅ Routes
//

// Health check
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Get all leads
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    res.json(leads.map(serializeLead));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// Create lead
app.post("/api/leads", async (req, res) => {
  try {
    const lead = await Lead.create(req.body || {});
    res.status(201).json(serializeLead(lead));
  } catch {
    res.status(500).json({ message: "Failed to create lead" });
  }
});

// Update lead
app.put("/api/leads/:id", async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body || {},
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json(serializeLead(updated));
  } catch {
    res.status(500).json({ message: "Failed to update lead" });
  }
});

// Delete lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.status(204).end();
  } catch {
    res.status(500).json({ message: "Failed to delete lead" });
  }
});

// Load test data
app.post("/api/leads/load-test-data", async (req, res) => {
  try {
    const count = await Lead.countDocuments();

    if (count > 0) {
      const data = await Lead.find().sort({ createdAt: -1 }).lean();
      return res.json(data.map(serializeLead));
    }

    const now = new Date();
    const sample = await Lead.insertMany([
      {
        name: "Ravi Kumar",
        phone: "9876543210",
        email: "ravi@example.com",
        businessName: "Ravi Traders",
        service: "GST Registration",
        status: "Follow-up",
        followupDate: dateOnly(now),
      },
    ]);

    res.json(sample.map(serializeLead));
  } catch {
    res.status(500).json({ message: "Failed to load test data" });
  }
});

// Export Excel
app.get("/api/reports/export", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const buffer = await buildReportWorkbookBuffer(leads);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

    res.send(buffer);
  } catch {
    res.status(500).json({ message: "Export failed" });
  }
});

// Send Email
app.post("/api/reports/export-email", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: "Email required" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const leads = await Lead.find();
    const buffer = await buildReportWorkbookBuffer(leads);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Lead Report",
      text: "Attached report",
      attachments: [{ filename: "report.xlsx", content: buffer }],
    });

    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: "Email failed" });
  }
});

//
// ✅ Start server
//
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
