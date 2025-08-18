const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    wholesaler_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User (wholesaler)
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    stock_qty: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
