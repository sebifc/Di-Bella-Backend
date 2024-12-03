const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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

const saleModel = mongoose.Schema(
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
    saleDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: Number,
      enum: Object.values(PaymentMethods),
      required: true,
    },
    invoiceNumber: {
      type: String,
    },
    deliveryTime: {
      type: String,
    },
    deliveryPlace: {
      type: String,
    },
    receivingDelivery: {
      type: String,
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
        batch: {
          type: String,
          required: true,
        },
      },
    ],
    seller: {
      type: Number,
      enum: Object.values(Sellers),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

saleModel.plugin(AutoIncrement, { inc_field: "saleId" });

const Sale = mongoose.model("Sale", saleModel);
module.exports = Sale;
