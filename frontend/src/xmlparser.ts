export const nodexml  = `
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



export const reactxml = `<boltArtifact id=\"project-import\" title=\"Project Files\"><boltAction type=\"file\" filePath=\"eslint.config.js\">import js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport tseslint from 'typescript-eslint';\n\nexport default tseslint.config(\n  { ignores: ['dist'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n    files: ['**/*.{ts,tsx}'],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n    },\n    plugins: {\n      'react-hooks': reactHooks,\n      'react-refresh': reactRefresh,\n    },\n    rules: {\n      ...reactHooks.configs.recommended.rules,\n      'react-refresh/only-export-components': [\n        'warn',\n        { allowConstantExport: true },\n      ],\n    },\n  }\n);\n</boltAction><boltAction type=\"file\" filePath=\"index.html\"><!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n</boltAction><boltAction type=\"file\" filePath=\"package.json\">{\n  \"name\": \"vite-react-typescript-starter\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"lint\": \"eslint .\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"lucide-react\": \"^0.344.0\",\n    \"react\": \"^18.3.1\",\n    \"react-dom\": \"^18.3.1\"\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^9.9.1\",\n    \"@types/react\": \"^18.3.5\",\n    \"@types/react-dom\": \"^18.3.0\",\n    \"@vitejs/plugin-react\": \"^4.3.1\",\n    \"autoprefixer\": \"^10.4.18\",\n    \"eslint\": \"^9.9.1\",\n    \"eslint-plugin-react-hooks\": \"^5.1.0-rc.0\",\n    \"eslint-plugin-react-refresh\": \"^0.4.11\",\n    \"globals\": \"^15.9.0\",\n    \"postcss\": \"^8.4.35\",\n    \"tailwindcss\": \"^3.4.1\",\n    \"typescript\": \"^5.5.3\",\n    \"typescript-eslint\": \"^8.3.0\",\n    \"vite\": \"^5.4.2\"\n  }\n}\n</boltAction><boltAction type=\"file\" filePath=\"postcss.config.js\">export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n</boltAction><boltAction type=\"file\" filePath=\"tailwind.config.js\">/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n</boltAction><boltAction type=\"file\" filePath=\"tsconfig.app.json\">{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\",\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"src\"]\n}\n</boltAction><boltAction type=\"file\" filePath=\"tsconfig.json\">{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./tsconfig.app.json\" },\n    { \"path\": \"./tsconfig.node.json\" }\n  ]\n}\n</boltAction><boltAction type=\"file\" filePath=\"tsconfig.node.json\">{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"lib\": [\"ES2023\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"vite.config.ts\"]\n}\n</boltAction><boltAction type=\"file\" filePath=\"vite.config.ts\">import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  optimizeDeps: {\n    exclude: ['lucide-react'],\n  },\n});\n</boltAction><boltAction type=\"file\" filePath=\"src/App.tsx\">import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100 flex items-center justify-center\">\n      <p>Start prompting (or editing) to see magic happen :)</p>\n    </div>\n  );\n}\n\nexport default App;\n</boltAction><boltAction type=\"file\" filePath=\"src/index.css\">@tailwind base;\n@tailwind components;\n@tailwind utilities;\n</boltAction><boltAction type=\"file\" filePath=\"src/main.tsx\">import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n</boltAction><boltAction type=\"file\" filePath=\"src/vite-env.d.ts\">/// <reference types=\"vite/client\" />\n</boltAction></boltArtifact>`












import { StepType } from "./types/artifact";
import {Step} from "./types/artifact" 
import { Project } from "./types/artifact";


  
function cleanXMLString(input: string): string {
    // Handle template literals
    let cleaned = input.trim();
    if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Remove export declarations
    cleaned = cleaned.replace(/export const \w+ = /, '');
    
    // Escape HTML content
    cleaned = cleaned.replace(/<!doctype\s+html>/gi, '&lt;!doctype html&gt;');
    
    // Handle CDATA sections for HTML content
    cleaned = cleaned.replace(
      /(<boltAction[^>]*>)([\s\S]*?)(<\/boltAction>)/g,
      (match, openTag, content, closeTag) => {
        // Only wrap in CDATA if content contains HTML-like syntax
        if (content.includes('<') || content.includes('>')) {
          return `${openTag}<![CDATA[${content}]]>${closeTag}`;
        }
        return match;
      }
    );
    
    // Unescape special characters
    cleaned = cleaned.replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n');
    
    return cleaned;
  }
  
  function unescapeContent(content: string): string {
    return content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
  
  let stepIdCounter = 0;
  
  export function parseTemplateToProject(xmlString: string, prompt: string): Project {
    try {
      // Reset counter
      stepIdCounter = 0;
      
      // Clean input
      const cleanedXml = cleanXMLString(xmlString);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedXml, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent || 'XML parsing error');
      }
      
      // Get all boltAction elements
      const actions = Array.from(doc.getElementsByTagName('boltAction'));
      
      // Track folders and steps
      const folders = new Set<string>();
      const steps: Step[] = [];
      
      // Process actions
      actions.forEach(action => {
        const type = action.getAttribute('type');
        const filePath = action.getAttribute('filePath');
        
        // Handle folder creation for files
        if (type === 'file' && filePath) {
          const pathParts = filePath.split('/');
          if (pathParts.length > 1) {
            let currentPath = '';
            pathParts.slice(0, -1).forEach(part => {
              currentPath = currentPath ? `${currentPath}/${part}` : part;
              if (!folders.has(currentPath)) {
                folders.add(currentPath);
                steps.push({
                  id: ++stepIdCounter,
                  title: currentPath,
                  status: 'waiting',
                  type: StepType.CreateFolder
                });
              }
            });
          }
          
          // Get content and handle CDATA sections
          let content = action.textContent || '';
          if (content.includes('CDATA')) {
            content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
          }
          
          // Add file step
          steps.push({
            id: ++stepIdCounter,
            title: filePath,
            status: 'waiting',
            type: StepType.CreateFile,
            code: unescapeContent(content)
          });
        } else if (type === 'shell') {
          // Add shell command step
          steps.push({
            id: ++stepIdCounter,
            title: `Run: ${action.textContent?.trim() || ''}`,
            status: 'waiting',
            type: StepType.RunScript,
            code: action.textContent?.trim() || ''
          });
        }
      });
      
      if (steps.length === 0) {
        throw new Error('No valid steps found in template');
      }
      
      return {
        prompt,
        steps
      };
      
    } catch (error) {
      console.error('Error parsing template:', error);
      return {
        prompt,
        steps: [],
        error: error instanceof Error ? error.message : 'Unknown error parsing template'
      };
    }
  }
  
  // Test helper
  export function validateXML(xmlString: string): boolean {
    try {
      const cleaned = cleanXMLString(xmlString);
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/xml');
      return !doc.querySelector('parsererror');
    } catch {
      return false;
    }
  }

const project = parseTemplateToProject(reactxml , "create a react web")
console.log(JSON.stringify(project, null, 2));
  
  // Example usage:
  /*
  const xml = `
  <boltArtifact id="node-express-template" title="Node.js + Express Project Template">
    <boltAction type="file" filePath="tsconfig.json">
      {
        "compilerOptions": {
          "target": "ES2020"
        }
      }
    </boltAction>
    <boltAction type="shell">
      npm install
    </boltAction>
  </boltArtifact>
  `;
  
  const project = parseTemplateToProject(xml, "Create a Node.js Express project");
  console.log(JSON.stringify(project, null, 2));
  */