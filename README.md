# 🚀 Data Pipeline ELT (Node.js + PostgreSQL)

A structured end-to-end ELT data pipeline built with **Node.js** and **PostgreSQL (Neon Cloud)**.
This project is part of my hands-on data engineering learning journey, focused on building a real pipeline architecture instead of just writing queries.

Although this is a practice project, it follows real-world pipeline structure and engineering patterns.

---

## 🎯 Project Goal

To design and implement a simple but structured ELT pipeline that demonstrates:

- Data extraction from an external API
- Staging layer pattern
- Data transformation using SQL
- Loading into a dimensional table
- Transaction handling
- Logging
- Scheduled automation using GitHub Actions

The goal is to build strong foundations in data engineering concepts through practical implementation.

---

## 🏗️ Architecture Overview

```
External API
      ↓
Extract (Node.js)
      ↓
Staging Table (PostgreSQL)
      ↓
Transform (SQL)
      ↓
Dimensional Table (dim_users)
```

- Database: PostgreSQL (Neon Cloud)
- Runtime: Node.js
- Automation: GitHub Actions (scheduled cron)
- Logging: Winston

---

## 🛠️ Tech Stack

- Node.js
- PostgreSQL (Neon)
- GitHub Actions (CI/CD scheduling)
- Winston (structured logging)
- dotenv (environment configuration)

---

## 📂 Project Structure

```
data_pipeline_elt/
│
├── src/
│   ├── db.js
│   ├── extract.js
│   ├── loader.js
│   ├── transform.js
│   └── logger.js
│
├── .github/workflows/
│   └── pipeline.yml
│
├── index.js
├── package.json
└── README.md
```

---

## 🔄 Pipeline Flow

### 1️⃣ Schema Initialization

Ensures required tables exist:

- `stg_users` (raw staging data)
- `dim_users` (clean dimensional table)

### 2️⃣ Extract

Fetches user data from an external API.

### 3️⃣ Load (Staging Layer)

Inserts raw data into the staging table.

### 4️⃣ Transform & Load

- Cleans and filters data
- Uses SQL-based transformation
- Applies `ON CONFLICT` upsert logic to maintain idempotency

All critical operations are wrapped inside database transactions (`BEGIN / COMMIT / ROLLBACK`) to ensure consistency.

---

## ⏰ Automation

The pipeline runs automatically via **GitHub Actions** on a daily schedule:

```
02:00 UTC
```

Database credentials are stored securely using GitHub Secrets.

---

## ✅ Current Features

- Structured ELT architecture
- Staging-to-dimension pattern
- Idempotent upsert logic
- Transaction handling
- Logging (console + file)
- Scheduled CI/CD pipeline
- Cloud database integration (Neon)

---

## 📈 What This Project Demonstrates

This project reflects practical understanding of:

- End-to-end data pipeline design
- Separation of extract, load, and transform logic
- Safe database operations
- Basic dimensional modeling
- Automation & deployment workflow

It is intentionally simple but structured in a way that can be extended toward production-grade patterns.

---

## 🚧 Planned Improvements

To continue leveling up this project:

- Incremental loading (watermark-based)
- Bulk insert optimization
- Retry & exponential backoff for API calls
- Pipeline metadata tracking (run history)
- Slowly Changing Dimension (SCD Type 2)
- Data validation layer
- Performance tuning & indexing

---

## ⚙️ How to Run Locally

1. Clone the repository:

```
git clone https://github.com/asrorymous/data_pipeline_elt.git
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file:

```
DATABASE_URL=your_neon_connection_string
```

4. Run the pipeline:

```
npm start
```

---

## 👨‍💻 About This Project

This project is part of my continuous learning in data engineering.
The focus is not only on making the pipeline run, but on understanding structure, reliability, and scalability step by step.

It is designed to evolve as I deepen my knowledge in modeling, performance optimization, and production reliability.

---
