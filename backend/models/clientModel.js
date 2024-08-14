const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
    email2: {
      type: String,
      trim: true,
    },
    email3: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    type: {
      type: Number,
      trim: true,
    },
    originContact: {
      type: Number,
      trim: true,
    },
    paymentCondition: {
      type: Number,
      trim: true,
    },
    observations: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.plugin(AutoIncrement, { inc_field: 'clientId' });

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
