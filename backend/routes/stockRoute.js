const express = require("express");
const {
  checkStockAvailability,
  reserveStock,
} = require("../controllers/stockController");
const router = express.Router();

router.get("/check/:skuId", checkStockAvailability);
router.post("/reserve", reserveStock);

module.exports = router;
