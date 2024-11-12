const mongoose = require("mongoose");

const stockSchema = mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  blocked: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;
