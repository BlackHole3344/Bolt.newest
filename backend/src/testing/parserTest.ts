import { DOMParser } from 'xmldom';
import {cleanedChat , chat} from "./chatTemplate"
import { reactBasePrompt } from '../template/react';
export enum StepType {
    CreateFile, 
    CreateFolder,
    EditFile , 
    DeleteFile , 
    RunScript
}

export type FileType = StepType.CreateFile | StepType.CreateFolder;

export interface Step{
    id : number
    title : string , 
    status : "loading" | "waiting" | "completed" , 
    type : StepType  ,
    code? : string 
    description? : "null"
} 

export interface Project{
    prompt? : string , 
    steps : Step[] ,
    error? : string 
}


function cleanXMLString(input: string): string {
    // console.log("Original input:", input);
    
    // Handle template literals
    let cleaned = input.trim();
    // console.log("Trimmed input:", cleaned);
    
    if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.slice(1, -1);
    //   console.log("Removed template literals:", cleaned);
    }
    
    // Remove export declarations
    cleaned = cleaned.replace(/export const \w+ = /, '');
    // console.log("Removed export declarations:", cleaned);
    
    // Escape HTML content
    cleaned = cleaned.replace(/<!doctype\s+html>/gi, '&lt;!doctype html&gt;');
    // console.log("Escaped HTML content:", cleaned);
    
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
    // console.log("Handled CDATA sections:", cleaned);
    
    // Unescape special characters
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    // console.log("Unescaped special characters:", cleaned);
    
    return cleaned;
  }
  
  function unescapeContent(content: string): string {
    // console.log("Original content:", content);
    const unescaped = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    console.log("Unescaped content:", unescaped);
    return unescaped;
  }
  
  let stepIdCounter = 0;
  
  export function parseTemplateToProject(xmlString: string): Project {
    try {
      console.log("Starting parseTemplateToProject with input:");
      
      // Reset counter
      stepIdCounter = 0;
      
      // Clean input
      const cleanedXml = cleanXMLString(xmlString);
    //   console.log("Cleaned XML:", cleanedXml);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedXml, 'text/xml');
      console.log("Parsed XML document:", doc);
      
      // Check for parsing errors
      const parserError = doc.getElementsByTagName('parsererror')[0];
      if (parserError) {
        throw new Error(parserError.textContent || 'XML parsing error');
      }
      
      // Get all boltAction elements
      const actions = Array.from(doc.getElementsByTagName('boltAction'));
    //   console.log("Found boltAction elements:", actions);
      
      // Track folders and steps
      const folders = new Set<string>();
      const steps: Step[] = [];
      
      // Process actions
      actions.forEach(action => {
        const type = action.getAttribute('type');
        const filePath = action.getAttribute('filePath');
        console.log("Processing action:", { type, filePath });
        console.log(action)
        
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
                console.log("Added folder step:", currentPath);
              }
            });
          }
          
          // Get content and handle CDATA sections
          let content = action.textContent || '';
          if (content.includes('CDATA')) {
            content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
          }
          console.log("File content:", content);
          
          // Add file step
          steps.push({
            id: ++stepIdCounter,
            title: filePath,
            status: 'waiting',
            type: StepType.CreateFile,
            code: unescapeContent(content)
          });
          console.log("Added file step:", filePath);
        } else if (type === 'shell') {
          // Add shell command step
          steps.push({
            id: ++stepIdCounter,
            title: `Run: ${action.textContent?.trim() || ''}`,
            status: 'waiting',
            type: StepType.RunScript,
            code: action.textContent?.trim() || ''
          });
          console.log("Added shell command step:", action.textContent?.trim());
        }
      });
      
      if (steps.length === 0) {
        throw new Error('No valid steps found in template');
      }
      
    //   console.log("Final steps:", steps);
      return {
        steps
      };
      
    } catch (error) {
      console.error('Error parsing template:', error);
      return {
        steps: [],
        error: error instanceof Error ? error.message : 'Unknown error parsing template'
      };
    }
  }
  
  // Test helper
  export function validateXML(xmlString: string): boolean {
    try {
      console.log("Validating XML:", xmlString);
      const cleaned = cleanXMLString(xmlString);
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/xml');
      const isValid = !doc.querySelector('parsererror');
      console.log("XML is valid:", isValid);
      return isValid;
    } catch (error) {
      console.error("Error validating XML:", error);
      return false;
    }
  }


  function main () {
    const packt = parseTemplateToProject(reactBasePrompt)
    console.log(" : " , packt)
  }


  main() 




  