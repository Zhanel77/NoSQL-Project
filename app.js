const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const fetch = require("node-fetch");
const User = require("./models/User");
require("./db");

const app = express();
const PORT = 3000;

// Google Places API
const GOOGLE_API_KEY = "AIzaSyAh7qyCXY6ylXSSOdQFV7Xd-lBOGfSjm74"; 

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

// EJS & Static
app.set("view engine", "ejs");
app.use(express.static("public"));

// Городские координаты
const CITY_COORDS = {
    almaty: { lat: 43.238949, lng: 76.889709 },
    astana: { lat: 51.169392, lng: 71.449074 }
};

// Хранилище "Корзины" для каждого пользователя
const userCarts = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/travel_app" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 день
}));

// EJS & Static
app.set("view engine", "ejs");
app.use(express.static("public"));

app.post("/save-places", async (req, res) => {
    const { userId } = req.session;
    const { places } = req.body; // places - это массив объектов с местами

    if (!userId || !places || places.length === 0) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Добавляем отладку
        console.log("Selected places to save:", places);

        // Добавление мест в поле selectedPlaces пользователя
        user.selectedPlaces = places;
        await user.save();

        res.json({ success: true, message: "Places saved successfully" });
    } catch (error) {
        console.error("Error saving places:", error);
        res.status(500).json({ error: "Server error" });
    }
});




// 📌 Страница логина
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

// 📌 Страница регистрации
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/views/register.html");
});

// 📌 Обработка логина
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.password !== password) {
            return res.json({ success: false, message: "Incorrect password" });
        }

        req.session.userId = user._id; // Сохраняем ID пользователя в сессии
        res.json({ success: true, redirect: "/" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 📌 Обработка регистрации
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: "Username already taken" });
        }

        const newUser = new User({ username, password }); // Пароль сохраняется как есть
        await newUser.save();

        req.session.userId = newUser._id; // Сохраняем ID пользователя в сессии
        res.json({ success: true, redirect: "/" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 📌 Выход из аккаунта
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// 📌 Главная страница
app.get("/", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) {
        req.session.destroy();
        return res.redirect("/login");
    }

    res.render("index", { user });
});

// 📌 API: Получение достопримечательностей с фото
app.get("/get-attractions", async (req, res) => {
    const city = req.query.city;
    if (!CITY_COORDS[city]) {
        return res.status(400).json({ error: "Invalid city" });
    }

    const { lat, lng } = CITY_COORDS[city];

    const url = `https://places.googleapis.com/v1/places:searchNearby?key=${GOOGLE_API_KEY}`;
    const body = {
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: 5000
            }
        },
        includedTypes: ["tourist_attraction"],
        maxResultCount: 10
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.location,places.id,places.photos,places.rating"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!data.places || data.places.length === 0) {
            return res.json([]);
        }

        // Формируем удобный JSON с фото
        const places = data.places.map(place => ({
            id: place.id,
            name: place.displayName.text,
            rating: place.rating || "No rating",
            photo: place.photos ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${GOOGLE_API_KEY}&maxWidthPx=400` : null
        }));

        res.json(places);
    } catch (error) {
        console.error("Ошибка получения достопримечательностей:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 API: Добавление места в "Корзину"
app.post("/add-to-cart", (req, res) => {
    const { userId } = req.session;
    const { place } = req.body;

    if (!userId || !place) return res.status(400).json({ error: "Invalid request" });

    if (!userCarts[userId]) userCarts[userId] = [];
    userCarts[userId].push(place);

    res.json({ success: true, cart: userCarts[userId] });
});

// 📌 API: Получение корзины пользователя
app.get("/get-cart", (req, res) => {
    const { userId } = req.session;
    res.json({ cart: userCarts[userId] || [] });
});

// 📌 API: Получение ближайших отелей
app.get("/get-hotels", async (req, res) => {
    const { userId } = req.session;
    if (!userId || !userCarts[userId] || userCarts[userId].length === 0) {
        return res.status(400).json({ error: "No places selected" });
    }

    const places = userCarts[userId];
    const { lat, lng } = places[0].location; // Берём координаты 1-го места

    const url = `https://places.googleapis.com/v1/places:searchNearby?key=${GOOGLE_API_KEY}`;
    const body = {
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: 5000
            }
        },
        includedTypes: ["lodging"],
        maxResultCount: 10
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.location,places.id,places.photos,places.rating"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!data.places || data.places.length === 0) {
            return res.json([]);
        }

        // Формируем JSON для отелей
        const hotels = data.places.map(hotel => ({
            name: hotel.displayName.text,
            rating: hotel.rating || "No rating",
            photo: hotel.photos ? `https://places.googleapis.com/v1/${hotel.photos[0].name}/media?key=${GOOGLE_API_KEY}&maxWidthPx=400` : null
        }));

        res.json(hotels);
    } catch (error) {
        console.error("Ошибка получения отелей:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
