const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

const createOrder = asyncHandler(async (req, res) => {
  let {
    sku, // Array de objetos que contiene la información de cada SKU
    supplier,
    refer,
    invoiceNumber,
    transport,
    hygienic,
  } = req.body;

  // Parseamos supplier y sku si vienen como strings JSON
  supplier = typeof supplier === "string" ? JSON.parse(supplier) : supplier;
  sku = typeof sku === "string" ? JSON.parse(sku) : sku;

  // Verificamos que sku no esté vacío y que al menos un SKU tenga los campos obligatorios
  if (!sku || sku.length === 0 || !sku.every((item) => item.minimumUnit)) {
    res.status(400);
    throw new Error("Please fill in all fields for each SKU");
  }

  // Mapeamos cada SKU para manejar la conversión de expiration
  const processedSku = sku.map((item) => ({
    item: item.item, // ID del SKU
    minimumUnit: item.minimumUnit,
    brand: item.brand,
    ean13: item.ean13,
    batch: item.batch,
    expiration:
      item.expiration && moment(item.expiration, "DD/MM/YYYY").isValid()
        ? moment(item.expiration, "DD/MM/YYYY").format("YYYY-MM-DD")
        : null,
    itemPurchasePrice: item.itemPurchasePrice,
  }));

  // Creamos la nueva orden
  const order = await Order.create({
    user: req.user.id,
    user_name: req.user.name,
    sku: processedSku, // Guardamos el array de SKU con sus detalles
    supplier,
    refer,
    invoiceNumber,
    transport,
    hygienic,
  });

  res.status(201).json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate({
      path: "sku.item",
      model: "Item",
    })
    .populate("supplier")
    .sort([["updatedAt", -1]]);

  res.status(200).json(orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("sku")
    .populate("supplier");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json(order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  // Match order to its user
  if (order.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await order.remove();
  res.status(200).json({ message: "Order deleted." });
});

const updateOrder = asyncHandler(async (req, res) => {
  let {
    sku,
    minimumUnit,
    brand,
    ean13,
    batch,
    expiration,
    supplier,
    refer,
    invoiceNumber,
    itemPurchasePrice,
    transport,
    hygienic,
  } = req.body;
  const { id } = req.params;

  supplier = JSON.parse(supplier);
  sku = JSON.parse(sku);

  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");

  const updatedOrder = await Order.findByIdAndUpdate(
    { _id: id },
    {
      sku,
      minimumUnit,
      brand,
      ean13,
      batch,
      expiration: moment(expiration).format("YYYY-MM-DD HH:mm"),
      supplier,
      refer,
      invoiceNumber,
      itemPurchasePrice,
      transport,
      hygienic,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedOrder);
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
  updateOrder,
};
