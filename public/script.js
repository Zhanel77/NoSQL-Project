document.addEventListener("DOMContentLoaded", function () {
    const citySelect = document.getElementById("city-select");
    const placesList = document.getElementById("places-list");
    const hotelsList = document.getElementById("hotels-list");

    window.getPlaces = function () {
        const city = citySelect.value;
        placesList.innerHTML = "<li>Загрузка мест...</li>";
        hotelsList.innerHTML = "";

        // Заглушка, можно заменить API-запросом
        setTimeout(() => {
            const places = city === "almaty" ? ["Медеу", "Кок-Тобе", "Первомайские пруды"] : ["Байтерек", "Хан Шатыр", "Музей первого президента"];
            const hotels = city === "almaty" ? ["Отель Казахстан", "Ritz-Carlton", "Novotel"] : ["Hilton Astana", "Rixos President", "Radisson"];

            placesList.innerHTML = places.map(place => `<li>${place}</li>`).join("");
            hotelsList.innerHTML = hotels.map(hotel => `<li>${hotel}</li>`).join("");
        }, 1000);
    };
});
