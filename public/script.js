document.addEventListener("DOMContentLoaded", function () {
    const savedDataSection = document.getElementById("saved-data-section"); 
    const savedPlacesList = document.getElementById("saved-places-list");
    const savedHotelDiv = document.getElementById("saved-hotel");
    const citySelect = document.getElementById("city-select");
    const placesList = document.getElementById("places-list");
    const saveButton = document.getElementById("save-places-btn");
    
    let selectedPlaces = []; 
    async function loadSavedData() {
        try {
            const responsePlaces = await fetch("/get-selected-places");
            const dataPlaces = await responsePlaces.json();
            const places = dataPlaces.selectedPlaces;
    
            if (!places || places.length === 0) {
                console.log("No saved places found.");
            } else {
                const queryParams = new URLSearchParams();
                const placeIds = places.map(p => p.placeId); // Вытаскиваем placeId
    
                placeIds.forEach(id => queryParams.append("placeIds", id));
    
                const responseDetails = await fetch(`/get-place-details?${queryParams.toString()}`);
                const placesData = await responseDetails.json();
    
                savedPlacesList.innerHTML = "";
    
                placesData.places.forEach(place => {
                    if (place.error) return;
    
                    const li = document.createElement("li");
                    li.classList.add("saved-place-card");
                    li.innerHTML = `
                        ${place.photo ? `<img src="${place.photo}" alt="${place.name}" class="saved-place-img">` : ""}
                        <p class="place-name"><strong>${place.name}</strong></p>
                        <p class="place-rating">⭐ ${place.rating}</p>
                    `;
                    savedPlacesList.appendChild(li);
                });
            }
    
            const responseHotel = await fetch("/get-saved-hotel");
            const dataHotel = await responseHotel.json();
    
            savedHotelDiv.innerHTML = "";
    
            if (dataHotel.savedHotel) {
                savedHotelDiv.innerHTML = `
                    <p class="saved-hotel-name"><strong>${dataHotel.savedHotel.name}</strong></p>
                    <p class="saved-hotel-rating">⭐ ${dataHotel.savedHotel.rating || "No rating"}</p>
                    <p class="saved-hotel-address">${dataHotel.savedHotel.address}</p>
                    <p class="saved-hotel-distance">${dataHotel.savedHotel.distance}</p>
                    ${dataHotel.savedHotel.photo ? `<img src="${dataHotel.savedHotel.photo}" class="saved-hotel-img">` : ""}
                `;
            }
    
            if (places.length > 0 || dataHotel.savedHotel) {
                savedDataSection.style.display = "block";
            }
        } catch (error) {
            console.error("Error loading saved data:", error);
        }
    }
    
    
    
    loadSavedData();
    // Добавление места в выбранные
    document.getElementById("places-list").addEventListener("click", function (e) {
        // Проверяем, был ли клик на элемент списка или его содержимое
        const placeElement = e.target.closest("li"); // Для захвата клика на текст или картинку
        if (placeElement && placeElement.tagName === "LI") {
            const place = {
                id: placeElement.dataset.placeId,
                lat: parseFloat(placeElement.dataset.lat),
                lng: parseFloat(placeElement.dataset.lng),
                name: placeElement.dataset.name || "Unknown Place",
                rating: placeElement.dataset.rating || "No rating",
                photo: placeElement.dataset.photo || null
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
        const city = citySelect.value;
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
    
                li.dataset.placeId = place.id;
                li.dataset.lat = place.location.latitude;
                li.dataset.lng = place.location.longitude;
                li.dataset.name = place.name;
                li.dataset.rating = place.rating;
                li.dataset.photo = place.photo || "";
    
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
                li.style.cursor = "pointer";
    
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
    
                const text = document.createElement("p");
                text.textContent = place.name;
                text.style.fontWeight = "bold";
                text.style.margin = "10px 0 5px";
                li.appendChild(text);
    
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
            return data.selectedPlaces.map(p => p.placeId); // Вытаскиваем только placeId
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
            if (coords) {
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
        const saveHotelBtn = document.getElementById("save-hotel-btn");
        let selectedHotel = null; // Переменная для хранения выбранного отеля
    
        hotelsList.innerHTML = "<li>Loading hotels...</li>";
    
        try {
            hotelsList.innerHTML = "";
            if (hotels.length === 0) {
                hotelsList.innerHTML = "<li>No available hotels</li>";
                return;
            }
    
            hotels.forEach((hotel) => {
                const li = document.createElement("li");
    
                li.dataset.name = hotel.name;
                li.dataset.rating = hotel.rating || "No rating";
                li.dataset.address = hotel.address || "No address available";
                li.dataset.distance = hotel.distance || "Unknown distance";
                li.dataset.photo = hotel.photo || "";
    
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
                const nameText = document.createElement("p");
                nameText.textContent = hotel.name;
                nameText.style.fontWeight = "bold";
                nameText.style.margin = "10px 0 5px";
                li.appendChild(nameText);
    
                // Добавление рейтинга (если есть)
                if (hotel.rating) {
                    const ratingText = document.createElement("p");
                    ratingText.textContent = `⭐ ${hotel.rating}`;
                    ratingText.style.color = "#FFD700";
                    li.appendChild(ratingText);
                }
    
                // Добавление адреса
                const addressText = document.createElement("p");
                addressText.textContent = hotel.address;
                addressText.style.fontSize = "14px";
                addressText.style.color = "#666";
                li.appendChild(addressText);
    
                // Добавление расстояния
                const distanceText = document.createElement("p");
                distanceText.textContent = `📍 ${hotel.distance}`;
                distanceText.style.fontSize = "14px";
                distanceText.style.color = "#333";
                li.appendChild(distanceText);
    
                // Обработчик клика для выбора отеля
                li.addEventListener("click", function () {
                    document.querySelectorAll("#hotels-list li").forEach(el => el.style.backgroundColor = "#f9f9f9");
                    li.style.backgroundColor = "#d0eaff"; // Подсветка выбранного отеля
    
                    selectedHotel = {
                        name: li.dataset.name,
                        rating: li.dataset.rating,
                        address: li.dataset.address,
                        distance: li.dataset.distance,
                        photo: li.dataset.photo
                    };
    
                    saveHotelBtn.style.display = "block"; // Показываем кнопку сохранения
                });
    
                hotelsList.appendChild(li);
            });
    
             
    
        } catch (error) {
            console.error("Error displaying hotels:", error);
            hotelsList.innerHTML = "<li>Error displaying hotels</li>";
        }
    }
    

    let selectedHotel = null;

    document.getElementById("hotels-list").addEventListener("click", function (e) {
        const hotelElement = e.target.closest("li"); // Определяем, был ли клик на отеле

        if (hotelElement) {
            selectedHotel = {
                name: hotelElement.dataset.name,
                rating: hotelElement.dataset.rating,
                address: hotelElement.dataset.address,
                distance: hotelElement.dataset.distance,
                photo: hotelElement.dataset.photo
            };

            document.getElementById("save-hotel-btn").style.display = "block"; // Показываем кнопку
        }
    });

    document.getElementById("save-hotel-btn").addEventListener("click", async function () {
        if (!selectedHotel) {
            alert("Please select a hotel first.");
            return;
        }

        try {
            const response = await fetch("/save-hotel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotel: selectedHotel })
            });

            const data = await response.json();
            if (data.success) {
                alert("Hotel saved successfully!");
            } else {
                alert("Error saving hotel.");
            }
        } catch (error) {
            console.error("Error saving hotel:", error);
        }
    });

    async function loadSavedHotel() {
        try {
            const response = await fetch("/get-saved-hotel");
            const data = await response.json();
    
            if (data.savedHotel) {
                alert(`Your saved hotel: ${data.savedHotel.name}`);
            }
        } catch (error) {
            console.error("Error loading saved hotel:", error);
        }
    }
    
    document.addEventListener("DOMContentLoaded", loadSavedHotel);
    



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