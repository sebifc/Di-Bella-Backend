const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Client = require("../models/clientModel");

const createClient = asyncHandler(async (req, res) => {
  const {
    name,
    businessName,
    cuit,
    contact,
    address,
    email,
    location,
    phone,
    type,
  } = req.body;

  if (
    !name ||
    !phone ||
    !cuit ||
    !contact ||
    !address ||
    !email ||
    !location ||
    !businessName
  ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const client = await Client.create({
    user: req.user.id,
    user_name: req.user.name,
    name,
    businessName,
    cuit,
    contact,
    address,
    email,
    location,
    phone,
    type,
  });

  res.status(201).json(client);
});

const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().sort("-updatedAt");
  res.status(200).json(clients);
});

const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  res.status(200).json(client);
});

const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }
  // Match client to its user
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await client.remove();
  res.status(200).json({ message: "Client deleted." });
});

const updateClient = asyncHandler(async (req, res) => {
  const {
    name,
    businessName,
    cuit,
    contact,
    address,
    email,
    location,
    phone,
    type,
  } = req.body;
  const { id } = req.params;
  console.log(req.body);

  const client = await Client.findById(id);

  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  const updtAt = moment().format("YYYY-MM-DD HH:mm");

  const updatedClient = await Client.findByIdAndUpdate(
    { _id: id },
    {
      name,
      businessName,
      cuit,
      contact,
      address,
      email,
      location,
      phone,
      type,
      updatedAt: updtAt,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedClient);
});

module.exports = {
  createClient,
  getClients,
  getClient,
  deleteClient,
  updateClient,
};
