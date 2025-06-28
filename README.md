# Ecodeli Backend - API NestJS

<p align="center">
  <img src="src/assets/ecodeli.png" width="200" alt="Ecodeli Logo" />
</p>

## Description

Backend API pour la plateforme Ecodeli, une application de livraison écologique et de services personnalisés. Cette API est construite avec [NestJS](https://nestjs.com/) et fournit tous les services nécessaires pour la gestion des utilisateurs, des livraisons, des paiements et des communications en temps réel.

## Fonctionnalités principales

- 🔐 **Authentification et autorisation** - JWT, gestion des rôles
- 👥 **Gestion des utilisateurs** - Clients, fournisseurs, livreurs
- 🚚 **Système de livraison** - Suivi, validation
- 💳 **Paiements** - Intégration Stripe, gestion des abonnements
- 💬 **Messagerie** - WebSockets pour les conversations en temps réel
- 📧 **Notifications** - Emails automatisés avec Resend
- 🌍 **Internationalisation** - Support multi-langues
- 📊 **Calculateur CO2** - Impact environnemental des livraisons
- 📱 **API Mobile** - Endpoints dédiés pour l'application mobile
- 🗄️ **Base de données** - MySQL avec TypeORM

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Base de données MySQL
- Compte AWS S3 (pour le stockage de fichiers)
- Compte Stripe (pour les paiements)
- Compte Resend (pour les emails)

## Installation

```bash
# Cloner le repository
git clone <repository-url>
cd ecodeli-backend-nestjs

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
DATABASE_NAME=ecodeli

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-3
AWS_S3_BUCKET=ecodeli-bucket

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Resend (Email)
RESEND_API_KEY=your-resend-api-key

# Application
PORT=3000
NODE_ENV=development
```

## Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run start:prod

# Mode debug
npm run start:debug
```

## Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

## Documentation API

Une fois l'application démarrée, la documentation Swagger est disponible à :
- **Développement** : http://localhost:3000/api
- **Production** : https://api.ecodeli.fr/api

## Structure du projet

```
src/
├── auth/                 # Authentification et autorisation
├── users/               # Gestion des utilisateurs
├── clients/             # Gestion des clients
├── providers/           # Gestion des fournisseurs
├── delivery-ads/        # Annonces de livraison
├── delivery-persons/    # Gestion des livreurs
├── delivery-steps/      # Étapes de livraison
├── routes/              # Gestion des itinéraires
├── orders/              # Gestion des commandes
├── payments/            # Gestion des paiements
├── stripe/              # Intégration Stripe
├── wallets/             # Gestion des portefeuilles
├── conversations/       # Conversations en temps réel
├── messages/            # Messages
├── ratings/             # Système de notation
├── email/               # Service d'emails
├── storage/             # Gestion des fichiers
├── co2-calculator/      # Calculateur d'impact CO2
├── mobile/              # API mobile
└── i18n/                # Internationalisation
```

## Déploiement

### Avec Docker

```bash
# Construire l'image
docker build -t ecodeli-backend .

# Lancer le conteneur
docker run -p 3000:3000 ecodeli-backend
```

### Avec Docker Compose

```bash
docker-compose up -d
```

## Scripts disponibles

- `npm run build` - Compiler le projet
- `npm run start` - Démarrer en mode production
- `npm run start:dev` - Démarrer en mode développement
- `npm run start:debug` - Démarrer en mode debug
- `npm run lint` - Linter le code
- `npm run format` - Formater le code
- `npm run test` - Lancer les tests
- `npm run test:e2e` - Lancer les tests end-to-end

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement Ecodeli.

## Licence

Ce projet est privé et propriétaire d'Ecodeli.
