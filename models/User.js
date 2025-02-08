const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    selectedPlaces: { type: [Object], default: [] },
    savedHotel: { type: Object, default: null }
});

module.exports = mongoose.model("User", UserSchema);
