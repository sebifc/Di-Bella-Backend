const mongoose = require("mongoose");
const Stock = require("../models/stockModel");

async function checkTotalAvailableStock(sku, requiredQuantity) {
  const totalAvailable = await Stock.aggregate([
    { $match: { sku: mongoose.Types.ObjectId(sku) } },
    {
      $group: {
        _id: null,
        totalAvailable: { $sum: { $subtract: ["$quantity", "$blocked"] } },
      },
    },
  ]);

  const availableStock = totalAvailable[0]?.totalAvailable || 0;
  return availableStock >= requiredQuantity;
}

async function reserveStockForBudget(budgetItems) {
  try {
    for (const budgetItem of budgetItems) {
      const { sku, quantity } = budgetItem;
      const hasEnoughStock = await checkTotalAvailableStock(sku, quantity);

      if (!hasEnoughStock)
        throw new Error(`Stock insuficiente para el SKU ${sku}`);

      let remainingQuantity = quantity;

      const stockIds = await Stock.aggregate([
        { $match: { sku: mongoose.Types.ObjectId(sku) } },
        {
          $lookup: {
            from: "orders",
            localField: "order",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        { $unwind: "$orderDetails" },
        { $unwind: "$orderDetails.sku" },
        {
          $match: {
            "orderDetails.sku.item": mongoose.Types.ObjectId(sku),
          },
        },
        { $sort: { "orderDetails.sku.expiration": 1 } },
        { $project: { _id: 1 } }, // Solo selecciona el campo _id para optimizar
      ]);

      // Encuentra los documentos completos de `Stock`
      let stockEntries = await Stock.find({
        _id: { $in: stockIds.map((doc) => doc._id) },
      });

      // Ordena `stockEntries` según el orden de los IDs en `stockIds`
      stockEntries = stockIds.map((idObj) =>
        stockEntries.find((stock) => stock._id.equals(idObj._id))
      );

      for (const stock of stockEntries) {
        const availableStock = stock.quantity - stock.blocked;
        if (availableStock <= 0) continue;

        const quantityToBlock = Math.min(availableStock, remainingQuantity);
        stock.blocked += quantityToBlock;
        remainingQuantity -= quantityToBlock;

        await stock.save();
        if (remainingQuantity <= 0) break;
      }

      if (remainingQuantity > 0)
        throw new Error(`Stock insuficiente para el SKU ${sku}`);
    }

    return {
      success: true,
      message: "Stock reservado exitosamente para el presupuesto",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { checkTotalAvailableStock, reserveStockForBudget };
