const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Модель пользователя
require("./db"); // Подключение к базе через Mongoose

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/travel_app" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 день
}));

// Устанавливаем EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Главная страница (если юзер не залогинен — редирект)
app.get("/", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId); // Получаем пользователя из базы
    if (!user) {
        req.session.destroy();
        return res.redirect("/login");
    }

    res.render("index", { user });
});

// Регистрация
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.send("Такой пользователь уже существует!");
        
        const user = new User({ username, password });
        await user.save();
        
        req.session.userId = user._id; // Сохраняем только userId в сессии
        res.redirect("/");
    } catch (err) {
        res.send("Ошибка при регистрации");
    }
});

// Логин
app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.send("Неправильный логин или пароль!");
    }

    req.session.userId = user._id; // Сохраняем userId в сессии
    res.redirect("/");
});

// Выход
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
