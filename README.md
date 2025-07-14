# Ecodeli Backend – API NestJS

![Ecodeli Logo](src/assets/ecodeli.png)

## Présentation

**Ecodeli** est une plateforme de livraison écologique et de services personnalisés. Ce dépôt contient l’API backend développée avec [NestJS](https://nestjs.com/), qui gère l’ensemble des fonctionnalités métier : utilisateurs, annonces, paiements, messagerie, notifications, abonnements, etc.

---

## Sommaire
- [Ecodeli Backend – API NestJS](#ecodeli-backend--api-nestjs)
  - [Présentation](#présentation)
  - [Sommaire](#sommaire)
  - [Fonctionnalités](#fonctionnalités)
  - [Organisation du code](#organisation-du-code)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Lancement](#lancement)
  - [Tests](#tests)
  - [Documentation API](#documentation-api)
  - [Déploiement avec PM2](#déploiement-avec-pm2)
    - [Installation de PM2](#installation-de-pm2)
    - [Lancer l’application avec PM2](#lancer-lapplication-avec-pm2)
    - [Commandes utiles PM2](#commandes-utiles-pm2)
    - [Configuration PM2](#configuration-pm2)
  - [Philosophie de code](#philosophie-de-code)
  - [Support](#support)
  - [Licence](#licence)

---

## Fonctionnalités
- **Authentification & autorisation** (JWT, rôles)
- **Gestion des utilisateurs** (clients, prestataires, livreurs)
- **Gestion des annonces** (livraison, services, courses, etc.)
- **Paiements** (Stripe, abonnements, wallet)
- **Messagerie temps réel** (WebSocket)
- **Notifications email** (Resend)
- **Internationalisation** (multi-langues)
- **Calcul CO2** (impact environnemental)
- **API mobile** (routes dédiées)

---

## Organisation du code

```
ecodeli-backend-nestjs/
├── src/
│   ├── ad-payments/           # Paiements liés aux annonces
│   ├── app/                   # Bootstrap, configuration principale
│   ├── assets/                # Images, logos backend
│   ├── auth/                  # Authentification, rôles, guards
│   ├── clients/               # Gestion des clients
│   ├── co2-calculator/        # Calcul d'impact CO2
│   ├── configurations/        # Paramètres dynamiques
│   ├── conversations/         # Système de messagerie
│   ├── delivery-ads/          # Annonces de livraison
│   ├── delivery-persons/      # Gestion des livreurs
│   ├── delivery-steps/        # Étapes de livraison
│   ├── email/                 # Service d'envoi d'emails
│   ├── i18n/                  # Internationalisation
│   ├── invoices/              # Facturation
│   ├── locations/             # Points de départ/arrivée
│   ├── messages/              # Messages individuels
│   ├── mobile/                # Endpoints spécifiques mobile
│   ├── order-tracking/        # Suivi et validation de commandes
│   ├── personal-service-types/ # Types de services à la personne
│   ├── personal-services-ads/ # Annonces de services à la personne
│   ├── providers/             # Gestion des prestataires
│   ├── provider-schedules/    # Plannings des prestataires
│   ├── ratings/               # Système de notation
│   ├── release-cart-ads/      # Annonces de chariots en libre service
│   ├── routes/                # Gestion des itinéraires
│   ├── shopping-ads/          # Annonces de courses
│   ├── storage/               # Stockage de fichiers (S3)
│   ├── stripe/                # Intégration Stripe
│   ├── subscriptions/         # Abonnements
│   ├── subscription-payments/ # Paiements d'abonnement
│   ├── tasks/                 # Tâches planifiées (cron)
│   ├── traders/               # Commerçants partenaires
│   ├── users/                 # Utilisateurs
│   ├── wallet-transactions/   # Transactions de portefeuille
│   ├── wallets/               # Portefeuilles utilisateurs
│   └── ...
├── test/                      # Tests end-to-end
├── locales/                   # Fichiers de traduction JSON
├── Dockerfile                 # Déploiement conteneurisé
├── ecosystem.config.cjs       # PM2 config
├── entrypoint.sh              # Script de démarrage Docker
├── package.json               # Dépendances et scripts
├── tsconfig.json              # Config TypeScript
└── ...
```

---

## Prérequis
- Node.js 18+
- npm ou yarn
- Base de données MySQL/MariaDB
- Compte AWS S3 (stockage)
- Compte Stripe (paiements)
- Compte Resend (emails)

---

## Installation
```bash
# Cloner le repo
$ git clone <repository-url>
$ cd ecodeli-backend-nestjs

# Installer les dépendances
$ npm install
```

---

## Configuration
Copier le fichier `.env.example` en `.env` et compléter les variables :

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=...
DATABASE_NAME=ecodeli
JWT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-3
AWS_S3_BUCKET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
PORT=3000
NODE_ENV=development
```

---

## Lancement
```bash
# Démarrage en développement
$ npm run start:dev

# Démarrage en production
$ npm run start:prod
```

---

## Tests
```bash
# Tests unitaires
$ npm run test

# Tests end-to-end
$ npm run test:e2e

# Lint
$ npm run lint
```

---

## Documentation API
- Swagger : http://localhost:3000/documentation
- OpenAPI JSON : http://localhost:3000/documentation/open-api.json

---

## Déploiement avec PM2

Pour un déploiement en production, il est recommandé d’utiliser [PM2](https://pm2.keymetrics.io/), un gestionnaire de processus Node.js.

### Installation de PM2
```bash
npm install -g pm2
```

### Lancer l’application avec PM2
```bash
# Démarrer en mode production
pm run build
pm run start

# Lancer avec PM2
pm2 start ecosystem.config.cjs
```

### Commandes utiles PM2
- `pm2 status` : Voir l’état des processus
- `pm2 logs` : Voir les logs en temps réel
- `pm2 restart <nom|id>` : Redémarrer un service
- `pm2 stop <nom|id>` : Arrêter un service
- `pm2 delete <nom|id>` : Supprimer un service
- `pm2 save` : Sauvegarder la configuration pour redémarrage auto
- `pm2 startup` : Générer la commande pour démarrage automatique au boot

### Configuration PM2
Le fichier `ecosystem.config.cjs` est déjà fourni et prêt à l’emploi pour gérer l’application en mode production.

---

## Philosophie de code
- **Clean code** : code lisible, structuré, DRY, SRP.
- **Commentaires** : uniquement pour expliquer une logique complexe ou un choix technique non trivial.
- **Tests** : privilégier la robustesse et la couverture des cas métier.
- **Sécurité** : attention aux données sensibles, validation systématique.

---

## Support
Pour toute question ou problème, contactez l’équipe de développement Ecodeli.

---

## Licence
Projet privé, propriété de Johan LEDOUX.
