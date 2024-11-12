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
    res
      .status(500)
      .json({
        message: "Error al verificar disponibilidad de stock",
        error: error.message,
      });
  }
}

async function reserveStock(req, res) {
  const { items } = req.body; // Lista de items a reservar con SKU y cantidad requerida

  try {
    // Verificar disponibilidad para cada item en el presupuesto
    for (const item of items) {
      const isAvailable = await checkTotalAvailableStock(
        item.sku,
        item.quantity
      );
      if (!isAvailable) {
        return res
          .status(400)
          .json({ message: `Stock insuficiente para el SKU ${item.sku}` });
      }
    }

    // Si hay suficiente stock, intentar reservarlo
    const result = await reserveStockForBudget(items);
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

module.exports = { checkStockAvailability, reserveStock };
