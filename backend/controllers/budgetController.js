const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Budget = require("../models/budgetModel");
const Stock = require("../models/stockModel");

const ProspectStatus = Object.freeze({
  Borrador: 0,
  Rechazado: 1,
  Aprobado: 2,
  AprobadoModificaciones: 3,
});

const createBudget = asyncHandler(async (req, res) => {
  const { client, status, paymentMethod, items } = req.body;

  if (!client) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const budget = await Budget.create({
    user: req.user.id,
    user_name: req.user.name,
    client,
    budgetDate: moment().format("YYYY-MM-DD"),
    items,
    prospectStatus: status,
    paymentMethod,
  });

  res.status(201).json(budget);
});

const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find()
    .populate("client")
    .sort([["-updatedAt", -1]]);
  res.status(200).json(budgets);
});

const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id)
    .populate("client")
    .populate({
      path: "items.sku",
      model: "Item",
    });
  if (!budget) {
    res.status(404);
    throw new Error("El presupuesto no fue encontrado");
  }

  res.status(200).json(budget);
});

const deleteBudget = asyncHandler(async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      res.status(404);
      throw new Error("El presupuesto no fue encontrado");
    }
    // Match budget to its user
    if (budget.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("User not authorized");
    }

    if (![ProspectStatus.Borrador].includes(budget.prospectStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Solo se pueden eliminar presupuestos en estado Pendiente o Borrador",
      });
    }

    // Desbloquea el stock reservado
    const stockReservations = budget.stockReservations || [];

    for (const reservation of stockReservations) {
      const { stockId, reservedQuantity } = reservation;

      const stock = await Stock.findById(stockId);

      if (stock) {
        stock.blocked -= reservedQuantity;
        if (stock.blocked < 0) stock.blocked = 0; // Evita valores negativos
        await stock.save();
      }
    }

    // Elimina el presupuesto
    await Budget.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Presupuesto eliminado y stock desbloqueado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al intentar eliminar el presupuesto",
    });
  }
});

const updateBudget = asyncHandler(async (req, res) => {
  const {} = req.body;
  const { id } = req.params;

  const budget = await Budget.findById(id);

  if (!budget) {
    res.status(404);
    throw new Error("El presupuesto no fue encontrado");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");

  const updatedBudget = await Budget.findByIdAndUpdate(
    { _id: id },
    {
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedBudget);
});

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  deleteBudget,
  updateBudget,
};
