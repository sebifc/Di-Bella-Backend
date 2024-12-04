const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const { getRemito, getRemitos } = require("../controllers/remitoController");

router.get("/", getRemitos);
router.get("/:id", protect, getRemito);

module.exports = router;
