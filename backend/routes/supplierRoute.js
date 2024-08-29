const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  deleteSupplier,
  updateSupplier,
} = require("../controllers/supplierController");
const { upload } = require("../utils/fileUpload");

router.post("/", upload.single("image"), createSupplier);
router.patch("/:id", upload.single("image"), updateSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
