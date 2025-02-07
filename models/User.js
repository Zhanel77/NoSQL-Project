const mongoose = require("mongoose");

// Модель User.js уже имеет поле centerCoords для хранения координат
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    selectedPlaces: { type: [Object], default: [] },
    centerCoords: { 
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        default: { lat: 0, lng: 0 }  // Начальные значения
    }
});

  

module.exports = mongoose.model("User", UserSchema);
