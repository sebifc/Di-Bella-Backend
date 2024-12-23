const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
      trim: true,
    },
    cuit: {
      type: Number,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    qualified: {
      type: Boolean,
      trim: true,
    },
    type: {
      type: Number,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cbu: { 
      type: Number,
      trim: true,
    },
    alias: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.plugin(AutoIncrement, { inc_field: "supplierId" });

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
