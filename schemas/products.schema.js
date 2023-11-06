const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "FOR_SALE",
  },
});
productSchema.set("timestamps", { createdAt: true, updatedAt: false });
module.exports = mongoose.model("Product", productSchema);
