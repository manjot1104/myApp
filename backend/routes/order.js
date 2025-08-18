const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/product");

// Place Order
router.post("/", auth, async (req, res) => {
  try {
    const { items, total_amount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // Validate stock for each product
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.userId,
      items,
      total_amount,
      status: "Pending",
      createdAt: new Date(),
    });
    await order.save();

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock_qty: -item.quantity },
      });
    }

    // Clear cart
    await Cart.deleteMany({ user: req.user.userId });

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// Get order history of logged-in user
router.get("/history", auth, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "retailer") {
      // Retailer: Apne orders
      orders = await Order.find({ user: req.user.userId })
        .populate("items.product_id", "name price")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "wholesaler") {
      // Wholesaler: Unke products ke liye aaye huye orders
      orders = await Order.find()
        .populate({
          path: "items.product_id",
          match: { wholesaler_id: req.user.userId }, // sirf wholesaler ke products
          select: "name price",
        })
        .populate("user", "name email") // Retailer ka naam/email
        .sort({ createdAt: -1 });

      orders = orders.filter(order =>
        order.items.some(item => item.product_id !== null)
      );
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    res.json(orders);
  } catch (err) {
    console.error("Order history error:", err);
    res.status(500).json({ message: "Failed to fetch order history" });
  }
});


// Reorder by previous order ID
router.post("/reorder/:id", auth, async (req, res) => {
  try {
    const oldOrder = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!oldOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create new order with same items
    const newOrder = new Order({
      user: req.user.userId,
      items: oldOrder.items,
      total_amount: oldOrder.total_amount,
      status: "Pending"
    });

    await newOrder.save();
    res.json({ message: "Reorder placed successfully", order: newOrder });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ message: "Failed to reorder" });
  }
});

// Update order status

router.put("/update-status/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "wholesaler") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});


// GET all orders for wholesaler
router.get("/all", auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // Retailer info
      .populate("items.product_id", "name price") // Product info
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});



module.exports = router;
