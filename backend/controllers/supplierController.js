const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Supplier = require("../models/supplierModel");

// Create Supplier
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    cuit,
    contact,
    address,
    email,
    paymentMethod,
    qualified,
    type,
    code,
  } = req.body;

  // Validation
  if (
    !name ||
    !phone ||
    !cuit ||
    !contact ||
    !address ||
    !email ||
    !paymentMethod ||
    !qualified ||
    !code
  ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Create Supplier
  const supplier = await Supplier.create({
    user: req.user.id,
    user_name: req.user.name,
    name,
    phone,
    cuit,
    contact,
    address,
    email,
    paymentMethod,
    qualified,
    type,
    code,
  });

  res.status(201).json(supplier);
});

// Get all suppliers
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort("-updatedAt");
  res.status(200).json(suppliers);
});

// Get single supplier
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  // if supplier doesnt exist
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.status(200).json(supplier);
});

// Delete supplier
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  // if supplier doesnt exist
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  // Match supplier to its user
  if (supplier.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await supplier.remove();
  res.status(200).json({ message: "Supplier deleted." });
});

// Update supplier
const updateSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    cuit,
    contact,
    address,
    email,
    paymentMethod,
    qualified,
    type,
    code,
  } = req.body;
  const { id } = req.params;
  console.log(req.body);

  const supplier = await Supplier.findById(id);

  // if supplier doesn't exist
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");
  // Update supplier
  const updatedSupplier = await Supplier.findByIdAndUpdate(
    { _id: id },
    {
      name,
      phone,
      cuit,
      contact,
      address,
      email,
      paymentMethod,
      qualified,
      type,
      code,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedSupplier);
});

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplier,
  deleteSupplier,
  updateSupplier,
};
