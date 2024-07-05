const mongoose = require("mongoose");

const supplierSchema = mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "Please add supplier name"],
      trim: true,
    },
    phone: {
      type: Number,
      /* required: [true, "Please add a phone"], */
      trim: true,
    },
    cuit: {
      type: Number,
      /* required: [true, "Please add a CUIT"], */
      trim: true,
    },
    contact: {
      type: String,
      /* required: [true, "Please add contact person"], */
      trim: true,
    },
    address: {
      type: String,
      /* required: [true, "Please add a address"], */
      trim: true,
    },
    email: {
      type: String,
      /* required: [true, "Please add a email"], */
      trim: true,
    },
    paymentMethod: {
      type: String,
      /* required: [true, "Please add payment method"], */
      trim: true,
    },
    qualified: {
      type: Boolean,
      /* required: [true, "Please select if qualified."], */
      trim: true,
    },
    type: {
      type: Number,
      /* required: [true, "Please add type."], */
      trim: true,
    },
    code: {
      type: String,
      /* required: [true, "Please add code."], */
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
