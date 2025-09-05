import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

interface ReferenceItem {
  name: string;
  description: string;
  syntax: string;
  example: string;
  category: string;
}

export default function ReferencePage() {
  const { language } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Reference data - this should come from an API in a real application
  const referenceData: Record<string, ReferenceItem[]> = {
    html: [
      {
        name: 'h1',
        description: 'Defines the most important heading',
        syntax: '<h1>content</h1>',
        example: '<h1>Welcome to My Website</h1>',
        category: 'headings'
      },
      {
        name: 'p',
        description: 'Defines a paragraph',
        syntax: '<p>content</p>',
        example: '<p>This is a paragraph of text.</p>',
        category: 'text'
      },
      {
        name: 'a',
        description: 'Defines a hyperlink',
        syntax: '<a href="url">link text</a>',
        example: '<a href="https://www.example.com">Visit Example</a>',
        category: 'links'
      },
      {
        name: 'img',
        description: 'Defines an image',
        syntax: '<img src="url" alt="text">',
        example: '<img src="image.jpg" alt="A beautiful sunset">',
        category: 'media'
      },
      {
        name: 'div',
        description: 'Defines a section in a document',
        syntax: '<div>content</div>',
        example: '<div class="container">Content here</div>',
        category: 'layout'
      },
      {
        name: 'span',
        description: 'Defines a section in a document (inline)',
        syntax: '<span>content</span>',
        example: '<span class="highlight">Important text</span>',
        category: 'layout'
      },
      {
        name: 'ul',
        description: 'Defines an unordered list',
        syntax: '<ul><li>item</li></ul>',
        example: '<ul><li>Item 1</li><li>Item 2</li></ul>',
        category: 'lists'
      },
      {
        name: 'ol',
        description: 'Defines an ordered list',
        syntax: '<ol><li>item</li></ol>',
        example: '<ol><li>First item</li><li>Second item</li></ol>',
        category: 'lists'
      }
    ],
    css: [
      {
        name: 'color',
        description: 'Sets the color of text',
        syntax: 'color: value;',
        example: 'color: red;',
        category: 'text'
      },
      {
        name: 'background-color',
        description: 'Sets the background color of an element',
        syntax: 'background-color: value;',
        example: 'background-color: #f0f0f0;',
        category: 'background'
      },
      {
        name: 'font-size',
        description: 'Sets the size of the font',
        syntax: 'font-size: value;',
        example: 'font-size: 16px;',
        category: 'text'
      },
      {
        name: 'margin',
        description: 'Sets the margin area on all four sides',
        syntax: 'margin: value;',
        example: 'margin: 10px;',
        category: 'layout'
      },
      {
        name: 'padding',
        description: 'Sets the padding area on all four sides',
        syntax: 'padding: value;',
        example: 'padding: 15px;',
        category: 'layout'
      },
      {
        name: 'border',
        description: 'Sets the border of an element',
        syntax: 'border: width style color;',
        example: 'border: 1px solid black;',
        category: 'border'
      },
      {
        name: 'display',
        description: 'Sets the display type of an element',
        syntax: 'display: value;',
        example: 'display: block;',
        category: 'layout'
      },
      {
        name: 'width',
        description: 'Sets the width of an element',
        syntax: 'width: value;',
        example: 'width: 100%;',
        category: 'layout'
      }
    ],
    javascript: [
      {
        name: 'console.log()',
        description: 'Outputs a message to the web console',
        syntax: 'console.log(message);',
        example: 'console.log("Hello, World!");',
        category: 'output'
      },
      {
        name: 'let',
        description: 'Declares a block-scoped variable',
        syntax: 'let variableName = value;',
        example: 'let name = "John";',
        category: 'variables'
      },
      {
        name: 'const',
        description: 'Declares a block-scoped constant',
        syntax: 'const variableName = value;',
        example: 'const PI = 3.14159;',
        category: 'variables'
      },
      {
        name: 'function',
        description: 'Declares a function',
        syntax: 'function name(parameters) { code }',
        example: 'function greet(name) { return "Hello " + name; }',
        category: 'functions'
      },
      {
        name: 'if',
        description: 'Executes code if a condition is true',
        syntax: 'if (condition) { code }',
        example: 'if (age >= 18) { console.log("Adult"); }',
        category: 'control'
      },
      {
        name: 'for',
        description: 'Creates a loop that runs a specified number of times',
        syntax: 'for (init; condition; increment) { code }',
        example: 'for (let i = 0; i < 5; i++) { console.log(i); }',
        category: 'loops'
      },
      {
        name: 'Array',
        description: 'Creates an array object',
        syntax: 'new Array() or []',
        example: 'let fruits = ["apple", "banana", "orange"];',
        category: 'objects'
      },
      {
        name: 'document.getElementById()',
        description: 'Returns the element with the specified ID',
        syntax: 'document.getElementById(id);',
        example: 'document.getElementById("myDiv");',
        category: 'dom'
      }
    ],
    python: [
      {
        name: 'print()',
        description: 'Prints the specified message to the screen',
        syntax: 'print(value)',
        example: 'print("Hello, World!")',
        category: 'output'
      },
      {
        name: 'input()',
        description: 'Allows user input',
        syntax: 'input(prompt)',
        example: 'name = input("Enter your name: ")',
        category: 'input'
      },
      {
        name: 'len()',
        description: 'Returns the length of an object',
        syntax: 'len(object)',
        example: 'len("Hello")  # Returns 5',
        category: 'functions'
      },
      {
        name: 'range()',
        description: 'Returns a sequence of numbers',
        syntax: 'range(start, stop, step)',
        example: 'range(0, 5)  # Returns 0, 1, 2, 3, 4',
        category: 'functions'
      },
      {
        name: 'if',
        description: 'Executes code if a condition is true',
        syntax: 'if condition: code',
        example: 'if age >= 18: print("Adult")',
        category: 'control'
      },
      {
        name: 'for',
        description: 'Creates a loop that iterates over a sequence',
        syntax: 'for item in sequence: code',
        example: 'for i in range(5): print(i)',
        category: 'loops'
      },
      {
        name: 'def',
        description: 'Defines a function',
        syntax: 'def function_name(parameters): code',
        example: 'def greet(name): return f"Hello {name}"',
        category: 'functions'
      },
      {
        name: 'list',
        description: 'Creates a list object',
        syntax: 'list() or []',
        example: 'fruits = ["apple", "banana", "orange"]',
        category: 'data-types'
      }
    ]
  };

  const currentReferences = referenceData[language || 'html'] || [];
  
  const categories = ['all', ...Array.from(new Set(currentReferences.map(item => item.category)))];
  
  const filteredReferences = currentReferences.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const languageNames: Record<string, string> = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript',
    python: 'Python'
  };

  const currentLanguageName = languageNames[language || 'html'] || 'HTML';

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <nav>
              <Link to="/">Home</Link> / <Link to="/reference">References</Link> / {currentLanguageName}
            </nav>
            <BackButton />
          </div>
          
          <h1>{currentLanguageName} Reference</h1>
          <p className="lead">Complete reference for {currentLanguageName} elements, properties, and functions.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Search & Filter</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search references..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <h6>Quick Links</h6>
                <div className="list-group list-group-flush">
                  <Link to="/tutorials/html" className="list-group-item list-group-item-action">
                    HTML Tutorial
                  </Link>
                  <Link to="/tutorials/css" className="list-group-item list-group-item-action">
                    CSS Tutorial
                  </Link>
                  <Link to="/tutorials/javascript" className="list-group-item list-group-item-action">
                    JavaScript Tutorial
                  </Link>
                  <Link to="/tutorials/python" className="list-group-item list-group-item-action">
                    Python Tutorial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="row g-3">
            {filteredReferences.map((item, index) => (
              <div key={index} className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">
                        <code>{item.name}</code>
                      </h5>
                      <span className="badge bg-secondary">{item.category}</span>
                    </div>
                    <p className="card-text text-muted">{item.description}</p>
                    
                    <div className="mb-3">
                      <h6 className="text-success">Syntax:</h6>
                      <pre className="bg-light p-2 rounded"><code>{item.syntax}</code></pre>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-primary">Example:</h6>
                      <pre className="bg-dark text-light p-2 rounded"><code>{item.example}</code></pre>
                    </div>
                    
                    <Link to="/playground" className="btn btn-outline-primary btn-sm">
                      Try it Yourself »
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReferences.length === 0 && (
            <div className="text-center py-5">
              <h4>No references found</h4>
              <p className="text-muted">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
