import { Link } from 'react-router-dom';

export default function Home() {
  const programmingLanguages = [
    { name: 'HTML', description: 'The language for building web pages', color: '#E34F26', link: '/tutorials/html' },
    { name: 'CSS', description: 'The language for styling web pages', color: '#1572B6', link: '/tutorials/css' },
    { name: 'JavaScript', description: 'The language for programming web pages', color: '#F7DF1E', link: '/tutorials/javascript' },
    { name: 'Python', description: 'A popular programming language', color: '#3776AB', link: '/tutorials/python' },
    { name: 'Java', description: 'A programming language', color: '#ED8B00', link: '/tutorials/java' },
    { name: 'C++', description: 'A programming language', color: '#00599C', link: '/tutorials/cpp' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-5 text-center" style={{backgroundColor: '#04AA6D', color: 'white'}}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">Learn to Code</h1>
          <p className="lead mb-4">With the world's largest web developer site.</p>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="input-group input-group-lg">
                <input type="text" className="form-control" placeholder="Search our tutorials, e.g. HTML" />
                <button className="btn btn-light" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programming Languages Grid */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Popular Programming Languages</h2>
          <div className="row g-4">
            {programmingLanguages.map((lang, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <Link to={lang.link} className="text-decoration-none">
                  <div className="card h-100 shadow-sm border-0" style={{transition: 'transform 0.2s'}}>
                    <div className="card-body text-center p-4">
                      <div 
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{width: '80px', height: '80px', backgroundColor: lang.color, fontSize: '1.5rem'}}
                      >
                        {lang.name}
                      </div>
                      <h5 className="card-title text-dark">{lang.name}</h5>
                      <p className="card-text text-muted">{lang.description}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-book"></i>
                </div>
                <h5>Easy Learning</h5>
                <p>Our tutorials start with the basics and gradually build up to more advanced topics.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-code-slash"></i>
                </div>
                <h5>Try It Yourself</h5>
                <p>Edit and run code examples directly in your browser with our interactive playground.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-trophy"></i>
                </div>
                <h5>Complete Reference</h5>
                <p>Comprehensive references with examples for all programming languages and web technologies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2>Start Learning Today</h2>
              <p className="lead">Join millions of learners who have already started their programming journey with CodeLearn.</p>
              <div className="d-flex gap-3">
                <Link to="/tutorials/html" className="btn btn-primary btn-lg">Start with HTML</Link>
                <Link to="/playground" className="btn btn-outline-primary btn-lg">Try Code Editor</Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-dark text-light p-4 rounded">
                <h6 className="text-success">Example: Your First HTML Page</h6>
                <pre className="mb-0"><code>{`<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is my first webpage.</p>
</body>
</html>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


