const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  createClient,
  getClient,
  getClients,
  deleteClient,
  updateClient,
} = require("../controllers/clientController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createClient);
router.patch("/:id", upload.single("image"), updateClient);
router.get("/", getClients);
router.get("/:id", protect, getClient);
router.delete("/:id", protect, deleteClient);

module.exports = router;
