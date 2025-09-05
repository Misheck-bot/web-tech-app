import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

interface TutorialSection {
  id: string;
  title: string;
  content: string;
  example?: string;
  output?: string;
}

interface TutorialData {
  language: string;
  title: string;
  description: string;
  sections: TutorialSection[];
}

export default function TutorialPage() {
  const { language } = useParams();
  const [activeSection, setActiveSection] = useState(0);

  // Tutorial data - this should come from an API in a real application
  const tutorialData: Record<string, TutorialData> = {
    html: {
      language: 'HTML',
      title: 'HTML Tutorial',
      description: 'HTML is the standard markup language for Web pages.',
      sections: [
        {
          id: 'intro',
          title: 'What is HTML?',
          content: `HTML stands for Hyper Text Markup Language
HTML is the standard markup language for creating Web pages
HTML describes the structure of a Web page
HTML consists of a series of elements
HTML elements tell the browser how to display the content
HTML elements label pieces of content such as "this is a heading", "this is a paragraph", "this is a link", etc.`,
          example: `<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>`,
          output: 'My First Heading\n\nMy first paragraph.'
        },
        {
          id: 'elements',
          title: 'HTML Elements',
          content: `An HTML element is defined by a start tag, some content, and an end tag:

<tagname>Content goes here...</tagname>

The HTML element is everything from the start tag to the end tag:

<h1>My First Heading</h1>
<p>My first paragraph.</p>`,
          example: `<h1>My First Heading</h1>
<p>My first paragraph.</p>`,
          output: 'My First Heading\n\nMy first paragraph.'
        },
        {
          id: 'attributes',
          title: 'HTML Attributes',
          content: `HTML attributes provide additional information about HTML elements.

All HTML elements can have attributes
Attributes provide additional information about elements
Attributes are always specified in the start tag
Attributes usually come in name/value pairs like: name="value"`,
          example: `<a href="https://www.w3schools.com">This is a link</a>`,
          output: 'This is a link (clickable)'
        }
      ]
    },
    css: {
      language: 'CSS',
      title: 'CSS Tutorial',
      description: 'CSS is the language we use to style an HTML document.',
      sections: [
        {
          id: 'intro',
          title: 'What is CSS?',
          content: `CSS stands for Cascading Style Sheets
CSS describes how HTML elements are to be displayed on screen, paper, or in other media
CSS saves a lot of work. It can control the layout of multiple web pages all at once
External stylesheets are stored in CSS files`,
          example: `body {
    background-color: lightblue;
}

h1 {
    color: white;
    text-align: center;
}

p {
    font-family: verdana;
    font-size: 20px;
}`,
          output: 'Styled webpage with blue background, white centered heading, and Verdana font paragraphs.'
        },
        {
          id: 'syntax',
          title: 'CSS Syntax',
          content: `A CSS rule consists of a selector and a declaration block:

selector { property: value; }

The selector points to the HTML element you want to style.
The declaration block contains one or more declarations separated by semicolons.
Each declaration includes a CSS property name and a value, separated by a colon.`,
          example: `p {
    color: red;
    text-align: center;
}`,
          output: 'All paragraphs will be red and center-aligned.'
        }
      ]
    },
    javascript: {
      language: 'JavaScript',
      title: 'JavaScript Tutorial',
      description: 'JavaScript is the programming language of the Web.',
      sections: [
        {
          id: 'intro',
          title: 'What is JavaScript?',
          content: `JavaScript is the world's most popular programming language.
JavaScript is the programming language of the Web.
JavaScript is easy to learn.
This tutorial will teach you JavaScript from basic to advanced.`,
          example: `document.getElementById("demo").innerHTML = "Hello JavaScript!";`,
          output: 'Hello JavaScript!'
        },
        {
          id: 'variables',
          title: 'JavaScript Variables',
          content: `JavaScript variables are containers for storing data values.

In this example, x, y, and z, are variables, declared with the var keyword:

var x = 5;
var y = 6;
var z = x + y;`,
          example: `var x = 5;
var y = 6;
var z = x + y;
console.log(z);`,
          output: '11'
        }
      ]
    },
    python: {
      language: 'Python',
      title: 'Python Tutorial',
      description: 'Python is a popular programming language.',
      sections: [
        {
          id: 'intro',
          title: 'What is Python?',
          content: `Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.

It is used for:
web development (server-side),
software development,
mathematics,
system scripting.`,
          example: `print("Hello, World!")`,
          output: 'Hello, World!'
        },
        {
          id: 'variables',
          title: 'Python Variables',
          content: `Variables are containers for storing data values.

Unlike other programming languages, Python has no command for declaring a variable.

A variable is created the moment you first assign a value to it.`,
          example: `x = 5
y = "John"
print(x)
print(y)`,
          output: '5\nJohn'
        }
      ]
    }
  };

  const currentTutorial = tutorialData[language || 'html'];

  if (!currentTutorial) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          <h4>Tutorial not found</h4>
          <p>The tutorial for "{language}" is not available yet.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="sticky-top" style={{top: '20px'}}>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{currentTutorial.language} Tutorial</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {currentTutorial.sections.map((section, index) => (
                    <button
                      key={section.id}
                      className={`list-group-item list-group-item-action ${activeSection === index ? 'active' : ''}`}
                      onClick={() => setActiveSection(index)}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <nav>
              <Link to="/">Home</Link> / <Link to="/tutorials">Tutorials</Link> / {currentTutorial.language}
            </nav>
            <BackButton />
          </div>

          <h1>{currentTutorial.title}</h1>
          <p className="lead">{currentTutorial.description}</p>

          {currentTutorial.sections.map((section, index) => (
            <div key={section.id} className={`tutorial-section ${activeSection === index ? 'active' : 'd-none'}`}>
              <h2>{section.title}</h2>
              <div className="tutorial-content">
                <pre className="bg-light p-3 rounded" style={{whiteSpace: 'pre-wrap'}}>{section.content}</pre>
                
                {section.example && (
                  <div className="mt-4">
                    <h4>Example</h4>
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Code:</h6>
                        <pre className="bg-dark text-light p-3 rounded"><code>{section.example}</code></pre>
                      </div>
                      {section.output && (
                        <div className="col-md-6">
                          <h6>Output:</h6>
                          <pre className="bg-light p-3 rounded border">{section.output}</pre>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Link to="/playground" className="btn btn-success">
                        Try it Yourself »
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Navigation */}
          <div className="mt-5 d-flex justify-content-between">
            <button 
              className="btn btn-outline-primary"
              disabled={activeSection === 0}
              onClick={() => setActiveSection(activeSection - 1)}
            >
              « Previous
            </button>
            <button 
              className="btn btn-primary"
              disabled={activeSection === currentTutorial.sections.length - 1}
              onClick={() => setActiveSection(activeSection + 1)}
            >
              Next »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
