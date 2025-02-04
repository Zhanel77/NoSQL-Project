document.addEventListener("DOMContentLoaded", function () {
    const citySelect = document.getElementById("city-select");
    const placesList = document.getElementById("places-list");
    const hotelsList = document.getElementById("hotels-list");

    // Функция для получения мест через сервер
    async function getPlaces() {
        const city = citySelect.value;
        placesList.innerHTML = "<li>Загрузка мест...</li>";
        hotelsList.innerHTML = "";

        try {
            const response = await fetch(`/get-attractions?city=${city}`);
            const data = await response.json();

            placesList.innerHTML = "";
            if (data.length === 0) {
                placesList.innerHTML = "<li>Нет доступных мест</li>";
                return;
            }

            data.forEach((place) => {
                const li = document.createElement("li");
                li.textContent = place.name;
                li.onclick = () => getHotels(place.id);
                placesList.appendChild(li);
            });
        } catch (error) {
            console.error("Ошибка при загрузке мест:", error);
            placesList.innerHTML = "<li>Ошибка загрузки мест</li>";
        }
    }

    // Функция для получения отелей по ID места
    async function getHotels(placeId) {
        hotelsList.innerHTML = "<li>Загрузка отелей...</li>";

        try {
            const response = await fetch(`/get-hotels?placeId=${placeId}`);
            const data = await response.json();

            hotelsList.innerHTML = "";
            if (data.length === 0) {
                hotelsList.innerHTML = "<li>Нет доступных отелей</li>";
                return;
            }

            data.forEach((hotel) => {
                const li = document.createElement("li");
                li.textContent = hotel.name;
                hotelsList.appendChild(li);
            });
        } catch (error) {
            console.error("Ошибка при загрузке отелей:", error);
            hotelsList.innerHTML = "<li>Ошибка загрузки отелей</li>";
        }
    }

    window.getPlaces = getPlaces;
});
