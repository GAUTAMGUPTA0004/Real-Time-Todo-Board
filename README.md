# Real-Time Collaborative Todo Board

This is a full-stack MERN application that provides a real-time, collaborative Kanban-style to-do board. Users can create, update, and manage tasks, with all changes instantly reflected for all connected users. The application is designed to be intuitive and efficient for team-based project management, featuring user authentication, drag-and-drop task management, and intelligent task assignment.

---

## 🚀 Deployed App & Demo

* **Live Application:** https://real-time-todo-board-lyart.vercel.app/
* **Demo Video:** https://www.loom.com/share/383fbd3625ad417fa0ca1de96d6db15e?sid=2fc6a877-844c-4bc6-acde-5f6287216b0f

---

## ✨ Features

* **User Authentication:** Secure user registration and login system using JWT for session management.
* **Real-Time Task Management:** Create, edit, and delete tasks with changes instantly visible to all collaborators using Socket.IO.
* **Drag & Drop Board:** Intuitively move tasks between columns ('Todo', 'In Progress', 'Done') to update their status.
* **Smart Assign:** Automatically assign a task to the team member with the fewest active tasks to ensure a balanced workload.
* **Conflict Handling:** Prevents users from accidentally overwriting each other's updates with a versioning system and a conflict resolution prompt.
* **Live Activity Log:** A running log on the dashboard shows recent actions taken by all users, such as task creation, updates, and deletions.
* **Responsive Design:** A clean and modern UI that is fully responsive and works on all screen sizes.

---

## 🛠️ Tech Stack

### Backend
* **Node.js & Express.js:** For building the RESTful API.
* **MongoDB & Mongoose:** For database management and data modeling.
* **Socket.IO:** For enabling real-time, bidirectional communication.
* **JSON Web Tokens (JWT):** For securing the application and authenticating users.
* **bcryptjs:** For hashing user passwords.
* **CORS:** To enable cross-origin resource sharing.
* **Dotenv:** For managing environment variables.

### Frontend
* **React.js:** For building the user interface.
* **React Router:** For handling client-side routing.
* **Axios:** For making HTTP requests to the backend API.
* **Socket.IO Client:** To connect to the WebSocket server.
* **React Beautiful DnD:** For drag-and-drop functionality.
* **CSS:** For custom styling and responsive design.

---

## 📂 Project Structure

/
├── backend/
│   ├── controllers/      # Handles business logic
│   ├── models/           # Defines database schemas
│   ├── routes/           # Defines API routes
│   └── server.js         # Main server entry point
└── frontend/
├── public/           # Public assets
├── src/
│   ├── components/   # Reusable React components
│   ├── pages/        # Main page components
│   ├── services/     # API service configuration (Axios)
│   ├── App.jsx       # Main application component with routing
│   └── index.jsx     # Frontend entry point
└── package.json


---

## ⚙️ Setup and Installation

To run this project locally, you will need to have Node.js and npm installed.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:**
    Create a `.env` file in the `backend` directory and add the following variables:
    ```
    MONGO_URI=<Your_MongoDB_Connection_String>
    JWT_SECRET=<Your_JWT_Secret_Key>
    PORT=5000
    ```
4.  **Run the server:**
    * For development with auto-reloading: `npm run dev`
    * For production: `npm start`
    The backend will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
    The React development server will start, and the application will be available at `http://localhost:3000`.

---

## 🧠 Core Logic Explained

### Smart Assign

The **Smart Assign** feature is designed to distribute work evenly.

* **How it works**: When a user clicks "Smart Assign" on a task, the backend queries all users to find the one with the fewest tasks in 'Todo' or 'In Progress' status. The task is then assigned to this user.
* **Real-Time Update**: The assignment change is broadcast to all connected clients, ensuring everyone's board is instantly updated.

### Conflict Handling

To prevent data loss from simultaneous edits, the app uses a task versioning system.

* **How it works**: Each task has a `version` number. When a user updates a task, the version number they started with is sent to the server. The server compares this with the current version in the database.
* **Resolution**: If the versions don't match, it means another user has already made an update. A `409 Conflict` error is sent back, and the user is prompted to either **overwrite** the existing changes (by resubmitting with the new version number) or **cancel** their own.

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint                    | Description                          |
| :----- | :-------------------------- | :----------------------------------- |
| POST   | `/auth/register`            | Register a new user.                 |
| POST   | `/auth/login`               | Log in a user and get a JWT.         |
| GET    | `/tasks`                    | Get all tasks.                       |
| POST   | `/tasks`                    | Create a new task.                   |
| PUT    | `/tasks/:id`                | Update an existing task.             |
| DELETE | `/tasks/:id`                | Delete a task.                       |
| POST   | `/tasks/:id/smart-assign`   | Smart-assign a task.                 |
| GET    | `/logs`                     | Get the last 20 action logs.         |

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/YourFeatureName`.
3.  Make your changes and commit them: `git commit -m 'Add some feature'`.
4.  Push to the branch: `git push origin feature/YourFeatureName`.
5.  Open a pull request.

---

## 📜 License

This project is licensed under the MIT License.






