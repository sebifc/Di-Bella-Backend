const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
  saveSalePrice,
  getItemsValued,
} = require("../controllers/itemController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createItem);
router.patch("/:id", upload.single("image"), updateItem);
router.get("/", getItems);
router.get("/:id", protect, getItem);
router.delete("/:id", protect, deleteItem);
router.post("/save-sale-price", protect, saveSalePrice);
router.get("/valued/price", getItemsValued);

module.exports = router;
