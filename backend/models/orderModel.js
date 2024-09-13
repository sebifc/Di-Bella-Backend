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
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add item."],
        ref: "Item",
      },
    ],
    minimumUnit: {
      type: String,
      required: [true, "Please add minimum unit."],
      trim: true,
    },
    brand: {
      type: String,
      // required: [true, "Please add brand."],
      trim: true,
    },
    ean13: {
      type: Number,
      // required: [true, "Please add ean13."],
      trim: true,
    },
    batch: {
      type: String,
      // required: [true, "Please add batch."],
      trim: true,
    },
    expiration: {
      type: mongoose.Schema.Types.Date,
      // required: [true, "Please add expiration."],
      trim: true,
    },
    supplier: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // required: [true, "Please add supplier."],
        ref: "Supplier",
      },
    ],
    refer: {
      type: String,
      // required: [true, "Please add refer."],
      trim: true,
    },
    invoiceNumber: {
      type: Number,
      // required: [true, "Please add invoice number."],
      trim: true,
    },
    itemPurchasePrice: {
      type: Number,
      // required: [true, "Please add item purchase price."],
      trim: true,
    },
    transport: {
      type: Number,
      // required: [true, "Please add transport."],
      trim: true,
    },
    hygienic: {
      type: String,
      // required: [true, "Please add refer."],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", (next) => {
  /* if (this.date) {
    this.date = convertToDate(this.date);
  } */
  if (this.expiration) {
    this.expiration = convertToDate(this.expiration);
  }
  next();
});

const convertToDate = (dateString) => {
  return moment(dateString, "DD/MM/YYYY").toDate();
};

orderSchema.plugin(AutoIncrement, { inc_field: "orderId" });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
