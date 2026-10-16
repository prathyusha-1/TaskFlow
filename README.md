# TaskFlow — MERN Task Management Application

TaskFlow is a responsive task management application built with MongoDB, Express.js, React.js, and Node.js. Users can create, view, edit, delete, search, filter, and update the status of tasks.

## Features

- Create, edit, and delete tasks
- Task priority: Low, Medium, High
- Task status: Pending, In Progress, Completed
- Search tasks by title or description
- Filter tasks by status
- Optional due dates
- Dashboard summary cards
- Input validation and API error handling
- Responsive interface
- REST API backed by MongoDB

## Technologies

- Frontend: React, Vite, CSS, Lucide React
- Backend: Node.js, Express.js
- Database: MongoDB and Mongoose
- Tools: Git, GitHub, Code0 (use it during development and describe your actual workflow below)

## Project structure

```text
taskflow-mern/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── server/
│   ├── models/Task.js
│   ├── routes/tasks.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or later and npm
- A MongoDB instance: local MongoDB or MongoDB Atlas
- Visual Studio Code with Code0 installed for the requested assessment workflow

## Setup and installation

1. Clone your public repository and open the project folder in VS Code.
2. Install the root development dependency:

   ```bash
   npm install
   ```

3. Install the server and client dependencies:

   ```bash
   npm run install:all
   ```

4. Create `server/.env` by copying `server/.env.example`. Set `MONGODB_URI` to your local MongoDB URL or your MongoDB Atlas connection string. Keep credentials private; do not commit `.env`.

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
   ```

5. Optional: create `client/.env` from `client/.env.example`. The default API URL is `http://localhost:5000/api`.

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Run the application

From the project root:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The API runs at `http://localhost:5000`.

Health check: `GET http://localhost:5000/api/health`

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks; supports `search` and `status` query parameters |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/health` | Check API status |

Example task body:

```json
{
  "title": "Finish project README",
  "description": "Document setup and API endpoints",
  "priority": "High",
  "status": "In Progress",
  "dueDate": "2026-10-20"
}
```

## Testing checklist

Before submitting, verify these manually and document any automated tests you add:

- [ ] API health endpoint responds successfully
- [ ] Create a task with a title
- [ ] Empty title is rejected
- [ ] Edit title, description, priority, status, and due date
- [ ] Search by title and description
- [ ] Filter by each status
- [ ] Delete a task after confirming
- [ ] Refresh the browser and confirm data persists in MongoDB
- [ ] Test mobile-width layout
- [ ] Confirm errors are displayed if the API is unavailable

## Code0 and AI Development Experience

**Important: complete this section truthfully after using Code0. Do not claim tasks you did not perform with it.**

Code0 was used as part of the development workflow for this project. I reviewed AI suggestions, ran the application, and checked the resulting behavior rather than relying on generated code without validation.

Replace or refine the examples below to match what you actually did:

1. **Component development:** Used Code0 to help draft or improve the task form and task-list components; checked form validation and UI behavior in the browser.
2. **REST API implementation:** Used Code0 to review Express CRUD routes and input validation; verified requests and responses.
3. **Database integration:** Used Code0 to help troubleshoot the Mongoose model or MongoDB connection; confirmed tasks persisted after refresh.
4. **Debugging and refactoring:** Used Code0 to investigate errors, then ran the app and checked the fix.
5. **Testing and documentation:** Used Code0 to help prepare a test checklist and README; manually verified the listed features.

## GitHub submission

Use the Code0 terminal as requested by the assessment. Make small commits that reflect real progress, for example:

- `chore: initialize MERN project structure`
- `feat: add task model and REST API`
- `feat: build responsive task dashboard`
- `feat: connect UI to task API`
- `docs: add setup instructions and testing checklist`

Only use commit messages that accurately describe your changes. Ensure the repository is public and does not contain `.env` files, database credentials, or other secrets.

## Future improvements

- User authentication and per-user tasks
- Pagination and sorting
- Automated API and component tests
- Deployment with environment-specific configuration
