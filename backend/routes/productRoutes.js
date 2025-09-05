// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

const auth = require("../middleware/auth"); 
const Product = require("../models/product"); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ====== Add Product ======
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "wholesaler") {
      return res.status(403).json({ message: "Only wholesalers can add products" });
    }

    const productData = {
      name: req.body.name,
      sku: req.body.sku,
      price: req.body.price,
      description: req.body.description,
      stock_qty: req.body.stock_qty,
      wholesaler_id: req.user.userId, // token se
      image_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    const product = await Product.create(productData);

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});


// Get all products for retailers
router.get("/", auth, async (req, res) => {
  try {
    // If role is retailer, return all products
    if (req.user.role === "retailer") {
      const products = await Product.find(); // all wholesalers' products
      return res.json(products);
    }

    // If wholesaler, return only their products
    const products = await Product.find({ wholesaler_id: req.user.userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ====== Update Product ======
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "wholesaler") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== Delete Product ======
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "wholesaler") {
      return res.status(403).json({ message: "Access denied" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Check low stock
router.get("/low-stock", auth, async (req, res) => {
  try {
    const products = await Product.find();

    const updatedProducts = products.map(p => ({
      ...p._doc,
      lowStock: p.stock_qty < 5
    }));

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ====== Bulk Upload Products ======
router.post("/bulk-upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "wholesaler") {
      return res.status(403).json({ message: "Only wholesalers can bulk upload" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const products = [];
    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        products.push({
          name: row.name,
          sku: row.sku,
          price: row.price,
          description: row.description,
          stock_qty: row.stock_qty,
          wholesaler_id: req.user.userId,
          image_url: row.image_url || null, // agar CSV me diya ho
        });
      })
      .on("end", async () => {
        try {
          const inserted = await Product.insertMany(products);
          res.status(201).json({ message: "Products uploaded", count: inserted.length });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Failed to save products" });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
