# 📊 Habit Tracker

A simple, modern, and interactive web-based habit tracker to help you build and maintain daily habits.

![Habit Tracker](https://via.placeholder.com/800x400?text=Habit+Tracker+Preview)

## ✨ Features

*   **Weekly Tracking**: Track habits across a dynamic weekly grid (Mon-Sun).
*   **Progress Insights**: Real-time weekly progress calculation.
*   **Monthly Dashboard**: Visual donut chart showing completed vs. missed tasks.
*   **Data Persistence**: Habits and logs are saved automatically using a local SQLite database.
*   **Responsive Design**: Clean, minimalist UI that works on multiple devices.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Chart.js
*   **Backend**: Python, Flask
*   **Database**: SQLite

## 🚀 How to Run Locally

### Prerequisites

*   Python 3.x installed
*   `pip` (Python package manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/habit-tracker.git
    cd habit-tracker
    ```

2.  Install dependencies:
    ```bash
    pip install flask
    ```

3.  Run the application:
    
    **Windows:**
    Double-click `run.bat` or run:
    ```bash
    run.bat
    ```

    **Manual:**
    ```bash
    python backend/app.py
    ```

4.  Open your browser and visit:
    ```
    http://127.0.0.1:5000/
    ```

## 📁 Project Structure

```
Habit Tracker/
├── backend/            # Backend logic
│   ├── app.py          # Flask application and API endpoints
│   └── database.db     # SQLite database (generated on run)
├── frontend/           # Frontend assets
│   ├── index.html      # Main HTML interface
│   ├── style.css       # Styling
│   └── script.js       # Frontend logic and API integration
├── .gitignore          # Git ignore rules
├── README.md           # Project documentation
└── run.bat             # Quick start script for Windows
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the MIT License.
