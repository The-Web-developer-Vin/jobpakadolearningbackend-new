const mongoose = require("mongoose");

let _db;

module.exports = {
  connectToServer() {
    return new Promise((resolve, reject) => {
      mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const db = mongoose.connection;
      db.on("error", () => {
        console.error.bind(console, "connection error:");
        reject("connection fail");
      });
      db.once("open", () => {
        // we're connected!
        resolve(db);
      });
    });
  },
  getDb() {
    return _db;
  },
};
