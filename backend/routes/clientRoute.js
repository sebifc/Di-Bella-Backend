const express = require("express");
const router = express.Router();
const {
  createClient,
  getClient,
  getClients,
  deleteClient,
  updateClient,
} = require("../controllers/clientController");
const { upload } = require("../utils/fileUpload");

router.post("/", upload.single("image"), createClient);
router.patch("/:id", upload.single("image"), updateClient);
router.get("/", getClients);
router.get("/:id", getClient);
router.delete("/:id", deleteClient);

module.exports = router;
