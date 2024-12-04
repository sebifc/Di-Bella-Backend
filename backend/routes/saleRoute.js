const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  getSale,
  getSales,
  updateSale,
  createRemito,
  getPendingItems,
} = require("../controllers/saleController");

router.get("/", getSales);
router.get("/:id", protect, getSale);
router.put("/:id", protect, updateSale);
router.post("/create-remito", protect, createRemito);
router.get("/pending-items/:id", protect, getPendingItems);

module.exports = router;
