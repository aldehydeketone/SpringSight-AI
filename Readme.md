# 🚀 SpringSight AI

### AI-Powered Spring Boot Production Log Analyzer

SpringSight AI is an intelligent log analysis platform built specifically for Java Backend Developers and Spring Boot Developers.

The platform helps developers upload Spring Boot application logs, automatically classify common framework errors, identify root causes, and generate AI-powered debugging suggestions.

Instead of manually reading thousands of log lines, developers can quickly understand what went wrong and how to fix it.

---

## 🎯 Problem Statement

Debugging Spring Boot applications can be frustrating.

Developers often spend hours investigating:

* Bean Creation Failures
* Dependency Injection Issues
* Hibernate Exceptions
* JPA Errors
* JWT Authentication Problems
* Security Misconfigurations
* Application Startup Failures

SpringSight AI automates this process through rule-based classification and AI-powered analysis.

----

## ✨ Key Features

### 🔐 Authentication

* User Registration
* User Login
* JWT Authentication
* BCrypt Password Encryption

### 📂 Log Upload

* Upload Spring Boot `.log` files
* File Type Validation
* File Size Validation

### 📊 Log Parsing Engine

Automatically extracts:

* INFO Count
* WARN Count
* ERROR Count

### 🧠 Rule-Based Error Classification

Detects common Spring Boot exceptions:

* BeanCreationException
* NoSuchBeanDefinitionException
* HibernateException
* SQLSyntaxErrorException
* JWTException
* AccessDeniedException
* NullPointerException
* OutOfMemoryError
* PortInUseException

### 🤖 AI Root Cause Analysis

Powered by Gemini AI.

Generates:

* Root Cause
* Explanation
* Suggested Fix
* Debugging Steps

### 📈 Dashboard

* Error Statistics
* Severity Distribution
* Upload History
* Category Breakdown

---

## 🏗️ Architecture

```text
React Frontend
        │
        ▼
Spring Boot REST API
        │
        ▼
Authentication Module
        │
        ▼
Log Upload Module
        │
        ▼
Log Parsing Engine
        │
        ▼
Classification Engine
        │
        ▼
AI Analysis Service
        │
        ▼
MySQL Database
```

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot 3
* Spring Security
* Spring Data JPA
* Hibernate
* Maven

### Database

* MySQL

### Frontend

* React
* Tailwind CSS

### AI

* Google Gemini API

### DevOps

* Docker
* Docker Compose

---

## 📦 Project Structure

```text
SpringSight-AI
│
├── docs
│   ├── PRD
│   ├── Architecture
│   └── MVP Technical Specification
│
├── src
│   ├── auth
│   ├── security
│   ├── log
│   ├── classification
│   ├── ai
│   └── dashboard
│
├── pom.xml
└── README.md
```

---

## 🚦 Development Roadmap

### Phase 1

✅ JWT Authentication

### Phase 2

⬜ Log Upload System

### Phase 3

⬜ Log Parsing Engine

### Phase 4

⬜ Classification Engine

### Phase 5

⬜ Dashboard

### Phase 6

⬜ AI Analysis Layer

---

## 🔥 Engineering Highlights

Unlike generic AI log analyzers, SpringSight AI:

* Focuses specifically on Spring Boot applications
* Uses rule-based classification before AI analysis
* Minimizes AI calls through deterministic detection
* Never sends complete raw logs to AI
* Provides structured debugging recommendations

---

## 📚 Learning Goals

This project demonstrates:

* Spring Security
* JWT Authentication
* Spring Data JPA
* File Processing
* System Design
* AI Integration
* REST API Development
* Backend Architecture
* Production-Style Development Workflow

---

## 👨‍💻 Author

**Mihir Singh**

Java Backend Developer | Spring Boot Enthusiast

---

## ⭐ Future Enhancements

* Elasticsearch Integration
* Kibana Integration
* RAG-Based Error Knowledge Base
* Docker Log Monitoring
* Kubernetes Log Support
* Multi-Project Analysis
* Team Collaboration Features

---

### "Debug smarter, not harder."
