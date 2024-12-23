const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Item = require("../models/itemModel");

// Create Item
const createItem = asyncHandler(async (req, res) => {
  const { sku, category, presentation, description } = req.body;

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
    description,
    presentation,
  });

  res.status(201).json(supplier);
});

// Get all suppliers
const getItems = asyncHandler(async (req, res) => {
  const suppliers = await Item.find().sort("sku");
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
  const { sku, category, description, presentation } = req.body;
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
      description,
      presentation,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedItem);
});

const saveSalePrice = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res
      .status(400)
      .json({ message: "Invalid data format. Expected an array." });
  }

  const updates = await items.map(async ([sku, brand, salePrice]) => {
    try {
      const item = await Item.findOne({ sku });

      if (!item) {
        return { error: `Item with sku ${sku} not found.` };
      }

      const priceIndex = item.itemSalePrices.findIndex(
        (p) => p.brand === brand
      );

      if (priceIndex !== -1) {
        // Actualizar precio existente
        item.itemSalePrices[priceIndex].price = salePrice;
      } else {
        // Agregar nuevo precio para la marca
        item.itemSalePrices.push({ brand, price: salePrice });
      }

      await item.save();
      return item;
    } catch (error) {
      return { error: error.message };
    }
  });

  try {
    const results = await Promise.all(updates);
    res.status(200).json({
      message: "Ya se cargaron los nuevos precios a los items",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el precio de los items",
      error: error.message,
    });
  }
});

const getItemsValued = asyncHandler(async (req, res) => {
  try {
    // Consultar todos los items
    const items = await Item.find();

    // Transformar los datos para incluir cada combinación de marca y precio en una fila
    const result = items.flatMap((item) =>
      item.itemSalePrices.map((price) => ({
        sku: item.sku,
        category: item.category,
        description: item.description,
        presentation: item.presentation,
        brand: price.brand,
        price: price.price,
      }))
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching items.", error: error.message });
  }
});

module.exports = {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
  saveSalePrice,
  getItemsValued,
};
