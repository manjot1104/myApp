const express =require("express");
const Cart =require("../models/Cart.js");
const auth =require("../middleware/auth.js"); // your JWT auth middleware
const Product = require("../models/product.js"); // make sure the path is correct

const router = express.Router();

// Add product to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId; // <-- must match JWT payload

    if (!userId) return res.status(400).json({ message: "User ID missing" });
    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cartItem = await Cart.findOne({ userId, "product._id": product._id });
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({ userId, product, quantity });
    }

    await cartItem.save();
    res.status(200).json({ message: "Product added to cart", cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message || "Failed to add to cart" });
  }
});

// Get user cart
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.find({ userId });
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// Update cart quantity
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    // Get cart item
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    // Get product stock
    const product = await Product.findById(cartItem.product._id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock_qty) {
      return res.status(400).json({ message: `Maximum stock available: ${product.stock_qty}` });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update cart item" });
  }
});

// Remove from cart
router.delete("/remove/:id", auth, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

module.exports = router;
