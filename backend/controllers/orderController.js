const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

const createOrder = asyncHandler(async (req, res) => {
  let { date, product, brand, supplier, batch, expiration, invoiceNumber } =
    req.body;

  supplier = JSON.parse(supplier);
  product = JSON.parse(product);

  if (
    !date ||
    product.length === 0 ||
    !brand ||
    supplier.length === 0 ||
    !batch ||
    !expiration ||
    !invoiceNumber
  ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const order = await Order.create({
    user: req.user.id,
    user_name: req.user.name,
    date: moment(date).format("YYYY-MM-DD HH:mm"),
    product,
    brand,
    supplier,
    batch,
    expiration: moment(expiration).format("YYYY-MM-DD HH:mm"),
    invoiceNumber,
  });

  res.status(201).json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("product")
    .populate("supplier")
    .sort("-updatedAt");
  res.status(200).json(orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("product")
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
  let { date, product, brand, supplier, batch, expiration, invoiceNumber } =
    req.body;
  const { id } = req.params;

  supplier = JSON.parse(supplier);
  product = JSON.parse(product);

  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");

  const updatedOrder = await Order.findByIdAndUpdate(
    { _id: id },
    {
      date: moment(date).format("YYYY-MM-DD HH:mm"),
      product,
      brand,
      supplier,
      batch,
      expiration: moment(expiration).format("YYYY-MM-DD HH:mm"),
      invoiceNumber,
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
