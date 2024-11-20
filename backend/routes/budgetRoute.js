const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  createBudget,
  getBudget,
  getBudgets,
  deleteBudget,
  updateBudget,
} = require("../controllers/budgetController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createBudget);
router.patch("/:id", upload.single("image"), updateBudget);
router.get("/", getBudgets);
router.get("/:id", protect, getBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;
