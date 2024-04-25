const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
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
      required: [true, "Please add client name"],
      trim: true,
    },
    businessName: {
      type: String,
      required: [true, "Please add business name."],
      trim: true,
    },
    cuit: {
      type: Number,
      required: [true, "Please add a CUIT"],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, "Please add contact person"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please add a address"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      trim: true,
    },
    phone: {
      type: Number,
      required: [true, "Please add a phone"],
      trim: true,
    },
    type: {
      type: Number,
      required: [true, "Please add type."],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
