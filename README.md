# Tourist Guide Web Application

## About This Project
This web application is designed for tourists to help them choose places to visit and find the nearest hotel to all selected locations. It provides an intuitive way to plan trips by selecting a city, choosing attractions, and finding nearby accommodations.

## Features
- **City Selection**: Users can choose a city from a predefined list.
- **Place Selection**: Displays a list of popular places in the chosen city, allowing users to select and save them.
- **Hotel Search**: Finds the nearest hotels based on the selected places.
- **User Authentication**: Provides login/logout functionality to personalize user experience.

## How It Works
1. Select a city from the dropdown menu.
2. Click the "Show Places" button to display available attractions.
3. Select and save places you want to visit.
4. Click "Show Hotels" to find nearby accommodations.
5. Choose a hotel and save your selection.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Koweno/tourist_planner.git
   git clone git@github.com:Koweno/tourist_planner.git
   ```
2. Navigate to the project directory:
   ```sh
   cd tourist_planner
   ```
3. Install dependencies:
   ```sh
   sudo npm install dependencies
   ```
4. Start the server:
   ```sh
   npm start
   ```
5. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Project Structure
```
├── models
│   ├── User.js        # Details of users collection
├── public
│   ├── logstyle.css   # CSS file for login and registration
│   ├── styles.css     # CSS file for styling
│   ├── script.js      # Client-side JavaScript
├── views
│   ├── index.ejs      # Main frontend template
│   ├── login.html     # Login page
│   ├── register.html  # Sign up page
├── app.js             # Main server file
├── db.js              # MongoDB configuration
├── package.json       # Project dependencies
└── README.md          # Documentation
```

## Technologies Used
- **Node.js** - Backend server
- **Express.js** - Web framework
- **EJS** - Template engine
- **JavaScript (Frontend & Backend)** - Core logic
- **CSS** - Styling
- **Google Places API** - API to get Places and Hotels
 

## Authors
Koblandy Seipolla - [GitHub Profile](https://github.com/Koweno)
Zhanel Kuandyk - [GitHub Profile](https://github.com/Zhanel77)
Zhaniya Kazbekova - [GitHub Profile](https://github.com/ZhaniyaKazbekova05)
