const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const PaymentMethods = Object.freeze({
  "Efectivo contra entrega": 0,
  "Transferencia contraentrega": 1,
  "Transferencia a 30 dias": 2,
  "Cheque a 30 dias": 3,
  "Cheque a 60 dias": 4,
});

const remitoModel = mongoose.Schema(
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
    paymentMethod: {
      type: Number,
      enum: Object.values(PaymentMethods),
      required: true,
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale", // Referencia a la venta original
      required: true,
    },
    remitoDate: {
      type: Date,
      required: true,
    },
    timeRange: {
      type: String, // Campo adicional para el rango horario
      required: true,
    },
    items: [
      {
        sku: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item", // Referencia al modelo SKU
          required: true,
        },
        quantity: {
          type: Number, // Cantidad de SKU en el remito
          required: true,
        },
        brand: {
          type: String,
          required: true,
        },
        batch: {
          type: String,
          required: true,
        },
        expiration: {
          type: Date,
          required: true,
        },
      },
    ],
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

remitoModel.plugin(AutoIncrement, { inc_field: "remitoId" });

const Remito = mongoose.model("Remito", remitoModel);
module.exports = Remito;
