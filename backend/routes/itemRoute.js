const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
} = require("../controllers/itemController");
const { upload } = require("../utils/fileUpload");

router.post("/", upload.single("image"), createItem);
router.patch("/:id", upload.single("image"), updateItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.delete("/:id", deleteItem);

module.exports = router;
