const asyncHandler = require("express-async-handler");
const Remito = require("../models/remitoModel");
const moment = require("moment");

const getRemitos = asyncHandler(async (req, res) => {
  const remitos = await Remito.find()
    .populate("client")
    .populate("sale")
    .sort([["-updatedAt", -1]]);
  res.status(200).json(remitos);
});

const getRemito = asyncHandler(async (req, res) => {
  const remito = await Remito.findById(req.params.id)
    .populate("client")
    .populate("sale")
    .populate({
      path: "items.sku",
      model: "Item",
    });
  if (!remito) {
    res.status(404);
    throw new Error("El presupuesto no fue encontrado");
  }

  res.status(200).json(remito);
});

module.exports = {
  getRemitos,
  getRemito,
};
