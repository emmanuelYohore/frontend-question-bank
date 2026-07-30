# frontend-question-bank

Description
-----------

Frontend de l'application "Question Bank" développé avec Vite + Vue 3 et TypeScript. L'interface permet la gestion des banques de questions, la création et la diffusion d'enquêtes, la consultation et la saisie de réponses.


Structure du projet
-------------------

- `web-app/` : application Vue (Vite)
	- `src/` : code source
		- `components/` : composants réutilisables (ex. `NavigationBar.vue`, `LoginForm.vue`, `CreateEnqueteForm.vue`)
		- `modals/` : modals réutilisables (popups d'édition, confirmations)
		- `pages/` : vues liées aux routes (ex. `HomePage.vue`, `AdminGestionBanksPage.vue`, `CreateItemPage.vue`)
		- `router/` : configuration des routes (`routes.ts`)
		- `stores/` : état global (`auth.ts`, `popup.ts`)
		- `config/` : configuration API (`api.ts`)
		- `assets/` : css et images
	- `public/` : fichiers statiques
	- `index.html` : point d'entrée

Principales technologies
-----------------------

- Vue 3
- TypeScript
- Vite (dev server, build)
- Pinia ou Vuex (store global) — selon configuration

Composants clés
------------------------

- `NavigationBar.vue` — barre de navigation et accès aux pages
- `LoginForm.vue`, `RegisterForm.vue`, `ForgotPasswordPage.vue` — auth
- `CreateEnqueteForm.vue`, `CreateItemForm.vue`, `CreateBankItemForm.vue` — formulaires CRUD
- `EnqueteDetail.vue`, `ItemDetail.vue`, `BankItemDetail.vue` — affichage détaillé
- `MyEnquetesPage.vue`, `MyItemsPage.vue` — vues utilisateur
- Modals : gestion des popups d'ajout / mise à jour / confirmation

Router & pages
---------------

- Les routes sont définies dans `src/router/routes.ts`.
- Les pages correspondent aux composants de `src/pages` et utilisent le route guard pour les pages nécessitant l'auth.

Stores (état)
-------------

- `src/stores/auth.ts` — gère l'authentification, token, utilisateur courant, login/logout
- `src/stores/popup.ts` — gestion des états des modals/popups

Configuration API
-----------------

Le fichier `src/config/api.ts` centralise la configuration des appels API. Par défaut, l'URL de base est fournie par la variable d'environnement `VITE_API_URL`.

Prérequis
---------

- Node.js 16+
- npm, yarn ou pnpm

Installation & développement
---------------------------

Se placer dans le dossier `web-app`, installer et lancer le serveur de développement :

```bash
cd web-app
# installer dépendances
npm install

# démarrer le serveur dev
npm run dev
```

L'URL de développement est fournie par Vite (par défaut `http://localhost:5173`).

Scripts utiles (dans `web-app/package.json`)
-----------------------------------------

- `dev` — démarre Vite en mode développement
- `build` — build de production (génère `dist/`)
- `preview` — sert le build localement

Variables d'environnement importantes
-----------------------------------

- `VITE_API_URL` — URL de base pour les requêtes vers le backend
- `VITE_APP_NAME` — nom de l'application (optionnel)

Architecture fonctionnelle & flux
--------------------------------

- L'utilisateur effectue une action (ex. créer une enquête) via un formulaire Reactif
- Le composant appelle les services API (centralisés dans `config/api.ts`)
- Les réponses modifient les `stores` (auth, données locales) et les vues se mettent à jour

Build & déploiement
-------------------

- `npm run build` produit un dossier `dist/` à déployer sur un hébergeur statique 

Débogage & logs
---------------

- Utilisez la console et les outils Vue Devtools pour inspecter l'état et les stores.

