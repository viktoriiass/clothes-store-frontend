# Clothes Store 

**Full Stack Web Development project by Viktoriia Kotliarevska**

---

##  Project Overview

Clothes Store is a full-stack e-commerce web application built as part of my university coursework. It enables users to:

* **Browse & Manage inventory**: View, add, and delete products in real-time.
* **Shopping Cart**: Add items, update quantities, and remove products.
* **User Authentication**: Secure registration, login, and password recovery via email.
* **Real-time updates**: Live synchronization of inventory and cart through WebSockets (Socket.io).

This project demonstrates modern web development techniques using Node.js, Express, MongoDB, Vue.js, and Socket.io.

---

##  Technology Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Backend   | Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Nodemailer |
| Frontend  | Vue 3 (Composition API), Vue Router, Vite, Axios              |
| Real-Time | Socket.io (Server & Client)                                   |
| Tools     | npm, ESLint, Prettier                                         |

---

##  Prerequisites

* **Node.js** v14 or higher
* **npm** (bundled with Node.js)
* **MongoDB** (Atlas cluster)
* **Gmail Account** with App Password (for email functionality)

---

## Project Structure

```
clothes-store/
├── backend/          # Express API
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Auth, Items, Basket
│   ├── utils/        # Mailer
│   ├── app.js        # Entry point
│   └── .env          # Server environment variables

└── frontend/         # Vue 3 Application
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── views/       # Page-level components
    │   ├── router/      # Vue Router setup
    │   └── main.js      # App initialization
    ├── public/         # Static assets
    └── vite.config.js  # Vite configuration
```

---

##  Usage

1. **Register** a new user or **Login** with existing credentials.
2. Browse the **Inventory** or add/delete new items.
3. Add products to your **Cart**, adjust quantities, or remove items.
4. If you forget your password, use the **Reset Password** link—check your email for the reset link.

---
*© 2025 Viktoriia Kotliarevska*


