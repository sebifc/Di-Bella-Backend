const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const itemSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    user_name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true,
      default: "SKU",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    presentation: {
      type: String,
      required: [true, "Please add a presentation"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.plugin(AutoIncrement, { inc_field: 'itemId' });

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
