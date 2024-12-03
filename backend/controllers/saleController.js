const asyncHandler = require("express-async-handler");
const Sale = require("../models/saleModel");
const moment = require("moment");

const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .populate("client")
    .sort([["-updatedAt", -1]]);
  res.status(200).json(sales);
});

const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("client").populate({
    path: "items.sku",
    model: "Item",
  });
  if (!sale) {
    res.status(404);
    throw new Error("El presupuesto no fue encontrado");
  }

  res.status(200).json(sale);
});

const updateSale = asyncHandler(async (req, res) => {
  const { invoiceNumber, deliveryTime, deliveryPlace, receivingDelivery } =
    req.body;
  const { id } = req.params;

  console.log(req.body);
  console.log(req.params);
  

  const sale = await Sale.findById(id);

  // if sale doesn't exist
  if (!sale) {
    res.status(404);
    throw new Error("sale not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");
  // Update sale
  const updatedSale = await Sale.findByIdAndUpdate(
    { _id: id },
    {
      invoiceNumber,
      deliveryTime,
      deliveryPlace,
      receivingDelivery,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedSale);
});

module.exports = {
  getSales,
  getSale,
  updateSale,
};
