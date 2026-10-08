# RESTful Restaurants

A responsive React application for organizing restaurants into categories, keeping a starred list, and managing restaurant and category records through an Express API backed by Supabase.

## Technologies

![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Create React App](https://img.shields.io/badge/Create_React_App-5-09D3AC?logo=createreactapp&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP_client-5A29E4?logo=axios&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-5FA04E?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![npm](https://img.shields.io/badge/npm-package_manager-CB3837?logo=npm&logoColor=white)

- **Frontend:** React, React Router, Tailwind CSS, Create React App, Axios, and Fetch
- **Backend:** Node.js, Express, and the Supabase JavaScript client
- **Data:** Supabase (PostgreSQL)
- **Development:** npm and `concurrently`

## Features

- Browse restaurants grouped by category and unassign them from a category.
- View starred restaurants, add or edit a personal note, and unstar a restaurant.
- Create, rename, and delete restaurants; assign each restaurant to a category or clear its category.
- Create, rename, and delete categories.
- Four responsive pages with keyboard-friendly navigation, accessible form labels and feedback, visible focus indicators, and a skip link.
- Restaurant/category names are trimmed and limited to 100 characters. Notes are trimmed and limited to 500 characters. Validation is enforced in both the frontend and API.
- User-provided text is displayed as text (not interpreted as HTML).

## Prerequisites

- Node.js LTS and npm
- A Supabase project with the expected tables and columns:
  - `restaurants`: `id`, `name`
  - `categories`: `id`, `name`
  - `category_restaurants`: `category_id`, `restaurant_id`
  - `starred_restaurants`: `id`, `restaurantId`, `comment`

Keep the Supabase secret key on the server. Never put it in a frontend environment variable or commit it to source control.

## Local setup

From this directory, install dependencies for the app runner and both applications:

```sh
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

Create `backend/.env` with the server-side Supabase credentials:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-side-supabase-key
```

Create `frontend/.env` to point the React app at the local API:

```dotenv
REACT_APP_API_URL=http://localhost:3000
```

Start both services from this directory:

```sh
npm run dev
```

The frontend runs on the Create React App development server (normally port 3001 when the backend is already using port 3000). The backend listens on `PORT` when configured, or port 3000 by default. To run either service independently, use `npm start` from its `frontend` or `backend` directory. Create React App reads `REACT_APP_API_URL` at build time, so set the production API URL before building or deploying the frontend.

## Deployment

- Frontend: [React App](https://restful-restaurants-frontend-xjlj.onrender.com/)
- Backend: [restful-restaurants-backend-2ygw.onrender.com](https://restful-restaurants-backend-2ygw.onrender.com/)

Configure the Render frontend service with `REACT_APP_API_URL` set to the backend URL, and configure the backend service with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.

The frontend uses browser-based routes. For a Render Static Site, add a rewrite rule from `/*` to `/index.html` so direct visits and refreshes on the four page URLs load the React app.

## Scripts

From the project directory:

- `npm run dev` — start the backend and frontend together

From `frontend`:

- `npm start` — start the development server
- `npm test -- --watchAll=false` — run frontend tests once
- `npm run build` — create a production build

From `backend`:

- `npm start` — start the API server
