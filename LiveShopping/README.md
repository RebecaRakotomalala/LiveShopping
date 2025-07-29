ShopLiveApp/
├── android/                  # Projet Android natif
├── ios/                      # Projet iOS natif
├── assets/                   # Images, polices, icônes, sons, vidéos
│   ├── fonts/
│   ├── images/
├── src/                      # Code source de l'application
│   ├── api/                  # Appels API (Axios, endpoints Symfony)
│   ├── components/           # Composants réutilisables
│   ├── constants/            # Constantes (couleurs, tailles, thèmes)
│   ├── contexts/             # Contexte global (ex: AuthContext)
│   ├── hooks/                # Hooks personnalisés
│   ├── navigation/           # Stack, Tab, Drawer Navigation
│   ├── redux/                # Store Redux, slices
│   ├── screens/              # Pages (écrans : Login, Home, etc.)
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Product/
│   │   ├── LiveStream/
│   │   └── Profile/
│   ├── services/             # Services (auth, live, etc.)
│   ├── utils/                # Fonctions utilitaires
│   ├── types/                # Types TypeScript (si applicable)
│   └── App.tsx               # Point d'entrée
├── .env                      # Variables d'environnement
├── .eslintrc.js              # Configuration ESLint
├── .prettierrc               # Configuration Prettier
├── babel.config.js
├── index.js
├── metro.config.js
└── package.json
