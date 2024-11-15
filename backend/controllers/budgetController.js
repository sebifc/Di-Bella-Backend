const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Budget = require("../models/budgetModel");

const createBudget = asyncHandler(async (req, res) => {
  const { client, paymentMethod, items } = req.body;

  if (!client) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const budget = await Budget.create({
    user: req.user.id,
    user_name: req.user.name,
    client,
    paymentMethod,
    items,
    budgetDate: moment().format("YYYY-MM-DD"),
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
  const budget = await Budget.findById(req.params.id);
  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  res.status(200).json(budget);
});

const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }
  // Match budget to its user
  if (budget.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await budget.remove();
  res.status(200).json({ message: "Budget deleted." });
});

const updateBudget = asyncHandler(async (req, res) => {
  const {} = req.body;
  const { id } = req.params;

  const budget = await Budget.findById(id);

  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
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
