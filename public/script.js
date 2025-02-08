const axios = require('axios');

document.addEventListener("DOMContentLoaded", function () {
    const citySelect = document.getElementById("city-select");
    const placesList = document.getElementById("places-list");
    const saveButton = document.getElementById("save-places-btn");
    let selectedPlaces = [];

    // Добавление места в выбранные
    document.getElementById("places-list").addEventListener("click", function (e) {
        // Проверяем, был ли клик на элемент списка или его содержимое
        const placeElement = e.target.closest("li"); // Для захвата клика на текст или картинку
        if (placeElement && placeElement.tagName === "LI") {
            const place = {
                id: placeElement.dataset.placeId,
                lat: parseFloat(placeElement.dataset.lat), // Добавляем координаты
                lng: parseFloat(placeElement.dataset.lng)
            };
            const index = selectedPlaces.findIndex(p => p.id === place.id);
            if (index !== -1) {
                selectedPlaces.splice(index, 1);
                placeElement.style.backgroundColor = "#f9f9f9";
            } else {
                selectedPlaces.push(place);
                placeElement.style.backgroundColor = "#d0eaff";
            }
        }
    });

    // Сохранение выбранных мест
    saveButton.addEventListener("click", async function () {
        if (selectedPlaces.length === 0) {
            alert("Please select at least one place.");
            return;
        }

        try {
            const response = await fetch("/save-places", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ places: selectedPlaces })
            });

            const data = await response.json();
            if (data.success) {
                alert("Places saved successfully!");
            } else {
                alert("Error saving places.");
            }
        } catch (error) {
            console.error("Error saving places:", error);
        }
    });
 

    // Функция для получения мест через сервер
    async function getPlaces() {
        const city = document.getElementById("city-select").value;
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

                li.dataset.placeId = place.id; // place.id — это предполагаемый уникальный идентификатор места
                
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
                li.style.cursor = "pointer"; // Указатель на элемент, чтобы показать интерактивность
                
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
 
   
    async function getSelectedPlaceIds() {
        try { 
            const response = await fetch("/get-selected-places");
            const data = await response.json();  
            return data.selectedPlaces; // Возвращаем массив ID
        } catch (err) {
            console.error("Ошибка запроса:", err);
            return [];
        }
    }
    
    async function getPlaceCoordinates(placeId) {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyAh7qyCXY6ylXSSOdQFV7Xd-lBOGfSjm74`;

        try {
            const response = await axios.get(url); 

            if (response.data.status !== "OK") {
                console.error("API Error:", response.data.status, response.data.error_message);
                return null;
            }

            const location = response.data.result.geometry.location;
            console.log(`Latitude: ${location.lat}, Longitude: ${location.lng}`);
            return location;
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    }
    
    function calculateCenter(coords) {
        if (coords.length === 0) return null;
    
        let sumLat = 0, sumLng = 0;
    
        coords.forEach(coord => {
            sumLat += coord.lat;
            sumLng += coord.lng;
        });
    
        return {
            lat: sumLat / coords.length,
            lng: sumLng / coords.length
        };
    }
    
    // Функция для получения отелей по ID места
    async function getHotels() { 
        const idsOfPlaces = await getSelectedPlaceIds();
        console.log(getPlaceCoordinates(idsOfPlaces[0]))
        let centerLat 
        let centerLng
        idsOfPlaces.forEach((id) => {
            coords = getPlaceCoordinates(id)
            centerLat += coords[0]
            centerLng += coords[1]
        })
        console.log(`Lat: ${centerLat} |||| Lng: ${centerLng}`)



        // try {
        //     const response = await fetch(`/get-hotels?placeId=${placeId}`);
        //     const data = await response.json();

        //     hotelsList.innerHTML = "";
        //     if (data.length === 0) {
        //         hotelsList.innerHTML = "<li>Нет доступных отелей</li>";
        //         return;
        //     }

        //     data.forEach((hotel) => {
        //         const li = document.createElement("li");
        //         li.textContent = hotel.name;
        //         hotelsList.appendChild(li);
        //     });
        // } catch (error) {
        //     console.error("Ошибка при загрузке отелей:", error);
        //     hotelsList.innerHTML = "<li>Ошибка загрузки отелей</li>";
        // }
    } 
    window.getSelectedPlaceIds = getSelectedPlaceIds
    window.getPlaces = getPlaces;   
    window.getHotels = getHotels;
});
