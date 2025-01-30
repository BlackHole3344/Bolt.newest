



import React, { useState, useEffect , useRef} from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Play, X, Moon, Sun, ChevronRight } from 'lucide-react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { parseTemplateToProject } from '../xmlparser';
import { Step, StepType } from '../types/artifact';
import { Folder, FileCode2, FileType, FileText } from 'lucide-react';

  

interface FileContent {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  children?: FileSystemItem[];
  content?: string;
  language?: string;
  path: string;
}

interface TabItem {
  file: FileContent;
  id: string;
}





interface FileExplorerProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileContent) => void;
}

// File Explorer Component
const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, onFileSelect }) : JSX.Element => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderItem = (item: FileSystemItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const paddingLeft = level * 16;

    if (item.type === 'directory') {
      return (
        <div key={item.path}>
          <div
            onClick={() => toggleFolder(item.path)}
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <ChevronRight
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            />
            <Folder className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
          </div>
          {isExpanded && item.children && (
            <div>
              {item.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        onClick={() => item.content && item.language && onFileSelect({
          name: item.name,
          content: item.content,
          language: item.language,
          path: item.path
        })}
        className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
        style={{ paddingLeft: `${paddingLeft + 24}px` }}
      >
        {item.name.endsWith('.jsx') || item.name.endsWith('.tsx') ? (
          <FileCode2 className="w-4 h-4 text-blue-500" />
        ) : item.name.endsWith('.css') ? (
          <FileType className="w-4 h-4 text-purple-500" />
        ) : (
          <FileText className="w-4 h-4 text-gray-500" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
        Files
      </div>
      <div className="space-y-1">
        {fileSystem.map(item => renderItem(item))}
      </div>
    </div>
  );
};

// Tab Bar Component
const TabBar: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}> = ({ tabs, activeTab, onTabClick, onTabClose }) => {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <span onClick={() => onTabClick(tab.id)}>{tab.file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function WorkspacePage() {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');
  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const initialPrompt = location.state?.prompt || 'No prompt provided';
  const [steps , setSteps] = useState<Step[]>([]);


  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
  ]);




  const updateStepStatus = (filePath: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        // Only update status for file-related operations
        if (
          `/${step.title}` === filePath && 
          step.status !== "completed" &&
          (step.type === StepType.CreateFile || step.type === StepType.EditFile)
        ) {
          return { ...step, status: "completed" };
        }
        return step;
      })
    );
  };

  const findFileInSystem = (items: FileSystemItem[], targetPath: string): FileSystemItem | undefined => {
    for (const item of items) {
      if (item.path === targetPath) return item;
      if (item.children) {
        const found = findFileInSystem(item.children, targetPath);
        if (found) return found;
      }
    }
    return undefined
  };
  
  const getHTMLContent = () => {
    if (activeView !== 'preview') return '';
    const indexHTML = findFileInSystem(fileSystem, '/public/index.html');
    return indexHTML?.content || '';
  };

  const handleFileSelect = (file: FileContent) => {
    setActiveView('code');
    
    // Update step status when file is opened
    updateStepStatus(file.path);
    
    const existingTab = openTabs.find(tab => tab.file.path === file.path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { file, id: `tab-${Date.now()}` };
      setOpenTabs([...openTabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleTabClose = (tabId: string) => {
    setOpenTabs(openTabs.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(openTabs[openTabs.length - 2]?.id || null);
    }
  };

  const updateFileContent = (path: string, newContent: string) => {
    setFileSystem(prev => {
      const updateFileInTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === path) {
            return { ...item, content: newContent };
          }
          if (item.type === 'directory' && item.children) {
            return {
              ...item,
              children: updateFileInTree(item.children)
            };
          }
          return item;
        });
      };
      
      return updateFileInTree(prev);
    });
  };

  const handleEditorChange = (value: string | undefined, tabId: string) => {
    if (!value) return;
    
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, file: { ...tab.file, content: value } }
          : tab
      )
    );
  
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      updateFileContent(tab.file.path, value);
      // Update step status when file is edited
      updateStepStatus(tab.file.path);
    }
  };

    // Update the file content in the fileSystem



  const init = async ()  => {

    try {
    const response = await axios.post(`http://localhost:3000/test`, { messages: initialPrompt.trim()})
    console.log("request")
    if(!response) {
      console.log("no response")
    } 

    const {message} = response.data;
    console.log(parseTemplateToProject(message)) 
    setSteps(parseTemplateToProject(message).steps.map((x : Step) => ({
      ...x , 
      status : "loading"
    }) ))

    } catch(error){
      console.error("error : " , error) 
      throw error 
    }

  }

  useEffect(() => {
    // Only process if we have steps
    if (!steps.length) return;
  
    const updateFileSystem = async () => {
      setFileSystem(prevFileSystem => {
        const newFileSystem = [...prevFileSystem];
         // created a shallow copy of a array(step)
        
         const addToDirectory = (item: FileSystemItem, parentPath: string = '') => {
          const pathParts = item.path.split('/').filter(Boolean);
          let currentPath = '';
          let currentSystem = newFileSystem;
  
          // Navigate through path parts to find/create parent directories
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath += '/' + pathParts[i];
            let dir = findFileInSystem(newFileSystem, currentPath);
  
            if (!dir) {
              // Create missing directory
              dir = {
                name: pathParts[i],
                type: 'directory',
                path: currentPath,
                children: []
              };
              currentSystem.push(dir);
            }
  
            if (dir.type === 'directory') {
              currentSystem = dir.children || [];
              dir.children = currentSystem;
            }
          }
  
          // Add the actual item to its parent directory
          if (pathParts.length > 1) {
            currentSystem.push(item);
          } else {
            // Root level items
            newFileSystem.push(item);
          }
        };

        steps.forEach(step => {

          if (step.status === "waiting" || step.status === "loading") { 

          let newItem: FileSystemItem  ; 


          switch (step.type) {

            case StepType.CreateFile: 
             newItem = {
                name: step.title,
                type: "file",
                path: `/${step.title}`, 
                content: step.code || '',
                language: step.title.endsWith('.js') ? 'javascript' 
                  : step.title.endsWith('.ts') ? 'typescript'
                  : step.title.endsWith('.css') ? 'css'
                  : step.title.endsWith('.html') ? 'html'
                  : 'plaintext'
              };
              if (!findFileInSystem(newFileSystem, newItem.path)) {
                addToDirectory(newItem);
              }
              break;

 
            case StepType.CreateFolder: 
                newItem = {
                  name: step.title,
                  type: "directory",
                  path: `/${step.title}`, // You might want to adjust the path based on your needs
                  children: []
                };
                if (!findFileInSystem(newFileSystem, newItem.path)) {
                  addToDirectory(newItem);
                }
                break;


            ////issue here 
            case StepType.EditFile:
              const existingFile = findFileInSystem(newFileSystem ,`/${step.title}`); 
              if (existingFile && existingFile.type === 'file') {
                existingFile.content = step.code || existingFile.content; /// overwrites the code inside file 
                return newFileSystem ; 
              }

              return newFileSystem 
            
            case StepType.DeleteFile : 
              const pathParts = step.title.split('/').filter(Boolean);
              if (pathParts.length > 1) {
                const parentPath = '/' + pathParts.slice(0, -1).join('/');
                const parentDir = findFileInSystem(newFileSystem, parentPath);
                if (parentDir && parentDir.type === 'directory' && parentDir.children) {
                  parentDir.children = parentDir.children.filter(
                    child => child.path !== `/${step.title}`
                  );
                }
              } else {
                const fileIndex = newFileSystem.findIndex(
                  item => item.path === `/${step.title}`
                );
                if (fileIndex !== -1) {
                  newFileSystem.splice(fileIndex, 1);
                }
              }
              break;
            case StepType.RunScript : 
                return newFileSystem ;    

            default : 
              return newFileSystem
          
            };
  
            // Check if file already exists
            // if (
            //   (step.type === StepType.CreateFile || step.type === StepType.CreateFolder) &&
            //   !findFileInSystem(newFileSystem, newItem.path)
            // ) {
            //   newFileSystem.push(newItem);
            // }
          }
        });
  
        return newFileSystem;
      });
    };

    updateFileSystem();

    console.log(fileSystem)
  }, [steps]);

  useEffect(() => {
    init() 
  },[]);
  

  const StatusIcon = ({ status } :  { status: "loading" | "waiting" | "completed" }) => {
    if (status === 'loading') {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (status === 'completed') {
      return <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>;
    }
    return <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />;
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
      <Panel defaultSize={25} minSize={20}>
        <div className="h-full bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/30 flex flex-col transition-colors duration-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-6 h-6" />
              <span>Generation Progress</span>
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Prompt: {initialPrompt}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-5">
              {steps.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-700/40 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="mt-1">
                    <StatusIcon status={message.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                      {message.title}
                    </p>
                    {message.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {message.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-6 mt-auto border-t border-gray-200 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base font-medium shadow-sm"
              />
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-colors duration-200">
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </Panel>
      <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />

    {/* File Explorer Panel */}
    <Panel defaultSize={20} minSize={15}>
          <div className="h-full bg-gray-50 dark:bg-gray-800/60 border-r border-gray-200 dark:border-gray-700/30">
            <FileExplorer fileSystem={fileSystem} onFileSelect={handleFileSelect} />
          </div>
        </Panel>
        
        <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />
        
        {/* Editor/Preview Panel */}
        <Panel defaultSize={55}>
          <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            {/* View Toggle */}
            <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveView('code')}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  activeView === 'code'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-4 py-2 rounded-lg ${
                  activeView === 'preview'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Tab Bar */}
            <TabBar
              tabs={openTabs}
              activeTab={activeTabId || ''}
              onTabClick={setActiveTabId}
              onTabClose={handleTabClose}
            />

            {/* Editor/Preview Content */}
<div className="flex-1 overflow-hidden">
  {activeView === 'code' ? (
    activeTabId ? (
      <Editor
        height="100%"
        theme={isDark ? 'vs-dark' : 'light'}
        language={openTabs.find(tab => tab.id === activeTabId)?.file.language}
        value={openTabs.find(tab => tab.id === activeTabId)?.file.content}
        onChange={(value) => handleEditorChange(value, activeTabId)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
        }}
      />
    ) : (
      <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a file to start editing
      </div>
    )
  ) : (
    <div className="h-full w-full bg-white dark:bg-gray-900">
      <iframe
        title="preview"
        className="w-full h-full border-none"
        srcDoc={getHTMLContent()}
      />
    </div>
  )}
</div>
  
          </div>
    
        </Panel>
  </PanelGroup>
</div>
  );
}
