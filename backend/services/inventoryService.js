const mongoose = require("mongoose");
const Stock = require("../models/stockModel");
const Budget = require("../models/budgetModel");

async function checkTotalAvailableStock(
  sku,
  requiredQuantity,
  returnAvailable = false
) {
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
  const isAvailable = availableStock >= requiredQuantity;

  if (returnAvailable) return { isAvailable, availableStock };

  return isAvailable;
}

async function reserveStockForBudget(budgetId, budgetItems) {
  try {
    if (!budgetId || !budgetItems || !Array.isArray(budgetItems)) {
      throw new Error("El ID del presupuesto y los items son requeridos.");
    }

    const modifiedStocks = [];

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

        // Guardar la información de la reserva
        modifiedStocks.push({
          stockId: stock._id,
          reservedQuantity: quantityToBlock,
        });

        if (remainingQuantity <= 0) break;
      }

      if (remainingQuantity > 0)
        throw new Error(`Stock insuficiente para el SKU ${sku}`);
    }

    // Asociar las reservas al presupuesto
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      throw new Error("Presupuesto no encontrado.");
    }

    budget.stockReservations = budget.stockReservations || [];
    budget.stockReservations.push(...modifiedStocks);
    await budget.save();

    return {
      success: true,
      message: "Stock reservado exitosamente para el presupuesto",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getDraftBudgetsBySku(skuId) {
  try {
    const budgetIds = await Budget.distinct("budgetId", {
      prospectStatus: 0, // Solo presupuestos en estado "Borrador"
      "items.sku": skuId, // Busca el SKU en los items del presupuesto
    });

    return budgetIds;
  } catch (error) {
    console.error("Error fetching draft budget IDs:", error);
    throw error;
  }
}

module.exports = {
  checkTotalAvailableStock,
  reserveStockForBudget,
  getDraftBudgetsBySku,
};
