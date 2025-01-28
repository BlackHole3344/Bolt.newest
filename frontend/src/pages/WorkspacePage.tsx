import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {  MessageSquare, Play, X, Moon, Sun } from 'lucide-react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { 
  Folder, 
  FileCode2, 
  FileType, 
  FileJson, 
  FileText,
  ChevronRight ,
  Binary    // For compiled/binary files
} from 'lucide-react';

export interface stepsI {
  id: number;
  title : string 
  content: string
  status : "loading" | "waiting" | "completed"; 
}

  

interface FileContent {
  name: string;
  content: string;
}

export default function WorkspacePage() {
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'preview'>('files');
  const [activeView, setActiveView] = useState<'file' | 'preview'>('file');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const initialPrompt = location.state?.prompt || 'No prompt provided';
  const [steps , setMessages] = useState<stepsI[]>([
    { id: 1, title : " " , content: "Analyzing prompt...", status: "loading" },
    { id: 2, title : " " , content: "Generating code structure...", status: "waiting" },
    { id: 3, title : " " , content: "Implementing functionality...", status: "waiting" },
    { id: 4, title : " " ,content: "Optimizing and finalizing...", status: "waiting" }
  ]);


  const StatusIcon = ({ status }: { status: "loading" | "waiting" | "completed" }) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };



  const simulateProgress = () => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setMessages(prev => prev.map((msg, idx) => {
          if (idx === currentIndex) {
            return { ...msg, status: "completed" };
          } else if (idx === currentIndex + 1) {
            return { ...msg, status: "loading" };
          }
          return msg;
        }));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };


  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
      case 'css':
        return <FileCode2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'exe':
      case 'dll':
      case 'bin':
        return <Binary className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  

  const mockFiles = {
    'App.tsx': 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
    'main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(<App />);',
    'index.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleFileClick = (fileName: string) => {
    setSelectedFile({
      name: fileName,
      content: mockFiles[fileName as keyof typeof mockFiles]
    });
    setActiveView('file');
  };

  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      default:
        return 'typescript';
    }
  };


  const [inputMessage, setInputMessage] = useState("");

  return (



// Update the wrapper div and panels with these styles:
<div className="h-screen w-full bg-white dark:bg-[#0a0f1d]">
  <div className="absolute top-6 right-6 z-50">
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
    </button>
  </div>

  <PanelGroup direction="horizontal" className="h-full">
    {/* Chat Panel */}
    <Panel defaultSize={25} minSize={20}>
      <div className="h-full bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/30 flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700/30">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Generation Progress
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Prompt: {initialPrompt}
          </p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-5">
            {steps.map((message) => (
              <div
                key={message.id}
                className="flex items-start space-x-4 text-gray-900 dark:text-white"
              >
                <MessageSquare className="w-6 h-6 mt-1" />
                <div className="flex-1">
                  <p className="text-base font-medium">{message.content}</p>
                </div>
                <StatusIcon status={message.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input Box */}
        <div className="p-6 mt-auto border-t border-gray-200 dark:border-gray-700/30">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base font-medium"
            />
            <button
              onClick={simulateProgress}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </Panel>

    <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />

    {/* File Explorer Panel */}
    <Panel defaultSize={20} minSize={15}>
  <div className="h-full bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/30 flex flex-col">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700/30">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-3 px-4 rounded-lg text-base font-semibold transition-colors duration-200 ${
            activeTab === 'files'
              ? 'bg-white dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-300 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
          }`}
        >
          <Folder className="w-5 h-5 inline-block mr-2 text-blue-500 dark:text-blue-400" />
          Files
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-auto p-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-2 text-base font-semibold text-gray-700 dark:text-gray-300">
          <ChevronRight className="w-4 h-4" />
          <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>src</span>
        </div>
        
        <div className="ml-6 space-y-1">
          {Object.keys(mockFiles).map((fileName) => (
            <div
              key={fileName}
              onClick={() => handleFileClick(fileName)}
              className="flex items-center space-x-2 text-base text-gray-900 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 p-2 rounded-lg cursor-pointer transition-colors duration-200 font-medium group"
            >
              <div className="w-5 flex items-center group-hover:scale-110 transition-transform duration-200">
                {getFileIcon(fileName)}
              </div>
              <span>{fileName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</Panel>

    <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />

    {/* Main Content Panel */}
    <Panel defaultSize={55} minSize={30}>
      <div className="h-full flex flex-col bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xl">
        <div className="border-b border-gray-200 dark:border-gray-700/30">
          <div className="flex p-3 gap-3">
            {selectedFile && (
              <div className="flex items-center">
                <button
                  onClick={() => setActiveView('file')}
                  className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors duration-200 font-semibold ${
                    activeView === 'file'
                      ? 'bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {selectedFile.name}
                </button>
                {activeView === 'file' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setActiveView('preview')}
              className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors duration-200 font-semibold ${
                activeView === 'preview'
                  ? 'bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <Play className="w-5 h-5 mr-2" />
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeView === 'file' && selectedFile ? (
            <div className="p-6">
              <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/30 overflow-hidden">
                <CodeEditor
                  value={selectedFile.content}
                  language={getLanguage(selectedFile.name)}
                  placeholder="Please enter code."
                  padding={24}
                  style={{
                    fontSize: '15px',
                    backgroundColor: isDark ? '#1a1b26' : '#ffffff',
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
                  }}
                  className="min-h-[300px]"
                />
              </div>
            </div>
          ) : activeView === 'preview' ? (
            <div className="h-full flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-400">
              Preview will appear here
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-400">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </Panel>
  </PanelGroup>
</div>
  );
}