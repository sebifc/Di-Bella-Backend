const mongoose = require("mongoose");
const moment = require("moment");

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
    date: {
      type: mongoose.Schema.Types.Date,
      required: [true, "Please add purchase date"],
      trim: true,
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add product."],
        ref: "Product",
      },
    ],
    brand: {
      type: String,
      required: [true, "Please add brand."],
      trim: true,
    },
    supplier: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add supplier."],
        ref: "Supplier",
      },
    ],
    batch: {
      type: String,
      required: [true, "Please add batch."],
      trim: true,
    },
    expiration: {
      type: mongoose.Schema.Types.Date,
      required: [true, "Please add expiration."],
      trim: true,
    },
    invoiceNumber: {
      type: Number,
      required: [true, "Please add invoice number."],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", (next) => {
  if (this.date) {
    this.date = convertToDate(this.date);
  }
  if (this.expiration) {
    this.expiration = convertToDate(this.expiration);
  }
  next();
});

const convertToDate = (dateString) => {
  return moment(dateString, "DD/MM/YYYY").toDate();
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
