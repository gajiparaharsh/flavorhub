 # Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.



Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

## Local Development (Full Stack)

This project consists of two parts:
1. **Frontend**: React + Vite (running on port 8080)
2. **Backend**: Node.js + Express + MongoDB (running on port 5000)

### Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017

### Quick Start (Windows)
Simply run the included batch file:
```cmd
start_app.bat
```
This will open two new command windows for backend and frontend servers.

### Manual Start

**1. Start Backend:**
```bash
cd backend
npm install  # First time only
npm run seed # To populate initial data (optional)
npm run dev
```

**2. Start Frontend:**
```bash
# In the root directory
npm install  # First time only
npm run dev
```

### Environment Variables
- **Backend (`backend/.env`)**:
  - `MONGODB_URI`: Database connection string
  - `JWT_SECRET`: Secret for authentication
  - `FRONTEND_URL`: CORS allowed origin (http://localhost:8080)
- **Frontend (`.env`)**:
  - `VITE_API_URL`: Backend API URL (http://localhost:5000/api)
  - `VITE_SOCKET_URL`: Backend Socket URL (http://localhost:5000)

