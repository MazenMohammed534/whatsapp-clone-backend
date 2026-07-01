import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.file;
    // Generate unique name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const fileName = file.name.split(ext)[0] + "-" + uniqueSuffix + ext;

    const uploadPath = path.join(__dirname, "../../public/uploads");
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, fileName);

    await file.mv(filePath);

    // Build absolute URL to local server file
    const fileUrl = `${req.protocol}://${req.get("host")}/public/uploads/${fileName}`;

    res.json({
      secure_url: fileUrl,
      url: fileUrl,
      public_id: fileName,
      resource_type: file.mimetype.split("/")[0],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
