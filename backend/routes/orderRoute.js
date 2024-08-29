const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrder,
  getOrders,
  deleteOrder,
  updateOrder,
} = require("../controllers/orderController");
const { upload } = require("../utils/fileUpload");

router.post("/", upload.single("image"), createOrder);
router.patch("/:id", upload.single("image"), updateOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
