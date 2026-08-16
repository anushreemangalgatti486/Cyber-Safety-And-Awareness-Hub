# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-11-20
### Added
- **Cyber AI Assistant**: Interactive chatbot providing educational guidance, integrating seamlessly with URL and text analyzers.
- **Docker Support**: Containerized the application using multi-stage builds and Docker Compose.
- **CI/CD**: Added GitHub Actions workflow for automated testing and building.
- **API Documentation**: Interactive Swagger UI at `/api/docs`.
- **Structured Logging**: Integrated `morgan` for detailed backend API request logging.

## [1.0.0] - 2024-11-15
### Added
- **Enterprise Authentication**: JWT Access/Refresh token architecture with HTTP-only cookies.
- **Blockchain Integrity**: Immutable report hashing using SHA-256 to prevent backend tampering.
- **Threat Intelligence Aggregator**: Multi-source URL scanning (VirusTotal, Google Safe Browsing, AbuseIPDB).
- **OCR Scanner**: Tesseract.js integration for extracting and analyzing text from images.
- **Admin Dashboard**: Real-time Socket.io powered analytics with geographic heatmaps and robust charts.
