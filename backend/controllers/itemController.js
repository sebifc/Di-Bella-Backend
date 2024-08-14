const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Item = require("../models/itemModel");

// Create Item
const createItem = asyncHandler(async (req, res) => {
  const { sku, category, minimumUnit } = req.body;

  // Validation
  if (!sku) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Create Item
  const supplier = await Item.create({
    user: req.user.id,
    user_name: req.user.name,
    sku,
    category,
    minimumUnit,
  });

  res.status(201).json(supplier);
});

// Get all suppliers
const getItems = asyncHandler(async (req, res) => {
  const suppliers = await Item.find().sort([["-updatedAt", -1]]);
  res.status(200).json(suppliers);
});

// Get single supplier
const getItem = asyncHandler(async (req, res) => {
  const supplier = await Item.findById(req.params.id);
  // if supplier doesnt exist
  if (!supplier) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.status(200).json(supplier);
});

// Delete supplier
const deleteItem = asyncHandler(async (req, res) => {
  const supplier = await Item.findById(req.params.id);
  // if supplier doesnt exist
  if (!supplier) {
    res.status(404);
    throw new Error("Item not found");
  }
  // Match supplier to its user
  if (supplier.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await supplier.remove();
  res.status(200).json({ message: "Item deleted." });
});

// Update supplier
const updateItem = asyncHandler(async (req, res) => {
  const { sku, category, minimumUnit } = req.body;
  const { id } = req.params;

  const supplier = await Item.findById(id);

  // if supplier doesn't exist
  if (!supplier) {
    res.status(404);
    throw new Error("Item not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");
  // Update supplier
  const updatedItem = await Item.findByIdAndUpdate(
    { _id: id },
    {
      sku,
      category,
      minimumUnit,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedItem);
});

module.exports = {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
};
