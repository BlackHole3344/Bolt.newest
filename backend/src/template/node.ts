




export const nodeBaseprompt  = `
<boltArtifact id="node-express-template" title="Node.js + Express Project Template">
  <boltAction type="file" filePath="package.json">
{
  "name": "node-express-starter",
  "version": "1.0.0",
  "description": "A starter template for Node.js and Express applications",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "lint": "eslint .",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "eslint": "^9.9.1",
    "nodemon": "^3.1.0",
    "jest": "^29.7.0",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "typescript": "^5.5.3"
  }
}
  </boltAction>

  <boltAction type="file" filePath=".eslintrc.json">
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
  </boltAction>

  <boltAction type="file" filePath="tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
  </boltAction>

  <boltAction type="file" filePath="src/index.ts">
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000);
});

  </boltAction>

  <boltAction type="file" filePath=".env">
PORT=3000
  </boltAction>

  <boltAction type="file" filePath=".gitignore">
node_modules/
dist/
.env
  </boltAction>

  <boltAction type="file" filePath="README.md">
# Node.js + Express Starter

This is a starter template for building Node.js and Express applications.

## Getting Started

1. Clone the repository.
2. Run "npm install" to install dependencies.
3. Run "npm run dev" to start the development server.

## Scripts

- "npm start": Start the production server.
- "npm run dev": Start the development server with nodemon.
- "npm run lint": Run ESLint to check for code issues.
- "npm test": Run tests using Jest.
  </boltAction>

  <boltAction type="shell">
    npm install
  </boltAction>

  <boltAction type="shell">
    npm run dev
  </boltAction>
</boltArtifact>`

