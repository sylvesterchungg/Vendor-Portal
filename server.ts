import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Setup SQLite database
const db = new Database("suppliers.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    companyName TEXT NOT NULL,
    contactName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    taxId TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplierId TEXT NOT NULL,
    documentType TEXT NOT NULL,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supplierId) REFERENCES suppliers(id)
  );
`);

// Setup multer for file uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// API Routes
app.post("/api/suppliers", upload.any(), (req, res) => {
  try {
    const { companyName, contactName, email, phone, taxId } = req.body;
    
    // Generate unique Supplier ID (e.g., SUP-20231015-ABCD)
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const supplierId = `SUP-${dateStr}-${randomStr}`;

    const stmt = db.prepare(
      "INSERT INTO suppliers (id, companyName, contactName, email, phone, taxId) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(supplierId, companyName, contactName, email, phone, taxId);

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const docStmt = db.prepare(
        "INSERT INTO documents (supplierId, documentType, fileName, filePath) VALUES (?, ?, ?, ?)"
      );
      
      for (const file of files) {
        docStmt.run(supplierId, file.fieldname, file.originalname, file.path);
      }
    }

    res.status(201).json({ success: true, supplierId });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

app.get("/api/suppliers", (req, res) => {
  try {
    const suppliers = db.prepare("SELECT * FROM suppliers ORDER BY createdAt DESC").all();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

app.get("/api/suppliers/:id", (req, res) => {
  try {
    const supplier = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const documents = db.prepare("SELECT * FROM documents WHERE supplierId = ?").all(req.params.id);
    res.json({ ...supplier, documents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supplier details" });
  }
});

app.patch("/api/suppliers/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare("UPDATE suppliers SET status = ? WHERE id = ?");
    const info = stmt.run(status, req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Download document route
app.get("/api/documents/:id/download", (req, res) => {
  try {
    const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(req.params.id) as any;
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.download(doc.filePath, doc.fileName);
  } catch (error) {
    res.status(500).json({ error: "Failed to download document" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
