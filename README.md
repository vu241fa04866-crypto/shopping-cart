# Shopping Cart MERN

A React/Vite shopping storefront with an Express, MongoDB, and Stripe backend.

## Requirements

- Node.js and npm
- MongoDB (local or hosted)
- A Stripe test secret key for checkout
- Node.js 18 or newer

## Setup

Install dependencies:

```powershell
cd client
npm ci
cd ..\server
npm ci
cd ..
```

Create local environment files from the examples:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Set `MONGO_URI` to your MongoDB connection string and `STRIPE_KEY` to a Stripe
test secret key in `server\.env`. To enable Google sign-in, create a Google OAuth
Web client ID and set the same ID as `GOOGLE_CLIENT_ID` in `server\.env` and
`VITE_GOOGLE_CLIENT_ID` in `client\.env`. Add your local frontend URL
(`http://localhost:5173`, or the port Vite prints) to the OAuth client's
authorized JavaScript origins. Keep credentials and real keys out of source control.

## Run

In two terminals from the project root:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

Open the Vite URL printed in the client terminal (usually
`http://localhost:5173`). The API runs on `http://localhost:3000`.

Build the client with `npm run build`.

Run backend API tests with `npm --prefix server test`.
