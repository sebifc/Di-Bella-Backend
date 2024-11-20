const express = require("express");
const {
  checkStockAvailability,
  reserveStock,
  getInfoAndPrice,
} = require("../controllers/stockController");
const router = express.Router();

router.get("/check/:skuId", checkStockAvailability);
router.post("/reserve", reserveStock);
router.get("/item-info/:itemId", getInfoAndPrice);

module.exports = router;
