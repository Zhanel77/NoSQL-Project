const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const User = require("./models/User"); // User model
require("./db"); // Connect to MongoDB

const app = express();
const PORT = 3000;

const RAPID_API_KEY = "470859ab95mshb1fe683dcdea87cp1fdbf0jsn1c856e0c3579"; // Your API key
const API_HOST = "booking-com15.p.rapidapi.com";

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/travel_app" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Set up EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Home page (redirects if not logged in)
app.get("/", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) {
        req.session.destroy();
        return res.redirect("/login");
    }

    res.render("index", { user });
});

// 📌 Registration
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Entered password:", password); // Оригинальный пароль

        const user = new User({ username, password }); // Сохраняем пароль без хэша
        await user.save();
        console.log("User saved:", user);

        req.session.userId = user._id;
        return res.json({ success: true, message: "Registration successful!", redirect: "/" });
    } catch (err) {
        console.error("Error during registration:", err);
        return res.json({ success: false, message: "Error during registration!" });
    }
});



// 📌 Login
app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        console.log("User not found:", username);
        return res.json({ success: false, message: "Incorrect username or password!" });
    }

    console.log("Stored password:", user.password);
    console.log("Entered password:", password);

    if (password !== user.password) {
        return res.json({ success: false, message: "Incorrect username or password!" });
    }

    req.session.userId = user._id;
    req.session.save(() => {
        res.json({ success: true, message: "Login successful!", redirect: "/" });
    });
});


// 📌 Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// 📌 API for getting attractions
app.get("/get-attractions", async (req, res) => {
    const city = req.query.city;
    const cities = {
        almaty: "43.238949,76.889709",
        astana: "51.169392,71.449074"
    };

    const location = cities[city];
    if (!location) {
        return res.status(400).json({ error: "Invalid city" });
    }

    console.log(`Fetching attractions for city: ${city}`);

    try {
        const response = await fetch(`https://${API_HOST}/api/v1/attraction/search?location=${location}&radius=5000`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": RAPID_API_KEY
            }
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (!data || !data.results) {
            return res.status(500).json({ error: "API error or empty response" });
        }

        res.json(data.results);
    } catch (error) {
        console.error("Error fetching attractions:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 API for getting nearby hotels
app.get("/get-hotels", async (req, res) => {
    const placeId = req.query.placeId;
    if (!placeId) {
        return res.status(400).json({ error: "Place ID is missing" });
    }

    try {
        const response = await fetch(`https://${API_HOST}/api/v1/hotels/search?location_id=${placeId}&radius=5000`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": RAPID_API_KEY
            }
        });

        const data = await response.json();
        res.json(data.results || []);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
