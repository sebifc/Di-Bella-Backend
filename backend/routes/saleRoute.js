const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  getSale,
  getSales,
  updateSale,
} = require("../controllers/saleController");

router.get("/", getSales);
router.get("/:id", protect, getSale);
router.put("/:id", protect, updateSale);

module.exports = router;
