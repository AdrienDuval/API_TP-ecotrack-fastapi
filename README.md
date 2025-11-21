# EcoTrack API – FastAPI

EcoTrack est un service API conçu pour agréger, stocker et analyser des indicateurs environnementaux locaux
(qualité de l’air, CO₂, météo, énergie, déchets).  
Ce projet met en œuvre les concepts étudiés : FastAPI, JWT Auth, rôles, SQLAlchemy ORM,
ingestion de données externes, filtres avancés, statistiques, et tests d’intégration.

---

## 🚀 Objectifs du projet

- Développer une API REST maintenable et sécurisée avec FastAPI.
- Gérer l’authentification par JWT et un système de rôles (**user**, **admin**).
- Modéliser une base de données propre via SQLAlchemy (entités : indicators, zones, sources, users).
- Implémenter un système d’ingestion de données externes (OpenAQ, Open-Meteo, ADEME, CSV…).
- Exposer des endpoints complets : CRUD, filtres, pagination, recherche, statistiques.
- Fournir des tests automatisés (Pytest) pour valider les routes principales.
- Développer un mini front-end simplifié permettant de consommer l’API.

---

## 📦 Architecture du projet

