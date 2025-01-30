    // {
    //   name: 'public',
    //   type: 'directory',
    //   path: '/public',
    //   children: [
    //     {
    //       name: 'index.html',
    //       type: 'file',
    //       path: '/public/index.html',
    //       content: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>React App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>',
    //       language: 'html'
    //     },
    //     {
    //       name: 'favicon.ico',
    //       type: 'file',
    //       path: '/public/favicon.ico',
    //       content: '// Binary content',
    //       language: 'binary'
    //     }
    //   ]
    // },
    // {
    //   name: 'src',
    //   type: 'directory',
    //   path: '/src',
    //   children: [
    //     {
    //       name: 'components',
    //       type: 'directory',
    //       path: '/src/components',
    //       children: [
    //         {
    //           name: 'Header',
    //           type: 'directory',
    //           path: '/src/components/Header',
    //           children: [
    //             {
    //               name: 'Header.tsx',
    //               type: 'file',
    //               path: '/src/components/Header/Header.tsx',
    //               content: 'import React from "react";\n\nexport const Header: React.FC = () => {\n  return (\n    <header className="app-header">\n      <h1>My React App</h1>\n    </header>\n  );\n};',
    //               language: 'typescript'
    //             },
    //             {
    //               name: 'Header.css',
    //               type: 'file',
    //               path: '/src/components/Header/Header.css',
    //               content: '.app-header {\n  background: #282c34;\n  padding: 20px;\n  color: white;\n}',
    //               language: 'css'
    //             }
    //           ]
    //         },
    //         {
    //           name: 'Footer',
    //           type: 'directory',
    //           path: '/src/components/Footer',
    //           children: [
    //             {
    //               name: 'Footer.tsx',
    //               type: 'file',
    //               path: '/src/components/Footer/Footer.tsx',
    //               content: 'import React from "react";\n\nexport const Footer: React.FC = () => {\n  return (\n    <footer className="app-footer">\n      <p>&copy; 2025 My App</p>\n    </footer>\n  );\n};',
    //               language: 'typescript'
    //             },
    //             {
    //               name: 'Footer.css',
    //               type: 'file',
    //               path: '/src/components/Footer/Footer.css',
    //               content: '.app-footer {\n  background: #20232a;\n  padding: 15px;\n  color: white;\n}',
    //               language: 'css'
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       name: 'styles',
    //       type: 'directory',
    //       path: '/src/styles',
    //       children: [
    //         {
    //           name: 'global.css',
    //           type: 'file',
    //           path: '/src/styles/global.css',
    //           content: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, system-ui, sans-serif;\n}',
    //           language: 'css'
    //         },
    //         {
    //           name: 'variables.css',
    //           type: 'file',
    //           path: '/src/styles/variables.css',
    //           content: ':root {\n  --primary-color: #61dafb;\n  --secondary-color: #282c34;\n  --text-color: #333;\n}',
    //           language: 'css'
    //         }
    //       ]
    //     },
    //     {
    //       name: 'App.tsx',
    //       type: 'file',
    //       path: '/src/App.tsx',
    //       content: 'import React from "react";\nimport { Header } from "./components/Header/Header";\nimport { Footer } from "./components/Footer/Footer";\nimport "./styles/global.css";\n\nexport default function App() {\n  return (\n    <div className="app">\n      <Header />\n      <main>\n        <h2>Welcome to my React app!</h2>\n      </main>\n      <Footer />\n    </div>\n  );\n}',
    //       language: 'typescript'
    //     },
    //     {
    //       name: 'index.tsx',
    //       type: 'file',
    //       path: '/src/index.tsx',
    //       content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById("root")\n);',
    //       language: 'typescript'
    //     }
    //   ]
    // },
    // {
    //   name: 'package.json',
    //   type: 'file',
    //   path: '/package.json',
    //   content: '{\n  "name": "my-react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "typescript": "^4.9.5"\n  }\n}',
    //   language: 'json'
    // },
    // {
    //   name: 'tsconfig.json',
    //   type: 'file',
    //   path: '/tsconfig.json',
    //   content: '{\n  "compilerOptions": {\n    "target": "es5",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "esModuleInterop": true,\n    "allowSyntheticDefaultImports": true,\n    "strict": true,\n    "forceConsistentCasingInFileNames": true,\n    "module": "esnext",\n    "moduleResolution": "node",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "jsx": "react-jsx"\n  },\n  "include": ["src"]\n}',
    //   language: 'json'
    // }