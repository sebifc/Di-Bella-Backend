const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  deleteSupplier,
  updateSupplier,
} = require("../controllers/supplierController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createSupplier);
router.patch("/:id", upload.single("image"), updateSupplier);
router.get("/", getSuppliers);
router.get("/:id", protect, getSupplier);
router.delete("/:id", protect, deleteSupplier);

module.exports = router;
