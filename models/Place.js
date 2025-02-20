const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    placeId: { type: String, required: true, unique: true },
    name: String,
    rating: String,
    photo: String,
    location: {
        latitude: Number,
        longitude: Number
    }
});

PlaceSchema.index({ userId: 1, placeId: 1 }, { unique: true });

module.exports = mongoose.model("Place", PlaceSchema);
