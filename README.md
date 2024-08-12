# 🎵 Open Music API

Open Music API is a backend project built using Node.js and Hapi.js. This project leverages RabbitMQ and Redis for messaging and caching, and uses Mailtrap for sending emails.

## 📁 Project Structure

The project is divided into two main folders:

1. **`server/`**: Contains all API-related code, including routes, handlers, and services.
2. **`consumer/`**: Houses the RabbitMQ consumer service responsible for exporting the list of songs and sending it via email.

## 🚀 Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Hapi.js**: A rich framework for building applications and services.
- **RabbitMQ**: A message broker for handling asynchronous tasks.
- **Redis**: An in-memory data structure store, used here for caching.
- **Mailtrap**: A service for sending and testing emails.

## 📧 Email Service

The project includes a feature that allows users to export a list of songs. The export request is processed asynchronously using RabbitMQ. The consumer service listens for export requests and sends the exported song list via email using Mailtrap.

## 🛠️ Usage

- The API server runs on `http://localhost:5000`.
- The consumer service listens for messages on RabbitMQ and sends emails through Mailtrap.
