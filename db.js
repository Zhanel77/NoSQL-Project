const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Ошибка подключения к MongoDB:", err));

module.exports = mongoose;