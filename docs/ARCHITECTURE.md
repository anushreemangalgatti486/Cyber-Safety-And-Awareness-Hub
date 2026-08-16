# Architecture & Design

This document outlines the high-level architecture, database schemas, and logical data flows of the CyberShield platform.

## 1. System Architecture Diagram

```mermaid
graph TD
    Client[React Frontend] <-->|REST API / Socket.io| API[Express Backend API]
    
    subgraph Backend Infrastructure
        API --> Mongoose[Mongoose ORM]
        Mongoose --> MongoDB[(MongoDB)]
        API --> ThreatAggregator[Threat Intelligence]
        API --> BlockchainService[Blockchain Integrity]
        API --> AIAnalyzer[AI Text Analyzer]
        API --> OCRService[Tesseract OCR]
    end

    subgraph External APIs
        ThreatAggregator --> VT[VirusTotal API]
        ThreatAggregator --> GSB[Google Safe Browsing]
        ThreatAggregator --> AbuseIPDB[AbuseIPDB API]
    end
```

## 2. Database ER Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email
        String password
        String role "user, admin"
        String refreshToken
    }
    
    REPORT {
        ObjectId _id PK
        ObjectId userId FK
        String scamType
        String description
        String status "Pending, Verified, Rejected"
        String reportHash "SHA-256 Hash"
        Date hashCreatedAt
    }
    
    USER ||--o{ REPORT : "submits"
```

## 3. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Database

    User->>Client: Enters Email & Password
    Client->>Server: POST /api/auth/login
    Server->>Database: Find User & Verify bcrypt Hash
    Database-->>Server: Verification Success
    Server->>Server: Generate JWT Access & Refresh Tokens
    Server->>Server: Set HTTP-Only Cookie (jwt)
    Server-->>Client: 200 OK + { user, accessToken }
    Client->>Client: Store accessToken in Memory
    Client->>User: Redirects to Dashboard
```

## 4. AI Analysis Flow Diagram

```mermaid
graph TD
    Input[User Input Text/Message] --> Preprocessor[Clean & Lowercase Text]
    Preprocessor --> KeywordEngine[Check High/Medium/Low Risk Keywords]
    Preprocessor --> PatternEngine[Regex Match URLs, Emails, Phones, Money]
    KeywordEngine --> ScoreCalc[Calculate Risk Score 0-100]
    PatternEngine --> ScoreCalc
    ScoreCalc --> Categorization[Determine Scam Category & Risk Level]
    Categorization --> Output[Return JSON: Score, Level, Recommendations]
```

## 5. OCR Processing Flow

```mermaid
graph LR
    User[Upload Image] --> API[POST /api/ocr/scan]
    API --> Tesseract[Tesseract.js Engine]
    Tesseract --> ExtractedText[Raw Text Data]
    ExtractedText --> AI[Scam Analyzer Service]
    AI --> Result[Final Threat Report]
    Result --> User
```

## 6. Threat Intelligence Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant VirusTotal
    participant SafeBrowsing
    participant AbuseIPDB

    Client->>Backend: POST /api/url/scan { url }
    Backend->>VirusTotal: Fetch Domain Report
    Backend->>SafeBrowsing: Check Threat Lists
    Backend->>AbuseIPDB: Check IP Reputation
    VirusTotal-->>Backend: VT Data
    SafeBrowsing-->>Backend: GSB Data
    AbuseIPDB-->>Backend: IP Data
    Backend->>Backend: Aggregate Scores & Apply Weights
    Backend-->>Client: Unified Final Risk Score
```

## 7. Blockchain Integrity Flow

```mermaid
graph TD
    NewReport[Report Submitted] --> ExtractPayload[Extract ID, User, Type, Description]
    ExtractPayload --> HashService[Deterministic JSON Stringify]
    HashService --> SHA256[Generate SHA-256 Hash]
    SHA256 --> DBStore[Save Hash & Timestamp to MongoDB]
    
    AdminVerify[Admin Clicks Verify] --> DBFetch[Fetch Report Document]
    DBFetch --> Recalculate[Recalculate Hash from Payload]
    Recalculate --> Compare{Matches Stored Hash?}
    Compare -- Yes --> Verified[Status: Verified]
    Compare -- No --> Tampered[Status: Tampered]
```
