const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    selectedPlaces: { type: [Object], default: [] },
    centerCoords: { type: Object, default: null }  // Новое поле для серединной координаты
});

module.exports = mongoose.model("User", UserSchema);
