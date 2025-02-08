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
        try {
            const response = await fetch(`/get-place-coordinates?placeId=${placeId}`);
            const data = await response.json(); 
            return data;
        } catch (error) {
            console.error("Ошибка при получении координат:", error);
        }
    }
     
  
    // Функция для получения отелей по ID места
    async function getHotels() { 
        const idsOfPlaces = await getSelectedPlaceIds(); 
        
        // Получаем массив координат для всех мест (дожидаемся выполнения всех запросов)
        const coordsArray = await Promise.all(idsOfPlaces.map(async (id) => {
            return getPlaceCoordinates(id);
        })); 
        
        // Вычисляем центр (усредняем координаты)
        let centerLat = 0;
        let centerLng = 0;
        let count = 0;
    
        coordsArray.forEach(coords => {
            if (coords) { // Проверяем, что coords не null
                centerLat += coords.lat;
                centerLng += coords.lng;
                count++;
            }
        });
    
        if (count > 0) {
            centerLat /= count;
            centerLng /= count;
        }
    
        if (!centerLat || !centerLng) {
            console.error("Invalid coordinates for hotels search.");
            return;
        }
    
        try {
            // Отправляем запрос к серверу
            const response = await fetch("/get-hotels-by-coordinates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ latitude: centerLat, longitude: centerLng })
            });
    
            const hotels = await response.json();
    
            if (response.ok) {
                console.log("Hotels found:", hotels);
                displayHotels(hotels); // Функция для отображения списка отелей
            } else {
                console.error("Error fetching hotels:", hotels.error || hotels.message);
            }
        } catch (error) {
            console.error("Request failed:", error);
        }
    }
    async function displayHotels(hotels) {
        const hotelsList = document.getElementById("hotels-list");
        hotelsList.innerHTML = "<li>Loading hotels...</li>";
    
        try {
            hotelsList.innerHTML = "";
            if (hotels.length === 0) {
                hotelsList.innerHTML = "<li>No available hotels</li>";
                return;
            }
    
            hotels.forEach((hotel) => {
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
                li.style.cursor = "pointer"; // Указатель на элемент, чтобы показать интерактивность
    
                // Добавление фото
                if (hotel.photo) {
                    const img = document.createElement("img");
                    img.src = hotel.photo;
                    img.alt = hotel.name;
                    img.style.width = "100%";
                    img.style.height = "150px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "10px";
                    li.appendChild(img);
                }
    
                // Добавление названия
                const text = document.createElement("p");
                text.textContent = hotel.name;
                text.style.fontWeight = "bold";
                text.style.margin = "10px 0 5px";
                li.appendChild(text);
    
                // Добавление рейтинга (если есть)
                if (hotel.rating) {
                    const rating = document.createElement("p");
                    rating.textContent = `⭐ ${hotel.rating}`;
                    rating.style.color = "#FFD700";
                    li.appendChild(rating);
                }
    
                hotelsList.appendChild(li);
            });
        } catch (error) {
            console.error("Error displaying hotels:", error);
            hotelsList.innerHTML = "<li>Error displaying hotels</li>";
        }
    }




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
    // } 
    window.getSelectedPlaceIds = getSelectedPlaceIds
    window.getPlaces = getPlaces;   
    window.getHotels = getHotels;
});
