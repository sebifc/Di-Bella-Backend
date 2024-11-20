const mongoose = require("mongoose");
const OrderOld = require("./models/orderModelOld"); // Asegúrate de que la ruta al modelo es correcta
const fs = require('fs');

// Conexión a la base de datos MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/stock", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

// Script de migración
const migrateDataToJson = async () => {
  try {
    const ordersOld = await OrderOld.find({}); // Obtener todas las órdenes
    const ordersNew = [];

    for (const orderOld of ordersOld) {
      // Crear la nueva estructura para cada orden
      const orderNew = {
        _id: orderOld._id, // Mantén el mismo ID si lo necesitas
        user: orderOld.user,
        user_name: orderOld.user_name,
        sku: orderOld.sku.map((skuItem) => ({
          item: skuItem, // Referencia al SKU original
          minimumUnit: orderOld.minimumUnit,
          brand: orderOld.brand,
          ean13: orderOld.ean13,
          batch: orderOld.batch,
          expiration: orderOld.expiration,
          itemPurchasePrice: orderOld.itemPurchasePrice,
        })),
        createdAt: orderOld.createdAt,
        updatedAt: orderOld.updatedAt,
      };

      // Añadir la orden a la lista de órdenes migradas
      ordersNew.push(orderNew);
    }

    // Escribir el archivo JSON con los nuevos datos
    fs.writeFileSync("migratedOrders.json", JSON.stringify(ordersNew, null, 2));

    console.log("Migración a JSON completada.");
  } catch (error) {
    console.error("Error en la migración a JSON:", error);
  }
};

// Ejecuta la migración
const runMigration = async () => {
  await connectDB();
  await migrateDataToJson();
  mongoose.connection.close();
};

runMigration();
