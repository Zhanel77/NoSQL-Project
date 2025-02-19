const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    rating: String,
    address: String,
    distance: String,
    photo: String
});

HotelSchema.index({ userId: 1 });

module.exports = mongoose.model("Hotel", HotelSchema);
