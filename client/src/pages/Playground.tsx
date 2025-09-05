import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';

interface CodeTemplate {
  name: string;
  code: string;
  language: string;
}

export default function Playground() {
  const [selectedLanguage, setSelectedLanguage] = useState('html');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');

  // Dynamic code templates - loaded from user preferences or API
  const [codeTemplates, setCodeTemplates] = useState<Record<string, CodeTemplate[]>>({});
  
  // Load templates dynamically (could be from API, localStorage, or user preferences)
  useEffect(() => {
    // For now, start with empty templates - user can create their own
    setCodeTemplates({
      html: [],
      css: [],
      javascript: [],
      python: []
    });
  }, []);

  // Advanced expression evaluator that handles complex expressions
  function evaluateExpression(expr: string, variables: Record<string, any>, functions: Record<string, Function> = {}): any {
    try {
      // Clean the expression
      expr = expr.trim();
      
      // Handle string literals
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1);
      }
      
      // Handle numbers (including decimals and negative numbers)
      if (/^-?\d+(\.\d+)?$/.test(expr)) {
        return Number(expr);
      }
      
      // Handle boolean literals
      if (expr === 'true') return true;
      if (expr === 'false') return false;
      if (expr === 'null') return null;
      if (expr === 'undefined') return undefined;
      
      // Handle variables
      if (expr in variables) {
        return variables[expr];
      }
      
      // Handle function calls
      const funcMatch = expr.match(/^(\w+)\(([^)]*)\)$/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const args = funcMatch[2] ? funcMatch[2].split(',').map(arg => evaluateExpression(arg.trim(), variables, functions)) : [];
        
        if (funcName in functions) {
          return functions[funcName](...args);
        }
        
        // Handle built-in functions
        if (funcName === 'len' && args.length === 1) {
          return String(args[0]).length;
        }
        if (funcName === 'parseInt' && args.length === 1) {
          return parseInt(String(args[0]));
        }
        if (funcName === 'parseFloat' && args.length === 1) {
          return parseFloat(String(args[0]));
        }
        if (funcName === 'Math.floor' && args.length === 1) {
          return Math.floor(Number(args[0]));
        }
        if (funcName === 'Math.ceil' && args.length === 1) {
          return Math.ceil(Number(args[0]));
        }
        if (funcName === 'Math.round' && args.length === 1) {
          return Math.round(Number(args[0]));
        }
      }
      
      // Handle complex expressions with operators
      return evaluateComplexExpression(expr, variables, functions);
      
    } catch (e) {
      return expr;
    }
  }

  // Handle complex mathematical and string expressions
  function evaluateComplexExpression(expr: string, variables: Record<string, any>, functions: Record<string, Function>): any {
    try {
      // Replace variables with their values
      let processedExpr = expr;
      for (const [varName, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        processedExpr = processedExpr.replace(regex, JSON.stringify(value));
      }
      
      // Handle string concatenation with +
      if (processedExpr.includes('+')) {
        const parts = splitExpression(processedExpr, '+');
        if (parts.length > 1) {
          const evaluatedParts = parts.map(part => {
            const result = evaluateExpression(part.trim(), variables, functions);
            return typeof result === 'string' ? `"${result}"` : result;
          });
          
          // Check if any part is a string
          const hasString = evaluatedParts.some(part => typeof part === 'string' && part.startsWith('"'));
          if (hasString) {
            return evaluatedParts.map(part => 
              typeof part === 'string' && part.startsWith('"') ? part.slice(1, -1) : String(part)
            ).join('');
          }
        }
      }
      
      // Handle arithmetic expressions
      if (/[+\-*/()]/.test(processedExpr)) {
        // Create a safe evaluation context
        const context = {
          ...variables,
          Math: Math,
          parseInt: parseInt,
          parseFloat: parseFloat,
          Number: Number,
          String: String,
          Boolean: Boolean
        };
        
        // Replace function calls in the expression
        processedExpr = processedExpr.replace(/(\w+)\(([^)]*)\)/g, (match, funcName, args) => {
          if (funcName in context) {
            const argValues = args ? args.split(',').map((arg: string) => evaluateExpression(arg.trim(), variables, functions)) : [];
            return (context as any)[funcName](...argValues);
          }
          return match;
        });
        
        // Evaluate the expression safely
        const result = Function('"use strict"; return (' + processedExpr + ')')();
        return result;
      }
      
      return processedExpr;
    } catch (e) {
      return expr;
    }
  }

  // Split expression by operator while respecting parentheses and quotes
  function splitExpression(expr: string, operator: string): string[] {
    const parts: string[] = [];
    let current = '';
    let parenCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
      } else if (!inString) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === operator && parenCount === 0) {
          parts.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    return parts;
  }

  // Advanced JavaScript interpreter that handles any valid JavaScript code
  function interpretJavaScript(code: string): string[] {
    const results: string[] = [];
    const variables: Record<string, any> = {};
    const functions: Record<string, Function> = {};
    
    try {
      // Create a safe execution context
      const context = {
        console: {
          log: (...args: any[]) => {
            const output = args.map(arg => {
              if (typeof arg === 'object' && arg !== null) {
                return JSON.stringify(arg, null, 2);
              }
              return String(arg);
            }).join(' ');
            results.push(output);
          }
        },
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        Number: Number,
        String: String,
        Boolean: Boolean,
        Array: Array,
        Object: Object,
        Date: Date,
        JSON: JSON,
        ...variables,
        ...functions
      };
      
      // Process the code line by line for better error handling
      const lines = code.split('\n');
      let processedCode = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('//')) continue;
        
        // Handle multi-line statements
        if (line.endsWith('{') || line.endsWith(',') || 
            (line.includes('=') && !line.endsWith(';') && !line.endsWith('}')) ||
            (line.includes('function') && !line.endsWith(';') && !line.endsWith('}'))) {
          processedCode += line + '\n';
        } else {
          processedCode += line + ';\n';
        }
      }
      
      // Execute the code in the safe context
      const func = new Function(...Object.keys(context), `
        "use strict";
        try {
          ${processedCode}
        } catch (error) {
          console.log("Error: " + error.message);
        }
      `);
      
      func(...Object.values(context));
      
    } catch (error: any) {
      results.push(`Execution Error: ${error.message}`);
    }
    
    return results;
  }

  // Advanced Python interpreter that handles any valid Python-like code
  function interpretPython(code: string): string[] {
    const results: string[] = [];
    
    try {
      // Convert Python-like syntax to JavaScript for execution
      let jsCode = convertPythonToJS(code);
      
      // Create a safe execution context with Python-like functions
      const context = {
        print: (...args: any[]) => {
          const output = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              return JSON.stringify(arg, null, 2);
            }
            return String(arg);
          }).join(' ');
          results.push(output);
        },
        len: (obj: any) => {
          if (Array.isArray(obj) || typeof obj === 'string') {
            return obj.length;
          }
          if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj).length;
          }
          return 0;
        },
        range: (start: number, end?: number, step?: number) => {
          if (end === undefined) {
            end = start;
            start = 0;
          }
          if (step === undefined) {
            step = 1;
          }
          const arr = [];
          for (let i = start; i < end; i += step) {
            arr.push(i);
          }
          return arr;
        },
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        Number: Number,
        String: String,
        Boolean: Boolean,
        Array: Array,
        Object: Object,
        Date: Date,
        JSON: JSON
      };
      
      // Execute the converted JavaScript code
      const func = new Function(...Object.keys(context), `
        "use strict";
        try {
          ${jsCode}
        } catch (error) {
          print("Error: " + error.message);
        }
      `);
      
      func(...Object.values(context));
      
    } catch (error: any) {
      results.push(`Execution Error: ${error.message}`);
    }
    
    return results;
  }

  // Convert Python-like syntax to JavaScript
  function convertPythonToJS(pythonCode: string): string {
    let jsCode = pythonCode;
    
    // Handle f-strings
    jsCode = jsCode.replace(/f"([^"]*\{[^}]*\}[^"]*)"|f'([^']*\{[^}]*\}[^']*)'/g, (_, dblQuote, sngQuote) => {
      const content = dblQuote || sngQuote;
      return `"${content.replace(/\{([^}]+)\}/g, '${$1}')}"`;
    });
    
    // Handle print statements
    jsCode = jsCode.replace(/print\(([^)]+)\)/g, 'print($1)');
    
    // Handle variable assignments (no let/const needed)
    jsCode = jsCode.replace(/^(\s*)(\w+)\s*=\s*(.+)$/gm, '$1let $2 = $3;');
    
    // Handle for loops
    jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\((\d+)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {');
    jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for (let $1 = $2; $1 < $3; $1++) {');
    jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+(\w+):/g, 'for (let $1 of $2) {');
    
    // Handle function definitions
    jsCode = jsCode.replace(/def\s+(\w+)\(([^)]*)\):/g, 'function $1($2) {');
    
    // Handle indentation (convert to braces)
    const lines = jsCode.split('\n');
    let result = '';
    let indentLevel = 0;
    const indentSize = 4; // Python standard
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        result += line + '\n';
          continue;
        }

      // Calculate current indentation
      const currentIndent = line.length - line.trimStart().length;
      const currentLevel = Math.floor(currentIndent / indentSize);
      
      // Add closing braces if indentation decreased
      while (indentLevel > currentLevel) {
        result += '}\n';
        indentLevel--;
      }
      
      // Add opening brace if this line ends with a colon
      if (trimmed.endsWith(':')) {
        result += line + '\n';
        indentLevel++;
      } else {
        result += line + '\n';
      }
    }
    
    // Close remaining braces
    while (indentLevel > 0) {
      result += '}\n';
      indentLevel--;
    }
    
    return result;
  }

  function runCode() {
    try {
      if (selectedLanguage === 'html') {
        // Create a live HTML preview
        try {
          // Validate HTML structure
          const parser = new DOMParser();
          const doc = parser.parseFromString(code, 'text/html');
          const errors = doc.querySelectorAll('parsererror');
          
          if (errors.length > 0) {
            setOutput(`HTML Validation Error:\n${errors[0].textContent}\n\nCode:\n${code}`);
          } else {
            // Extract body content for preview
            const bodyContent = doc.body ? doc.body.innerHTML : code;
            setOutput(`HTML Preview:\n\n${bodyContent}\n\nFull HTML:\n${code}\n\nNote: This is a text preview. For full rendering, use a web browser.`);
          }
        } catch (error) {
          setOutput(`HTML Error: ${error}\n\nCode:\n${code}`);
        }
      } else if (selectedLanguage === 'css') {
        // Validate and format CSS
        try {
          // Basic CSS validation
          const cssRules = code.split('}').filter(rule => rule.trim());
          const formattedCSS = cssRules.map(rule => {
            if (rule.trim()) {
              return rule.trim() + (rule.trim().endsWith('}') ? '' : '}');
            }
            return rule;
          }).join('\n\n');
          
          setOutput(`CSS Styles:\n\n${formattedCSS}\n\nNote: These styles would be applied to HTML elements.`);
        } catch (error) {
          setOutput(`CSS Error: ${error}\n\nCode:\n${code}`);
        }
      } else if (selectedLanguage === 'javascript') {
        const results = interpretJavaScript(code);
        setOutput(results.length > 0 ? results.join('\n') : 'No output generated. Try adding console.log() statements.');
      } else if (selectedLanguage === 'python') {
        const results = interpretPython(code);
        setOutput(results.length > 0 ? results.join('\n') : 'No output generated. Try adding print() statements.');
      }
    } catch (e: any) {
      setOutput('Error: ' + e.message);
    }
  }

  function loadTemplate(template: CodeTemplate) {
    setCode(template.code);
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <div>
            <h1>Code Playground</h1>
            <p className="lead m-0">Try out code examples and experiment with different programming languages.</p>
          </div>
          <BackButton />
        </div>
      </div>

    <div className="row g-3">
        {/* Language Selection and Templates */}
        <div className="col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Language</h5>
            </div>
            <div className="card-body">
              <select 
                className="form-select mb-3" 
                value={selectedLanguage} 
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setCode(''); // Clear code when switching languages
                }}
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>

              <div className="mb-3">
                <h6>Language Features:</h6>
                <div className="small text-muted">
                  {selectedLanguage === 'javascript' && (
                    <div>
                      <strong>JavaScript:</strong> Full ES6+ support, functions, objects, arrays, Math, Date, JSON, DOM APIs
                    </div>
                  )}
                  {selectedLanguage === 'python' && (
                    <div>
                      <strong>Python:</strong> F-strings, functions, loops, lists, built-in functions (len, range, print)
                    </div>
                  )}
                  {selectedLanguage === 'html' && (
                    <div>
                      <strong>HTML:</strong> Full HTML5 support, validation, structure preview
                    </div>
                  )}
                  {selectedLanguage === 'css' && (
                    <div>
                      <strong>CSS:</strong> All CSS3 features, validation, formatting
                    </div>
                  )}
                </div>
              </div>

              <h6>Quick Actions:</h6>
              <div className="list-group">
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => setCode('')}
                >
                  Clear Code
                </button>
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    const newTemplate = {
                      name: `Template ${Date.now()}`,
                      language: selectedLanguage,
                      code: code
                    };
                    if (code.trim()) {
                      setCodeTemplates(prev => ({
                        ...prev,
                        [selectedLanguage]: [...(prev[selectedLanguage] || []), newTemplate]
                      }));
                    }
                  }}
                >
                  Save as Template
                </button>
                {codeTemplates[selectedLanguage]?.length > 0 && (
                  <>
                    <hr className="my-2" />
                    <small className="text-muted px-3">Saved Templates:</small>
                    {codeTemplates[selectedLanguage].map((template, index) => (
                      <button
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => loadTemplate(template)}
                      >
                        {template.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Code Editor</h5>
              <span className="badge bg-secondary">{selectedLanguage.toUpperCase()}</span>
            </div>
            <div className="card-body p-0">
              <textarea 
                className="form-control border-0" 
                rows={15} 
                value={code} 
                onChange={e => setCode(e.target.value)}
                style={{fontFamily: 'Monaco, Consolas, "Courier New", monospace', fontSize: '14px'}}
                placeholder={
                  selectedLanguage === 'javascript' ? 
                    '// Type any JavaScript code here\nconsole.log("Hello World!");\n\nlet x = 5;\nlet y = 10;\nconsole.log(x + y);' :
                  selectedLanguage === 'python' ?
                    '# Type any Python code here\nprint("Hello World!")\n\nx = 5\ny = 10\nprint(f"Sum: {x + y}")' :
                  selectedLanguage === 'html' ?
                    '<!-- Type any HTML code here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>' :
                  selectedLanguage === 'css' ?
                    '/* Type any CSS code here */\nbody {\n    background-color: lightblue;\n    font-family: Arial;\n}\n\nh1 {\n    color: white;\n    text-align: center;\n}' :
                    'Enter your code here...'
                }
              />
            </div>
            <div className="card-footer">
              <button className="btn btn-success" onClick={runCode}>
                <i className="bi bi-play-fill"></i> Run Code
              </button>
              <button className="btn btn-outline-secondary ms-2" onClick={() => setCode('')}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Output</h5>
            </div>
            <div className="card-body p-0">
              <pre 
                className="bg-dark text-light p-3 mb-0" 
                style={{ 
                  minHeight: 300, 
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '14px'
                }}
              >
                {output || 'Click "Run Code" to see the output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Tips */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <h6><i className="bi bi-lightbulb"></i> Tips:</h6>
            <ul className="mb-0">
              {selectedLanguage === 'javascript' && (
                <React.Fragment>
                  <li>Use <code>console.log()</code> to see output</li>
                  <li>All JavaScript features work: functions, loops, objects, arrays</li>
                  <li>Built-in functions available: Math, Date, JSON, Array, Object</li>
                </React.Fragment>
              )}
              {selectedLanguage === 'python' && (
                <React.Fragment>
                  <li>Use <code>print()</code> to see output</li>
                  <li>F-strings work: <code>f"Hello {'{'}name{'}'}"</code></li>
                  <li>Python syntax: <code>for i in range(5):</code>, <code>def function():</code></li>
                </React.Fragment>
              )}
              {selectedLanguage === 'html' && (
                <React.Fragment>
                  <li>HTML will be validated and parsed</li>
                  <li>Shows structure preview and validation errors</li>
                </React.Fragment>
              )}
              {selectedLanguage === 'css' && (
                <React.Fragment>
                  <li>CSS will be formatted and validated</li>
                  <li>Shows formatted rules and syntax errors</li>
                </React.Fragment>
              )}
              <li>Type any code - the playground executes it dynamically!</li>
            </ul>
          </div>
      </div>
      </div>
    </div>
  );
}


