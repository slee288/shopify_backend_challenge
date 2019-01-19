const mongoose = require("mongoose");

// Product Model
// All fields are required
// Price and inventory_count fields must have values greater than zero
const productSchema = new mongoose.Schema({
  title: {
    unique: true,
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0.00
  },
  inventory_count: {
    type: Number,
    required: true,
    min: 0
  }
})

module.exports = mongoose.model("Product", productSchema);
