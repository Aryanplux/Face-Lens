# 📸 FaceLens

<div align="center">
  <em>An Advanced, AI-Powered Event Photography Management & Distribution System.</em><br>
  <strong>Developed Exclusively by Aryan Dhiman</strong>
</div>

<br>

<div align="center">

[![Documentation](https://img.shields.io/badge/Docs-Main_Documentation-blue?style=for-the-badge&logo=read-the-docs)](https://github.com/Aryanplux/Face-Lens/blob/main/docs/main.pdf)
[![Video Tutorial](https://img.shields.io/badge/🎥_Tutorial_Video-Coming_Soon!-orange?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#)

</div>

---

## 📖 Table of Contents
1. [Introduction](#-introduction)
2. [Key Features](#-key-features)
3. [Architecture (Detailed)](#%EF%B8%8F-architecture-detailed)
    - [System Overview](#system-overview)
    - [Frontend (Client Layer)](#frontend-client-layer)
    - [Backend (Core API Layer)](#backend-core-api-layer)
    - [Machine Learning (AI Layer)](#machine-learning-ai-layer)
    - [Data Flow & Processing](#data-flow--processing)
4. [Technology Stack](#-technology-stack)
5. [Getting Started (Installation)](#-getting-started-installation)
6. [Resources](#-resources)
7. [Creator](#-creator)

---

## 🌟 Introduction

Welcome to **FaceLens**, the next generation of event photo sharing. Traditionally, hosts and attendees struggle with distributing and finding their respective pictures after large gatherings, relying on massive shared drives or tedious manual sorting. 

**FaceLens** completely automates this process using state-of-the-art Facial Recognition technologies. The platform effortlessly sorts uploaded photos and isolates them for each guest. All a user has to do is register, upload a reference selfie, and the system creates a personalized gallery of every event photo they appear in.

This robust system is securely built using modern web architectures and separates concerns optimally between client, backend, and machine learning components.

---

## 🔥 Key Features

- **Automated Photo Distribution:** No more scrolling for hours. Finding yourself in thousands of photos happens within seconds.
- **Smart Facial Recognition:** Powered by a dedicated deep learning microservice providing accurate embedding extraction & face matching.
- **Secure Event Galleries:** Share your party photos seamlessly through event-specific logins and portals.
- **Microservices Architecture:** Modular backend isolating heavy machine-learning processes from core REST workloads.
- **Interactive UI:** Smooth, responsive Front-end experience built using React + Vite.

---

## 🏗️ Architecture (Detailed)

FaceLens is designed with a modern **n-tier microservices architecture** that emphasizes loose coupling, high availability, and separation of concerns.

### System Overview
The application is strictly decoupled into three main repositories/components:
1. **FaceLens-Frontend (`frontend/`)**
2. **FaceLens-Spring Boot Core Backend (`FaceLens-sb/`)**
3. **FaceLens-Machine Learning Engine (`FaceLens-ml/`)**

### Frontend (Client Layer)
- **Framework:** React.js bootstrapped with Vite for instant server start & modular bundling.
- **Responsibilities:** 
  - Render dynamic user dashboards (`Dashboard.jsx`), event creations (`CreateEvent.jsx`), and interactive galleries (`EventGallery.jsx`).
  - Manage client local state and JWT-based authentication context.
  - Deliver responsive UI via CSS variables and grid/flexbox based assets.
- **Communication:** Communicates exclusively with the Spring Boot Backend via RESTful HTTP requests, transmitting multipart/form-data for event photos and JSON for configurations.

### Backend (Core API Layer)
- **Framework:** Spring Boot (Java)
- **Responsibilities:**
  - Acts as the primary API Gateway and central orchestration hub.
  - Manages User accounts, Event configurations, security filtering, and file uploads (stored efficiently on predefined disk blocks `uploads/`).
  - Contains the core persistence logic (DTO structures, Entity modelling, Repository handling).
  - Whenever a new photo is uploaded, this service persists the file, generates logs, and fires an asynchronous or synchronous payload to the ML Engine to analyze the image content.

### Machine Learning (AI Layer)
- **Framework:** Python, exposing capabilities heavily reliant on native computer vision modules (`testML.py`, `main.py`).
- **Responsibilities:**
  - Operates as a stateless microservice.
  - Ingests image data/paths sent from the Spring Boot API.
  - **Pipeline:** Runs face detection algorithms -> Crops faces -> Transforms images into dense embeddings -> Computes Euclidean or Cosine distances against registered user base profiles.
  - Returns JSON matched IDs to the Spring Boot Core which subsequently updates the database relationships.

### Data Flow & Processing
1. **Ingestion:** User hits the `/upload` endpoint on the frontend.
2. **Storage:** The Spring Boot API validates tokens, accepts the payload, and saves the binary data efficiently.
3. **Inference:** A sub-request is immediately forwarded to the Python ML server.
4. **Resolution:** Python identifies faces, evaluates high-dimensional mappings, and feeds the resulting recognized `UserId`s back to the Spring Boot API.
5. **Retrieval:** When an attendee logs into their Dashboard, Spring Boot dynamically queries for all images mapped to their `UserId`, serving them directly through the React App.

---

## 💻 Technology Stack

| Aspect | Technology |
| --- | --- |
| **Frontend** | React, Vite, CSS3, JavaScript |
| **Backend** | Java, Spring Boot, Maven, REST APIs |
| **Machine Learning** | Python, Computer Vision Libraries (OpenCV / face_recognition/ dlib) |
| **Documentation** | LaTeX (TeX Live) |
| **Version Control** | Git, GitHub |

---

## 🚀 Getting Started (Installation)

*(A complete runbook is available within the separate folders)*

1. **Clone the project:**
   ```bash
   git clone https://github.com/Aryanplux/Face-Lens.git
   ```
2. **Run the Core Backend (FaceLens-sb):**
   ```bash
   cd FaceLens-sb
   # For Windows
   mvnw.cmd spring-boot:run
   ```
3. **Run the Machine Learning Service (FaceLens-ml):**
   ```bash
   cd FaceLens-ml
   pip install -r requirements.txt
   python main.py
   ```
4. **Run the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📚 Resources

All heavy technical documentation, algorithmic formulas, and LaTeX structured blueprints are consolidated in a unified PDF:

👉 **[Official FaceLens PDF Documentation & Architecture Manual](https://github.com/Aryanplux/Face-Lens/blob/main/docs/main.pdf)**

👉 **[🎥 Tutorial Video - Coming Soon!](#)**

---

## 👨‍💻 Creator

This immense platform was designed, engineered, and completely developed by:

**Aryan Dhiman**
*Software Engineer & Deep Learning Enthusiast* 
