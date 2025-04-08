# Power BI Showcase Web App

## Overview
The Power BI Showcase Web App is a React-based application designed to demonstrate Power BI capabilities. It provides a user-friendly interface for users to log in and access a dashboard displaying relevant data and information.

## Project Structure
```
power-bi-showcase
├── public
│   ├── index.html          # Main HTML file
│   └── favicon.ico        # Favicon for the web application
├── src
│   ├── components
│   │   ├── Auth
│   │   │   └── LoginForm.js  # Login form component
│   │   └── Dashboard
│   │       └── Dashboard.js   # Dashboard component for authenticated users
│   ├── services
│   │   └── authService.js      # Authentication service
│   ├── App.js                  # Main application component
│   ├── index.js                # Entry point for the React application
│   └── styles
│       └── global.css          # Global CSS styles
├── package.json                # npm configuration file
└── README.md                   # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd power-bi-showcase
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Features
- User authentication with a login form.
- Dashboard view for authenticated users.
- Responsive design with global CSS styles.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.