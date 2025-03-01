const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User,Pdf } = require("./models");
require("dotenv").config();
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, dailyScans: 20 });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/check-scans", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ canScan: user.dailyScans > 0, remainingScans: user.dailyScans });
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
});

const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const gemini = new GoogleGenerativeAI('AIzaSyBLdHctUwhQvqS1_z-uWdD0rr6C_WnQEYQ');

app.post("/scan", upload.single("file"), async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.dailyScans <= 0) return res.status(400).json({ error: "Scan limit exceeded" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    console.log("fileName: ", fileName);
    
    const fileBase64 = fileBuffer.toString("base64");
    
    console.log("Base64 File Generated Successfully");
    
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Extract all information from this document and return it as a structured JSON object in key-value format. 
    For each field, create a key that describes the data and its corresponding value. 
    Do not include any explanatory text, only return valid JSON.`;
    
    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: prompt },
            { inlineData: { mimeType: req.file.mimetype, data: fileBase64 } }
          ] 
        }
      ],
    });
    
    console.log("Gemini API Response:", result);
    
    let extractedText = result.response.candidates[0]?.content?.parts[0]?.text || "{}";
    
    extractedText = extractedText.trim();
    if (extractedText.startsWith("```json")) {
      extractedText = extractedText.substring(7);
    }
    if (extractedText.endsWith("```")) {
      extractedText = extractedText.substring(0, extractedText.length - 3);
    }
    extractedText = extractedText.trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(extractedText);
      console.log("Extracted and parsed data:", JSON.stringify(parsedData, null, 2));
      
    } catch (error) {
      console.error("Error parsing JSON:", error);
      parsedData = { error: "Failed to parse extracted text as JSON" };
    }
    
    await user.update({ dailyScans: user.dailyScans - 1 });
    
    await Pdf.create({user_id: user.id, pdf_name: fileName, extracted_json: parsedData});
    res.json({ 
      message: "Scan successful", 
      data: parsedData, 
      remainingScans: user.dailyScans 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/reset-scans", async (req, res) => {
  try {
    await User.update({ dailyScans: 20 }, { where: {} });
    res.json({ message: "Daily scans reset" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getScannedDetail", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const scannedDocs = await Pdf.findAll({
      where: { user_id: userId },
      attributes: ["id", "pdf_name", "extracted_json", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({ scannedDocs });
  } catch (error) {
    console.error("Error fetching scanned details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
