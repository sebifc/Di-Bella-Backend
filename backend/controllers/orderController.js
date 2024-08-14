const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

const createOrder = asyncHandler(async (req, res) => {
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

  supplier = JSON.parse(supplier);
  sku = JSON.parse(sku);

  if (
    sku.length === 0 ||
    !minimumUnit ||
    !brand ||
    !ean13 ||
    !batch ||
    !expiration ||
    supplier.length === 0 ||
    !refer ||
    !invoiceNumber ||
    !itemPurchasePrice ||
    (transport == null && transport === undefined) ||
    !hygienic
  ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const order = await Order.create({
    user: req.user.id,
    user_name: req.user.name,
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
  });

  res.status(201).json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("sku")
    .populate("supplier")
    .sort([["-updatedAt", -1]]);
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
