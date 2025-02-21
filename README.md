# Travel Planner Web Application

## Overview
This is a web application designed to help tourists choose places to visit in a selected city and find nearby hotels. Users can log in, select a city, view tourist attractions, select places they wish to visit, save their choices, and find and save nearby hotels.

## Features
- User registration and login
- Selection of cities (Almaty, Astana)
- Viewing tourist attractions
- Selecting and saving places
- Finding and saving nearby hotels
- Commenting system (add, edit, delete comments)

## Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- Google Places API
- EJS for templating
- HTML, CSS, JavaScript
- Google Places API

## Project Structure
```
├── models
│   ├── User.js       
|   |── Place.js
|   |── Hotel.js
|   |── Comment.js    # Details of comments collection
├── public
│   ├── logstyle.css   # CSS file for login and registration
│   ├── styles.css     # CSS file for general styling
│   ├── comment.css    # CSS file for comments page
│   ├── script.js      # Client-side JavaScript
├── views
│   ├── index.ejs      # Main frontend template
│   ├── login.html     # Login page
│   ├── register.html  # Sign up page
│   ├── comments.ejs   # Comments page
├── app.js             # Main server file
├── db.js              # MongoDB configuration
├── package.json       # Project dependencies
└── README.md          # Documentation
```

## Prerequisites
Make sure you have the following installed:
- Node.js
- MongoDB Atlas (or a local MongoDB instance)

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd travel-planner-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file and add the following variables:
   ```env
   PORT=3000
   GOOGLE_API_KEY=<Your_Google_API_Key>
   MONGODB_URI=<Your_MongoDB_Atlas_Connection_String>
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Database Structure
### Users Collection
```js
{
  _id: ObjectId,
  username: String,
  password: String (hashed)
}
```

### Places Collection
```js
{
  _id: ObjectId,
  userId: ObjectId,
  placeId: String,
  name: String,
  rating: String,
  photo: String,
  location: {
    latitude: Number,
    longitude: Number
  }
}
```

### Hotels Collection
```js
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  rating: String,
  address: String,
  distance: String,
  photo: String
}
```

### Comments Collection
```js
{
  _id: ObjectId,
  userId: ObjectId,
  text: String,
  createdAt: Date
}
```

## API Endpoints

### Authentication
#### POST `/register`
Registers a new user.
```json
{
  "username": "user",
  "password": "password"
}
```

#### POST `/login`
Logs in an existing user.
```json
{
  "username": "user",
  "password": "password"
}
```

#### GET `/logout`
Logs out the current user.

---

### Places
#### GET `/get-attractions?city=Almaty`
Gets attractions in a specified city (Almaty or Astana).

#### POST `/save-places`
Saves selected places for the logged-in user.
```json
{
  "places": [
    {
      "id": "place-id",
      "name": "Place Name",
      "rating": "4.5",
      "photo": "photo-url",
      "lat": 43.2,
      "lng": 76.9
    }
  ]
}
```

#### GET `/get-selected-places`
Gets saved places for the logged-in user.

#### GET `/get-place-details?placeIds=place-id1&placeIds=place-id2`
Gets detailed information about places by IDs.

### Hotels
#### POST `/get-hotels-by-coordinates`
Finds hotels near specified coordinates.
```json
{
  "latitude": 43.2,
  "longitude": 76.9
}
```

#### POST `/save-hotel`
Saves a selected hotel for the logged-in user.
```json
{
  "hotel": {
    "name": "Hotel Name",
    "rating": "4.5",
    "address": "Hotel Address",
    "distance": "1.2 km",
    "photo": "photo-url"
  }
}
```

## Comments
#### GET `/comments`
Fetches all comments for the logged-in user.

#### POST `/comments`
Creates a new comment.
```json
{
  "text": "This is a comment"
}
```

#### PUT `/comments/:id`
Updates a comment by ID.

#### DELETE `/comments/:id`
Deletes a comment by ID.

## Deploy
```bash
https://nosql-project-axsj.onrender.com
```

## Authors
Zhanel Kuandyk 
Zhaniya Kazbekova 

## Github url
https://github.com/Zhanel77/NoSQL-Project.git
