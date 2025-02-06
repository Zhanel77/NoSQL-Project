document.addEventListener("DOMContentLoaded", function () {
    const citySelect = document.getElementById("city-select");
    const placesList = document.getElementById("places-list");
    const hotelsList = document.getElementById("hotels-list");

    // Функция для получения мест через сервер
    async function getPlaces() {
        const city = document.getElementById("city-select").value;
        const placesList = document.getElementById("places-list");
        placesList.innerHTML = "<li>Loading places...</li>";
    
        try {
            const response = await fetch(`/get-attractions?city=${city}`);
            const data = await response.json();
    
            placesList.innerHTML = "";
            if (data.length === 0) {
                placesList.innerHTML = "<li>No available places</li>";
                return;
            }
    
            data.forEach((place) => {
                const li = document.createElement("li");
                li.style.display = "flex";
                li.style.flexDirection = "column";
                li.style.alignItems = "center";
                li.style.margin = "10px";
                li.style.padding = "10px";
                li.style.borderRadius = "10px";
                li.style.backgroundColor = "#f9f9f9";
                li.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
                li.style.textAlign = "center";
                li.style.width = "200px";
    
                // Добавление фото
                if (place.photo) {
                    const img = document.createElement("img");
                    img.src = place.photo;
                    img.alt = place.name;
                    img.style.width = "100%";
                    img.style.height = "150px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "10px";
                    li.appendChild(img);
                }
    
                // Добавление названия
                const text = document.createElement("p");
                text.textContent = place.name;
                text.style.fontWeight = "bold";
                text.style.margin = "10px 0 5px";
                li.appendChild(text);
    
                // Добавление рейтинга (если есть)
                if (place.rating) {
                    const rating = document.createElement("p");
                    rating.textContent = `⭐ ${place.rating}`;
                    rating.style.color = "#FFD700";
                    li.appendChild(rating);
                }
    
                placesList.appendChild(li);
            });
        } catch (error) {
            console.error("Error loading places:", error);
            placesList.innerHTML = "<li>Error loading places</li>";
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
