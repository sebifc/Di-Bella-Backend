const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ProspectStatus = Object.freeze({
  Borrador: 0,
  Rechazado: 1,
  Aprobado: 2,
  "Aprobado con Modificaciones": 3,
});

const PaymentMethods = Object.freeze({
  "Efectivo contra entrega": 0,
  "Transferencia contraentrega": 1,
  "Transferencia a 30 dias": 2,
  "Cheque a 30 dias": 3,
  "Cheque a 60 dias": 4,
});

const Sellers = Object.freeze({
  "DIANA COCH": 0,
  "FERNANDO PAZZANO": 1,
  "LUCILA DI BELLA": 2,
  "VENDEDOR EXTERNO": 3,
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
        itemSalePrice: {
          type: Number, // Precio de venta
          required: true,
        },
        quantity: {
          type: Number, // Cantidad de SKU
          required: true,
        },
        expiration: {
          type: Date,
          required: true,
        },
        brand: {
          type: String,
          required: true,
        },
      },
    ],
    prospectStatus: {
      type: Number,
      enum: Object.values(ProspectStatus),
      default: ProspectStatus["Borrador"],
      required: true,
    },
    paymentMethod: {
      type: Number,
      enum: Object.values(PaymentMethods),
      required: true,
    },
    seller: {
      type: Number,
      enum: Object.values(Sellers),
      required: true,
    },
    stockReservations: [
      {
        stockId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
          required: true,
        },
        reservedQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

budgetModel.plugin(AutoIncrement, { inc_field: "budgetId" });

const Budget = mongoose.model("Budget", budgetModel);
module.exports = Budget;
