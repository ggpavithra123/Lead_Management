const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const Lead = require("./models/Lead");

const app = express();
const PORT = 4000;

const serializeLead = (lead) => {
  if (!lead) return lead;

  const plain = typeof lead.toObject === "function" ? lead.toObject() : lead;
  const { _id, __v, ...rest } = plain;

  return {
    ...rest,
    id: String(_id || rest.id || ""),
  };
};



const localhostOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

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
    {
      header: "GST Checklist Submitted",
      key: "gstChecklistSubmitted",
      width: 20,
    },
    { header: "GST Submitted At", key: "gstChecklistSubmittedAt", width: 18 },
    { header: "Notes", key: "notes", width: 36 },
  ];

  for (const lead of leads) {
    const serialized = serializeLead(lead);
    worksheet.addRow({
      id: serialized.id,
      name: serialized.name || "",
      phone: serialized.phone || "",
      email: serialized.email || "",
      businessName: serialized.businessName || "",
      service: serialized.service || "",
      source: serialized.source || "",
      status: serialized.status || "",
      documentsStatus: serialized.documentsStatus || "",
      followupDate: serialized.followupDate || "",
      createdDate: dateOnly(serialized.createdAt),
      conversion: serialized.conversion ? "Yes" : "No",
      conversionDate: serialized.conversionDate || "",
      serviceFee: serialized.serviceFee || "",
      gstChecklistSubmitted: serialized.gstChecklistSubmitted ? "Yes" : "No",
      gstChecklistSubmittedAt: dateOnly(serialized.gstChecklistSubmittedAt),
      notes: serialized.notes || "",
    });
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || localhostOriginPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
  }),
);
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/leadmgmt";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

// List leads
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    res.json(leads.map(serializeLead));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// Create lead
app.post("/api/leads", async (req, res) => {
  try {
    const body = req.body || {};
    const lead = await Lead.create(body);
    res.status(201).json(serializeLead(lead));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create lead" });
  }
});

// Update lead
app.put("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const updated = await Lead.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(serializeLead(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update lead" });
  }
});

// Delete lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete lead" });
  }
});

// Load sample data into DB
app.post("/api/leads/load-test-data", async (req, res) => {
  try {
    const count = await Lead.countDocuments();
    if (count > 0) {
      const all = await Lead.find().sort({ createdAt: -1 }).lean();
      return res.json(all.map(serializeLead));
    }

    const now = new Date();
    const dateOnly = (d) => d.toISOString().slice(0, 10);
    const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

    const docs = await Lead.insertMany([
      {
        name: "Ravi Kumar",
        phone: "9876543210",
        email: "ravi@example.com",
        businessName: "Ravi Traders",
        service: "GST Registration",
        source: "Website",
        notes: "Needs registration within 2 weeks",
        status: "Follow-up",
        followupDate: dateOnly(now),
        documentsStatus: "Pending",
      },
      {
        name: "Priya Sharma",
        phone: "9988776655",
        email: "priya@example.com",
        businessName: "Priya Foods",
        service: "FSSAI License",
        source: "Referral",
        notes: "New restaurant chain",
        status: "Converted",
        documentsStatus: "Verified",
        conversion: true,
        conversionDate: dateOnly(daysAgo(7)),
        serviceFee: 15000,
      },
      {
        name: "Arjun Mehta",
        phone: "9123456780",
        email: "arjun@example.com",
        businessName: "Mehta & Co.",
        service: "Company Registration",
        source: "Ads",
        notes: "Wants LLP vs Pvt Ltd guidance",
        status: "Contacted",
        followupDate: dateOnly(daysAgo(-1)),
        documentsStatus: "Received",
      },
    ]);

    res.json(docs.map(serializeLead));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load test data" });
  }
});

// Download reports as excel
app.get("/api/reports/export", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const fileBuffer = await buildReportWorkbookBuffer(leads);
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `lead-report-${timestamp}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${fileName}\"`,
    );
    res.send(fileBuffer);
  } catch (err) {
    console.error(err);
    const reason =
      err && typeof err === "object" && "message" in err
        ? String(err.message)
        : "Unknown error";
    res.status(500).json({ message: `Failed to export report: ${reason}` });
  }
});

// Send reports by email with excel attachment
app.post("/api/reports/export-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body || {};
    const recipients = typeof to === "string" ? to.trim() : "";

    if (!recipients) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || user;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || "false") === "true";

    if (!host || !user || !pass || !from) {
      return res.status(400).json({
        message:
          "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS and MAIL_FROM.",
      });
    }

    const leads = await Lead.find().sort({ createdAt: -1 });
    const fileBuffer = await buildReportWorkbookBuffer(leads);
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `lead-report-${timestamp}.xlsx`;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from,
      to: recipients,
      subject: subject || "Lead Management Report",
      text:
        message ||
        "Please find attached the latest Lead Management report in Excel format.",
      attachments: [
        {
          filename: fileName,
          content: fileBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    res.json({ message: "Report emailed successfully" });
  } catch (err) {
    console.error(err);
    const reason =
      err && typeof err === "object" && "message" in err
        ? String(err.message)
        : "Unknown error";
    res.status(500).json({ message: `Failed to send report email: ${reason}` });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
