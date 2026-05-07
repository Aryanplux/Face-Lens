# FaceLens

<div align="center">
  <em>An Advanced, AI-Powered Event Photography Management and Distribution System.</em><br>
  <strong>Developed Exclusively by Aryan Dhiman</strong>
</div>

<br>

<div align="center">

[![Documentation](https://img.shields.io/badge/Docs-Main_Documentation-blue?style=for-the-badge)](https://github.com/Aryanplux/Face-Lens/blob/main/docs/main.pdf)
[![Video Tutorial](https://img.shields.io/badge/Tutorial_Video-Coming_Soon!-orange?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#)

</div>

---

## Table of Contents
1. [Introduction](#introduction)
2. [Core Problem Statement and Solution](#core-problem-statement-and-solution)
3. [Architecture and System Design](#architecture-and-system-design)
    - [High-Level Architectural Overview](#high-level-architectural-overview)
    - [Frontend Application Layer](#frontend-application-layer)
    - [Backend API Service Layer](#backend-api-service-layer)
    - [Machine Learning and AI Inference Layer](#machine-learning-and-ai-inference-layer)
    - [Data Flow and State Management](#data-flow-and-state-management)
4. [Detailed Technology Stack](#detailed-technology-stack)
5. [Installation and Setup Guide](#installation-and-setup-guide)
6. [Resources and Documentation](#resources-and-documentation)
7. [Creator](#creator)

---

## Introduction

Welcome to FaceLens, a highly sophisticated and fully automated event photo sharing platform. In large-scale social gatherings, corporate events, or private parties, photographers capture thousands of images. Distributing these images effectively so that each attendee receives only their relevant pictures has historically been a manual, tedious, and privacy-intruding process. 

FaceLens revolutionizes this workflow by completely automating photo sorting and distribution. By leveraging state-of-the-art Deep Learning facial recognition models, FaceLens scans massive directories of event photos, maps individuals based on an initial reference selfie, and generates isolated, private galleries for each user almost instantaneously. This project represents a complete, full-stack microservices ecosystem engineered from the ground up to solve real-world media distribution challenges.

---

## Core Problem Statement and Solution

**The Problem:**
When events conclude, attendees often wait days or weeks for a link to a massive, unorganized cloud drive containing thousands of pictures. Guests must spend significant time scrolling through irrelevant pictures to find themselves, leading to a poor user experience and potential privacy concerns as everyone has access to everyone else's candid moments.

**The FaceLens Solution:**
FaceLens operates on a simple premise:
1. An event host uploads a raw batch of event photos to the platform.
2. Attendees register on the platform and provide a single reference image (a selfie).
3. The FaceLens automated ML pipeline processes the event batch, extracting facial embeddings and comparing them against the attendees' reference embeddings using advanced distance metrics.
4. Attendees immediately receive a highly curated, private dashboard containing *only* the photos in which they are present.

---

## Architecture and System Design

FaceLens is engineered using an advanced n-tier microservices architecture. It strictly decouples the client side, the core business logic, and the heavy machine learning inference engine. This decoupling ensures high scalability, fault tolerance, and independent deployment cycles.

### High-Level Architectural Overview
The system is divided into three distinct operational domains:
- **FaceLens Frontend:** A Single Page Application (SPA) providing the user interface.
- **FaceLens Core API (Spring Boot):** The central orchestrator handling user management, persistence, security, and multiplexing payload distribution.
- **FaceLens AI Engine (Python):** A headless, stateless inference service dedicated solely to matrix operations, image processing, and facial embedding generation.

### Frontend Application Layer
The frontend is designed with performance and modularity in mind.
- **Component-Driven UI:** Built entirely upon React functional components. The hierarchy separates generic UI elements (GlobalLogo, GlobalThemeToggle) from complex page views (Dashboard, EventGallery, UploadPage).
- **Routing and State:** Employs dynamic client-side routing to seamlessly transition users from landing pages to authenticated dashboards.
- **Interceptors and Security:** Utilizes dedicated service modules (uthService.js) to handle token management, attaching JWTs to outgoing requests and handling asynchronous HTTP states (loading, success, error) securely during large file uploads.

### Backend API Service Layer
The backend follows Domain-Driven Design (DDD) principles implemented within the Spring Boot ecosystem.
- **Controller Layer:** Exposes RESTful endpoints mapped to specific resources (e.g., /api/users, /api/events, /api/photos).
- **Service Layer:** Contains the core business logic. For instance, when a photo batch is received, the service layer parallelizes the storage logic, writing to defined static paths (/uploads/event_id/photos), and prepares metadata payloads.
- **Data Access Layer / Persistence:** Utilizes Spring Data JPA to interface with the relational database. Entities are strictly mapped using ORM, representing complex one-to-many relationships (Event to Photos) and many-to-many relationships (Users to Photos).
- **Inter-Service Communication:** Once photos are persisted, the Spring Boot core executes internal REST calls or message payloads to the Machine Learning microservice, forwarding file paths/URIs for the ML component to analyze independently.

### Machine Learning and AI Inference Layer
This is the mathematical core of FaceLens.
- **Preprocessing:** When invoked, the Python pipeline reads the image binary, standardizes the color space (BGR to RGB), and normalizes the resolution to prevent out-of-memory multi-dimensional tensor errors.
- **Face Detection:** Utilizes Convolutional Neural Networks (CNNs) or Histogram of Oriented Gradients (HOG) to draw bounding boxes around human faces in dynamic crowd shots.
- **Embedding Extraction:** Crops the detected faces, passing them through a deep ResNet (Residual Neural Network) trained on massive facial datasets to generate a 128-dimensional encodings.
- **Distance Metrics & Matching:** For every extracted face matrix, the system calculates the Euclidean distance or Cosine similarity against stored 128-D reference profiles in the active database. If the distance falls below a rigid statistical threshold, a match is confirmed and the mapping is returned to the Java backend.

### Data Flow and State Management
1. **Upload Phase:** Multipart/form-data is transmitted via secure HTTP POST from React -> Spring Boot. Spring Boot saves the file to local block storage and logs the metadata in SQL.
2. **Processing Phase:** Spring Boot triggers the Python Engine via an internal HTTP request, passing the absolute location of the newly verified file. 
3. **Inference Phase:** Python executes the detection scripts (main.py, 	estML.py), matches extracted faces against known identities, and returns a JSON array of MatchedUserIDs.
4. **Resolution Phase:** Spring Boot parses the AI response, creates relational records, and dispatches success signals back to the client.
5. **Retrieval Phase:** Upon user login, React requests matching images. Spring Boot authenticates the token, queries the junction tables, and streams the binary image data or static URLs back to the client frontend.

---

## Detailed Technology Stack

The technical stack involves heavy enterprise-grade frameworks tailored to performance and scalability.

### Frontend (Presentation Layer)
- **React 18:** For maintaining high-performance virtual DOM rendering.
- **Vite:** Next-generation frontend tooling providing rapid Hot Module Replacement (HMR) and optimized build bundling.
- **CSS3 / Node Modules:** Custom modular stylesheets (UploadPage.css, EventGallery.css) ensuring component-scoped styling and responsive flex/grid layouts.
- **Axios:** For robust promise-based HTTP client operations.

### Backend Core (Application Layer)
- **Java 17:** Primary server-side programming language.
- **Spring Boot 3.x:** Enterprise application framework utilizing auto-configuration and rapid API bootstrapping.
- **Spring Security & JWT:** Stateless authentication mechanisms ensuring API endpoints remain highly protected.
- **Spring Data JPA / Hibernate:** For robust Object Relational Mapping (ORM) abstracting raw SQL logic.
- **Maven:** Comprehensive project management, build lifecycle orchestration, and dependency resolution.

### Machine Learning (Inference Layer)
- **Python 3.10+:** Industry-standard language for machine learning mathematical execution.
- **OpenCV (cv2):** Library used for real-time computer vision transformations and image thresholding.
- **face_recognition / dlib:** Advanced libraries utilizing C++ under the hood for deep learning facial topography models.
- **NumPy:** For high-performance vectorized implementations of array manipulations (N-dimensional arrays).

### Infrastructure & Tooling
- **LaTeX:** For generating mathematically rigorous and highly formatted architectural documentation (docs/main.tex).
- **Git / GitHub:** Primary version control system ensuring branch stability.

---

## Installation and Setup Guide

Please ensure you have Node.js, Java SDK (17+), Maven, and Python installed on your local machine prior to executing the environment.

### 1. Repository Clone
\\\ash
git clone https://github.com/Aryanplux/Face-Lens.git
cd Face-Lens
\\\

### 2. Initializing Backend Core (FaceLens-sb)
The Spring Boot application acts as the master node. Ensure your local database properties are configured in \pplication.properties\.
\\\ash
cd FaceLens-sb

# For Windows environments
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# For Unix environments
./mvnw clean install
./mvnw spring-boot:run
\\\

### 3. Initializing AI Engine (FaceLens-ml)
The Python AI engine requires standard build environments and dependencies.
\\\ash
cd ../FaceLens-ml

# Create an isolated virtual environment
python -m venv venv
# Windows: venv\\Scripts\\activate 
# Unix: source venv/bin/activate    

# Install required packages
pip install -r requirements.txt

# Execute the ML listener
python main.py
\\\

### 4. Initializing React Frontend (frontend)
The client operates on a separate port utilizing Vite.
\\\ash
cd ../frontend

# Install Node dependencies
npm install

# Start the fast-refresh development server
npm run dev
\\\

---

## Resources and Documentation

For a deep academic analysis of the algorithms, statistical thresholds, ER diagrams, and system state machines, refer directly to the compiled documentation below.

- **Official FaceLens End-to-End PDF Documentation:** [View main.pdf within repository](https://github.com/Aryanplux/Face-Lens/blob/main/docs/main.pdf)
- **System Tutorial Video / Walkthrough:** [Coming Soon](#)

---

## Creator

This extensive intelligent system, including the React client, Spring Boot architecture, and Python ML pipelines, was researched, engineered, and independently developed by:

**Aryan Dhiman**  
*Software Engineer and Deep Learning Enthusiast*  
*Project completed as a solo endeavor spanning full-stack and AI spectrums.*
