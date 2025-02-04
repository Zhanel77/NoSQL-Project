const fetch = require("node-fetch");

const API_KEY = "AIzaSyAh7qyCXY6ylXSSOdQFV7Xd-lBOGfSjm74";
const CITY_COORDS = {
    almaty: { lat: 43.238949, lng: 76.889709 },
    astana: { lat: 51.169392, lng: 71.449074 }
};

async function getAttractions(city) {
    const { lat, lng } = CITY_COORDS[city];

    const url = `https://places.googleapis.com/v1/places:searchNearby?key=${API_KEY}`;
    
    const body = {
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: 10000
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
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.location,places.id"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log("Ответ API:", JSON.stringify(data, null, 2));

        if (!data.places || data.places.length === 0) {
            console.log("❌ Нет достопримечательностей!");
            return;
        }

        console.log("Достопримечательности:", data.places.map(place => place.displayName.text));
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}

getAttractions("almaty"); // Получить места для Алматы\
getAttractions("astana");

//AIzaSyAh7qyCXY6ylXSSOdQFV7Xd-lBOGfSjm74