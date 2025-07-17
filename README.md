# Real-Time Collaborative Todo Board

This is a full-stack MERN application that provides a real-time, collaborative Kanban-style to-do board. Users can create, update, and manage tasks, 
with all changes instantly reflected for all connected users. The application is designed to be intuitive and efficient for team-based project management.

---

## Deployed App & Demo

* **Live Application:** `https://real-time-todo-board-lyart.vercel.app/`
* **Demo Video:** `[Link to Your Demo Video]`

---

## Tech Stack

### Backend
* **Node.js:** JavaScript runtime environment
* **Express.js:** Web application framework for Node.js
* **MongoDB:** NoSQL database for storing user and task data
* **Mongoose:** Object Data Modeling (ODM) library for MongoDB
* **Socket.IO:** Enables real-time, bidirectional communication between clients and the server
* **JSON Web Tokens (JWT):** For securing the application and authenticating users
* **bcryptjs:** For hashing user passwords before storing them
* **CORS:** To enable cross-origin resource sharing
* **Dotenv:** For managing environment variables

### Frontend
* **React.js:** JavaScript library for building user interfaces
* **React Router:** For handling client-side routing
* **Axios:** For making HTTP requests to the backend API
* **Socket.IO Client:** To connect to the backend WebSocket server for real-time updates
* **React Beautiful DnD:** For implementing drag-and-drop functionality on the board

---

## Features & Usage

* **User Authentication:** Secure user registration and login system.
* **Real-Time Task Management:** Create, edit, and delete tasks with changes instantly visible to all collaborators.
* **Drag & Drop Board:** Intuitively move tasks between columns ('Todo', 'In Progress', 'Done') to update their status.
* **Smart Assign:** Automatically assign a task to the team member with the fewest active tasks to ensure a balanced workload.
* **Conflict Handling:** Prevents users from accidentally overwriting each other's updates with a versioning system and a conflict resolution prompt.
* **Live Activity Log:** A running log on the dashboard shows recent actions taken by all users, such as task creation, updates, and deletions.

---

## Setup and Installation

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
    To run the server with automatic reloading on file changes (recommended for development):
    ```bash
    npm run dev
    ```
    To run the server in production mode:
    ```bash
    npm start
    ```
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
    This will start the React development server, and the application will be available at `http://localhost:3000`.

---

## Logic Explained

### Smart Assign

The **Smart Assign** feature helps distribute work evenly across the team by assigning a task to the user with the lightest workload.

* **Trigger**: A user clicks the "Smart Assign" button on a task card.
* **Logic**:
    1.  The backend receives the request and fetches all registered users.
    2.  For each user, it counts the number of tasks assigned to them that are currently in 'Todo' or 'In Progress' status.
    3.  It then identifies the user with the minimum task count.
    4.  The task is assigned to this "least busy" user, and the change is saved to the database.
* **Outcome**: The task is updated on all users' boards in real-time, showing the new assignee.

### Conflict Handling

To prevent data loss in a collaborative environment, the application uses a versioning system for optimistic concurrency control.

* **Versioning**: Each task has a `version` number in the database, which is incremented with every successful update.
* **Update Process**:
    1.  When a user begins editing a task, the frontend stores its current `version` number.
    2.  When the user saves their changes, the frontend sends the updated data along with this `version` number to the server.
* **Detection**:
    1.  The backend compares the `version` from the user's request with the `version` currently in the database.
    2.  If the numbers match, the update is safe. The server applies the changes and increments the version number.
    3.  If they don't match, it means someone else has already updated the task.
* **Resolution**:
    1.  The server sends a `409 Conflict` error to the user.
    2.  The frontend displays a "Conflict Detected" modal, showing both the user's attempted change and the current server version.
    3.  The user can choose to either **cancel** their changes or **overwrite** the existing changes with their own. If they overwrite, the request is sent again, but this time with the latest version number to ensure the update is valid.
