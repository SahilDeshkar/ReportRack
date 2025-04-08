# 🚀 ReportRack – Power BI Portfolio Sharing Redefined

**Your Power BI dashboards deserve the spotlight, not a corporate firewall.**  
ReportRack is a React-based platform purpose-built for students, aspiring analysts, and data enthusiasts to **host and share Power BI dashboards**—without enterprise email, paid plans, or technical barriers.

---

## 🌟 Why ReportRack?

Power BI’s embedding tools are powerful… but not student-friendly.  
You either need a paid license or an enterprise email to embed dashboards—leaving students and independent creators stuck with screenshots or screen shares.  
That’s where **ReportRack** comes in: an open platform that acts as your personal **Power BI portfolio**—live, accessible, and sharable.

---

## 🧠 Features

- 🔐 **Authentication System** – Secure login & signup experience
- 📊 **Serverless & Scalable Architecture**-Uses Supabase for a fully serverless backend—leveraging PostgreSQL, storage, and JWT-based authentication—allowing rapid scaling without traditional DevOps overhead.
- 🌍 **Secure and Compliant Dashboard Management** – Incorporates Supabase Row-Level Security and user-scoped file storage to ensure users can only access and modify their own content, adhering to best practices in cloud security.
- 🪄 **Multi-Tier Dashboard Upload Pipeline** – Implements a transactional-like process for uploads, validating .pbix files and preview images, ensuring atomicity by rolling back on errors—mimicking robust enterprise-grade data pipelines.
- **BI Portfolio-as-a-Service Platform Vision**- Positions itself as a GitHub-for-dashboards with support for discoverability, ownership, metadata, and user-focused design—making it a long-term scalable product for BI professionals globally.


---

## 🧱 Tech Stack

- **Frontend:** React.js, CSS
- **Authentication:** Custom auth logic with local/session storage
- **Deployment Ready:** Works great on Vercel, Netlify, GitHub Pages, etc.

---

## 📁 Project Structure



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
=======
# ReportRack
A student-friendly platform to showcase and share Power BI dashboards without enterprise barriers.

