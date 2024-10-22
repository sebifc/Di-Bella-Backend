const mongoose = require("mongoose");
const moment = require("moment");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderSchema = mongoose.Schema(
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
    sku: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Please add item."],
          ref: "Item",
        },
        minimumUnit: {
          type: Number,
          required: [true, "Please add minimum unit."],
          trim: true,
        },
        brand: {
          type: String,
          trim: true,
        },
        ean13: {
          type: Number,
          trim: true,
        },
        batch: {
          type: String,
          trim: true,
        },
        expiration: {
          type: mongoose.Schema.Types.Date,
          trim: true,
        },
        itemPurchasePrice: {
          type: Number,
          trim: true,
        },
      },
    ],
    supplier: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
    refer: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: Number,
      trim: true,
    },
    transport: {
      type: Number,
      trim: true,
    },
    hygienic: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook para convertir la fecha de expiración
orderSchema.pre("save", function (next) {
  this.sku.forEach((item) => {
    if (item.expiration) {
      item.expiration = convertToDate(item.expiration);
    }
  });
  next();
});

// Función para convertir la fecha al formato adecuado
const convertToDate = (dateString) => {
  return moment(dateString, "DD/MM/YYYY").toDate();
};

orderSchema.plugin(AutoIncrement, { inc_field: "orderId" });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
