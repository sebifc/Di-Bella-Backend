const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ProspectStatus = Object.freeze({
  BORRADOR: "Borrador",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
  APROBADO: "Aprobado",
  APROBADO_MODIFICACIONES: "Aprobado con Modificaciones",
});

const budgetModel = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    user_name: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // Referencia al modelo de Cliente
      required: true,
    },
    budgetDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        sku: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item", // Referencia al modelo SKU
          required: true,
        },
        itemPurchasePrice: {
          type: Number, // Precio de compra (desde el modelo Order)
          required: true,
        },
        batch: {
          type: String, // Lote (desde el modelo Order)
          required: true,
        },
        expiration: {
          type: Date, // Fecha de vencimiento (desde el modelo Order)
          required: true,
        },
        quantity: {
          type: Number, // Cantidad de SKU
          required: true,
        },
        saleValue: {
          type: Number, // Valor de la venta por item y cantidad
          required: true,
        },
      },
    ],
    prospectStatus: {
      type: String,
      enum: Object.values(ProspectStatus),
      default: ProspectStatus.PENDIENTE,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Efectivo", "Transferencia", "Diferido"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

Object.freeze(ProspectStatus);

budgetModel.plugin(AutoIncrement, { inc_field: "budgetId" });

const Budget = mongoose.model("Budget", budgetModel);
module.exports = Budget;
