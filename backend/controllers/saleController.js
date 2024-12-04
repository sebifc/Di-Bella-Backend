const asyncHandler = require("express-async-handler");
const Sale = require("../models/saleModel");
const Remito = require("../models/remitoModel");
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

const createRemito = asyncHandler(async (req, res) => {
  const { saleId, items, timeRange } = req.body;

  // Validar que exista la venta
  const sale = await Sale.findById(saleId);
  if (!sale) {
    res.status(404);
    throw new Error("Venta no encontrada");
  }

  // Calcular los ítems pendientes dinámicamente
  const pendingItems = sale.items
    .map((item) => ({
      ...item.toObject(),
      pendingQuantity: item.quantity - item.deliveredQuantity,
    }))
    .filter((item) => item.pendingQuantity > 0); // Solo incluir los ítems con cantidades pendientes

  // Validar cantidades remitidas
  for (const item of items) {
    // Buscar el SKU correspondiente en los ítems pendientes
    const pendingItem = pendingItems.find((i) => i.sku.toString() === item.sku);
    if (!pendingItem) {
      res.status(400);
      throw new Error(`El SKU ${item.sku} no tiene cantidades pendientes.`);
    }

    // Validar que la cantidad remitida no exceda la cantidad pendiente
    if (item.quantity > pendingItem.pendingQuantity) {
      res.status(400);
      throw new Error(
        `La cantidad remitida del SKU ${item.sku} (${item.quantity}) no puede exceder la cantidad pendiente (${pendingItem.pendingQuantity}).`
      );
    }
  }

  const enrichedItems = items.map((item) => {
    const saleItem = sale.items.find(
      (i) => i.sku.toString() === item.sku.toString()
    );
    return {
      ...item,
      brand: saleItem.brand,
      batch: saleItem.batch,
      expiration: saleItem.expiration,
    };
  });

  // Crear el remito
  const remito = await Remito.create({
    user: req.user.id,
    user_name: req.user.name,
    client: sale.client,
    sale: saleId,
    remitoDate: moment().format("YYYY-MM-DD"),
    timeRange,
    items: enrichedItems,
    paymentMethod: sale.paymentMethod,
  });

  // Actualizar las cantidades remitidas en la venta
  for (const item of items) {
    const saleItem = sale.items.find(
      (i) => i.sku.toString() === item.sku.toString()
    );
    if (saleItem) {
      saleItem.deliveredQuantity += item.quantity;
    }
  }

  // Guardar los cambios en la venta
  await sale.save();

  res.status(201).json(remito);
});

const getPendingItems = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await Sale.findById(id).populate({
      path: "items.sku",
      model: "Item",
    });

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    const pendingItems = sale.items
      .map((item) => ({
        ...item.toObject(),
        pendingQuantity: item.quantity - item.deliveredQuantity,
      }))
      .filter((item) => item.pendingQuantity > 0); // Filtrar solo los ítems pendientes

    res.status(200).json({ pendingItems });
  } catch (error) {
    console.error("Error al obtener ítems pendientes:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = {
  getSales,
  getSale,
  updateSale,
  createRemito,
  getPendingItems,
};
