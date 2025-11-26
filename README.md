# EcoTrack API

API FastAPI pour le suivi d'indicateurs environnementaux locaux.

## Fonctionnalités

- **Authentification JWT** avec gestion des rôles (user/admin)
- **CRUD complet** pour utilisateurs, zones, sources et indicateurs
- **Filtrage avancé** par date, zone et type d'indicateur
- **Statistiques et agrégations** (moyennes, tendances, résumés)
- **Ingestion de données** depuis sources externes
- **Dashboard Frontend** React + Tailwind CSS

## Installation

### Backend (API)

1. Créer un environnement virtuel:
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. Installer les dépendances:
```bash
pip install -r requirements.txt
```

3. **Créer le premier admin**:
```bash
python init_admin.py
```
Suivez les instructions pour créer votre compte administrateur.

4. Lancer le serveur:
```bash
uvicorn app.main:app --reload
```

L'API sera accessible sur `http://localhost:8000`

### Frontend (Dashboard)

1. Aller dans le dossier frontend:
```bash
cd frontend
```

2. Installer les dépendances:
```bash
npm install
```

3. Lancer le serveur de développement:
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Documentation

- **API Swagger UI**: `http://localhost:8000/docs`
- **API ReDoc**: `http://localhost:8000/redoc`
- **Frontend**: `http://localhost:5173`

## Gestion des Rôles

### Utilisateurs Réguliers (role="user")
- Peuvent consulter les données (dashboard, analytics, map)
- Peuvent voir les statistiques
- **NE PEUVENT PAS** créer, modifier ou supprimer des données
- **NE PEUVENT PAS** gérer d'autres utilisateurs

### Administrateurs (role="admin")
- Tous les droits des utilisateurs réguliers
- **Gestion des utilisateurs**:
  - Voir tous les utilisateurs
  - Créer d'autres administrateurs
  - Activer/désactiver des comptes
  - Changer les rôles
  - Supprimer des utilisateurs
- **Gestion des données**:
  - Supprimer des indicateurs
  - Supprimer des zones
  - Modifier les datasets

### Création de Comptes

- **Inscription publique** (`/register`): Crée uniquement des comptes **user**
- **Création d'admin**: Seuls les admins peuvent créer d'autres admins via le dashboard

## Structure du projet

```
.
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── models.py            # Modèles SQLAlchemy
│   ├── schemas.py           # Schémas Pydantic
│   ├── crud.py              # Opérations base de données
│   ├── auth.py              # Authentification JWT
│   ├── database.py          # Configuration DB
│   └── routers/             # Endpoints API
│       ├── auth.py          # Inscription/Connexion
│       ├── users.py         # Gestion utilisateurs (admin)
│       ├── zones.py         # Gestion zones
│       ├── indicators.py    # Gestion indicateurs
│       └── stats.py         # Statistiques
├── frontend/
│   ├── src/
│   │   ├── pages/           # Pages React
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx           # Admin only
│   │   │   └── DataManagement.jsx  # Admin only
│   │   ├── layouts/         # Layouts
│   │   ├── components/      # Composants réutilisables
│   │   └── context/         # Context API (Auth)
│   └── package.json
├── ingestion/               # Scripts d'ingestion
│   ├── openmeteo_ingestion.py
│   ├── openaq_ingestion.py
│   └── mock_data_ingestion.py
├── tests/                   # Tests
├── init_admin.py            # Script création admin
└── requirements.txt
```

## Utilisation

### 1. Créer le premier admin
```bash
python init_admin.py
```

### 2. Se connecter au dashboard
1. Ouvrir `http://localhost:5173`
2. Se connecter avec les identifiants admin
3. Accéder aux fonctionnalités admin dans la sidebar

### 3. Créer d'autres admins (Admin uniquement)
1. Aller dans "Users" dans la sidebar
2. Cliquer sur "Create Admin"
3. Remplir le formulaire

### 4. Ingérer des données
```bash
# Données météo (gratuit, sans clé API)
python ingestion/openmeteo_ingestion.py

# Données de test
python ingestion/mock_data_ingestion.py --days 30
```

## API Endpoints

### Authentification
- `POST /auth/register` - Inscription (crée un user)
- `POST /auth/login` - Connexion (retourne JWT)

### Utilisateurs (Admin uniquement)
- `GET /users/` - Liste des utilisateurs
- `GET /users/me` - Utilisateur courant
- `PUT /users/{id}` - Modifier utilisateur
- `DELETE /users/{id}` - Supprimer utilisateur

### Indicateurs
- `GET /indicators/` - Liste avec filtres
- `POST /indicators/` - Créer (admin)
- `DELETE /indicators/{id}` - Supprimer (admin)

### Statistiques
- `GET /stats/summary` - Résumé global
- `GET /stats/air/averages` - Moyennes qualité air
- `GET /stats/co2/trend` - Tendance CO2

## Prochaines étapes

- [x] Backend API avec authentification
- [x] Frontend Dashboard
- [x] Gestion des rôles
- [x] Admin panel
- [x] Ingestion de données
- [ ] Vue cartographique
- [ ] Tests d'intégration
- [ ] Déploiement

## Sécurité

⚠️ **IMPORTANT**: Avant de déployer en production:
1. Changer `SECRET_KEY` dans `app/auth.py`
2. Utiliser une vraie base de données (PostgreSQL)
3. Configurer CORS correctement
4. Activer HTTPS
5. Utiliser des variables d'environnement pour les secrets
