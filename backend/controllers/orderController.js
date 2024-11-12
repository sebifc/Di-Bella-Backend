const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Stock = require("../models/stockModel");

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
    expiration: moment(item.expiration).isValid()
      ? moment(item.expiration).format("YYYY-MM-DD HH:mm")
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

  for (const item of processedSku) {
    await updateStock(item.item, order._id, item.minimumUnit);
  }

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
    .populate({
      path: "sku.item",
      model: "Item",
    })
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

  // Dejo el stock como estaba antes de crear la orden
  for (const itemInStock of order.sku) {
    await updateStock(itemInStock.item, order._id, -itemInStock.minimumUnit);
  }

  await order.remove();
  res.status(200).json({ message: "Order deleted." });
});

const updateOrder = asyncHandler(async (req, res) => {
  let { sku, supplier, refer, invoiceNumber, transport, hygienic } = req.body;
  const { id } = req.params;

  supplier = typeof supplier === "string" ? JSON.parse(supplier) : supplier;
  sku = typeof sku === "string" ? JSON.parse(sku) : sku;

  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Dejo el stock como estaba antes de crear la orden
  for (const itemInStock of order.sku) {
    await updateStock(itemInStock.item, order._id, -itemInStock.minimumUnit);
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");

  const updatedOrder = await Order.findByIdAndUpdate(
    { _id: id },
    {
      sku,
      supplier,
      refer,
      invoiceNumber,
      transport,
      hygienic,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // Actualizar el stock de cada SKU una vez que la orden ha sido creada
  for (const item of sku) {
    // Aquí `item.item` es el ID del SKU y `item.minimumUnit` es la cantidad que estamos comprando
    await updateStock(item.item, order._id, item.minimumUnit);
  }

  res.status(200).json(updatedOrder);
});

// Función para actualizar el stock
const updateStock = async (itemId, orderId, quantityChange) => {
  quantityChange = parseInt(quantityChange);
  const stockRecord = await Stock.findOne({ sku: itemId, order: orderId });

  if (stockRecord) {
    stockRecord.quantity += quantityChange;
    await stockRecord.save();
  } else if (quantityChange > 0) {
    // Solo crea un registro nuevo si la cantidad es positiva
    await Stock.create({
      sku: itemId,
      order: orderId,
      quantity: quantityChange,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
  updateOrder,
};
