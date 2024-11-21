const Stock = require("../models/stockModel");
const Item = require("../models/itemModel");
const mongoose = require("mongoose");

const {
  reserveStockForBudget,
  checkTotalAvailableStock,
} = require("../services/inventoryService");

async function checkStockAvailability(req, res) {
  const { skuId } = req.params;
  const { requiredQuantity } = req.query; // Cantidad requerida, pasada como parámetro de consulta

  try {
    const isAvailable = await checkTotalAvailableStock(
      skuId,
      Number(requiredQuantity)
    );
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({
      message: "Error al verificar disponibilidad de stock",
      error: error.message,
    });
  }
}

async function reserveStock(req, res) {
  const { budgetId, items } = req.body; // Lista de items a reservar con SKU y cantidad requerida

  try {
    // Verificar disponibilidad para cada item en el presupuesto
    for (const item of items) {
      const isAvailable = await checkTotalAvailableStock(
        item.sku,
        item.quantity
      );
      if (!isAvailable) {
        const item = await Item.findById(req.params.id);
        return res.status(400).json({
          message: `Stock insuficiente para el SKU ${item.sku} - ${item.category} - ${item.presentation}`,
        });
      }
    }

    // Si hay suficiente stock, intentar reservarlo
    const result = await reserveStockForBudget(budgetId, items);
    if (result.success) {
      res.status(200).json({ message: "Stock reservado exitosamente" });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al reservar el stock", error: error.message });
  }
}

async function getInfoAndPrice(req, res) {
  try {
    const { itemId } = req.params;

    // Paso 1: Verificar que el ítem existe
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item no encontrado." });
    }

    // Paso 2: Buscar el stock relacionado con el ítem
    const stockWithOrder = await Stock.aggregate([
      { $match: { sku: mongoose.Types.ObjectId(itemId) } }, // Filtrar por el SKU
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
          "orderDetails.sku.item": mongoose.Types.ObjectId(itemId),
        },
      },
      {
        $addFields: {
          availableStock: { $subtract: ["$quantity", "$blocked"] }, // Calcula el stock disponible
        },
      },
      { $match: { availableStock: { $gt: 0 } } }, // Solo stock disponible
      { $sort: { "orderDetails.sku.expiration": 1 } }, // Ordenar por fecha de expiración
      {
        $project: {
          _id: 0,
          orderId: "$orderDetails._id",
          purchasePrice: "$orderDetails.sku.itemPurchasePrice", // Precio de compra del SKU
          availableStock: 1,
          expiration: "$orderDetails.sku.expiration", // Fecha de expiración
          batch: "$orderDetails.sku.batch",
        },
      },
      { $limit: 1 }, // Solo la entrada más cercana
    ]);

    // Paso 3: Si no hay stock disponible, informar
    if (stockWithOrder.length === 0) {
      return res.status(200).json({
        item,
        available: false,
        message: "No hay stock disponible para este ítem.",
      });
    }

    // Paso 4: Devolver información del ítem y del stock
    const stockInfo = stockWithOrder[0];
    res.status(200).json({
      item,
      available: true,
      stockInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error en el servidor." });
  }
}

module.exports = { checkStockAvailability, reserveStock, getInfoAndPrice };
