const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  createBudget,
  getBudget,
  getBudgets,
  deleteBudget,
  cancelBudget,
  approveBudget,
} = require("../controllers/budgetController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createBudget);
router.get("/", getBudgets);
router.get("/:id", protect, getBudget);
router.delete("/:id", protect, deleteBudget);
router.put("/cancel/:id", protect, cancelBudget);
router.put("/approve/:id", protect, approveBudget);

module.exports = router;
