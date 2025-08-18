const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    sku: String,
    image_url: String,
  },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
