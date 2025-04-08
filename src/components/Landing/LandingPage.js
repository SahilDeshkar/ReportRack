"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import "./LandingPage.css"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const canvasRef = useRef(null)
  const heroRef = useRef(null)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Canvas animation for background
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 30 // Reduced for better performance

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1 // Smaller particles
        this.speedX = Math.random() * 0.5 - 0.25 // Slower movement
        this.speedY = Math.random() * 0.5 - 0.25
        this.color = `rgba(138, 43, 226, ${Math.random() * 0.3})` // More subtle opacity
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      requestAnimationFrame(animate)
    }

    init()
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Animate numbers on scroll
  useEffect(() => {
    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const value = Math.floor(progress * (end - start) + start)
        obj.innerHTML = value + (obj.dataset.suffix || "")
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            const value = el.getAttribute("data-value")
            const suffix = el.getAttribute("data-suffix") || ""
            animateValue(el, 0, Number.parseInt(value), 1500)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.5 },
    )

    document.querySelectorAll(".metric-value").forEach((el) => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="landing-container">
      <canvas ref={canvasRef} className="background-canvas" />

      <header className={`landing-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <div className="logo-container">
            <h1 className="logo">ReportRack</h1>
            <div className="logo-accent"></div>
          </div>
          <nav className="nav-links">
            <Link to="/browse" className="nav-link">
              Browse
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="cta-button small">
              Sign Up
            </Link>
          </nav>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
          <span>×</span>
        </button>
        <div className="mobile-nav-links">
          <Link to="/browse" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Browse
          </Link>
          <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
        </div>
        <div className="mobile-auth-buttons">
          <Link to="/signup" className="cta-button" onClick={() => setIsMenuOpen(false)}>
            Sign Up
          </Link>
        </div>
      </div>

      <section className="hero-section" ref={heroRef}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Power BI Dashboard Repository</span> for Analysts and Developers
            </h1>
            <p className="hero-subtitle">
            Your dashboards deserve more than a ZIP file. Meet their new home. A platform to share and explore Power BI dashboards—no enterprise email or paid plan needed.
            </p>
            <div className="cta-container">
              <Link to="/signup" className="cta-button">
                Try the Demo
                <svg
                  className="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
              <Link to="/browse" className="secondary-button">
                View Sample Dashboards
              </Link>
            </div>
          </div>

          <div className="dashboard-preview">
            <div className="dashboard-mockup">
              <div className="mockup-header mockup-element"></div>
              <div className="mockup-chart mockup-element"></div>
              <div className="mockup-chart small mockup-element"></div>
              <div className="mockup-metrics">
                <div className="metric mockup-element"></div>
                <div className="metric mockup-element"></div>
                <div className="metric mockup-element"></div>
              </div>
              <div className="glow-effect"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            <span className="gradient-text">Project Features</span> & Capabilities
          </h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon resource-icon"></div>
              <h3>Dashboard Repository</h3>
              <p>
                Store and organize Power BI dashboards in a centralized location. This project demonstrates file upload,
                storage, and retrieval functionality.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon collaboration-icon"></div>
              <h3>User Authentication</h3>
              <p>
                Implemented secure user authentication and authorization using Supabase. Users can create accounts, log
                in, and manage their uploaded dashboards.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon access-icon"></div>
              <h3>Dashboard Preview</h3>
              <p>
                The system automatically generates preview images of uploaded dashboards to provide visual context in
                the dashboard listing interface.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon security-icon"></div>
              <h3>Search Functionality</h3>
              <p>
                Users can search through the repository of dashboards by title or description to quickly find relevant
                content for their learning needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-container">
              <div className="metric-value" data-value="4" data-suffix="">
                0
              </div>
              <div className="metric-label">Project Phases</div>
            </div>
            <div className="metric-container">
              <div className="metric-value" data-value="6" data-suffix="">
                0
              </div>
              <div className="metric-label">Core Features</div>
            </div>
            <div className="metric-container">
              <div className="metric-value" data-value="12" data-suffix="+">
                0+
              </div>
              <div className="metric-label">Sample Dashboards</div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Project Development Process</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "Phase 1 focused on user interface design and authentication implementation. We used React for the
                  frontend and Supabase for backend services."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">P1</div>
                <div className="author-info">
                  <p className="author-name">Planning & Design</p>
                  <p className="author-title">Project Phase 1</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "Phase 2 involved implementing file upload functionality, storage integration, and preview generation
                  for Power BI dashboard files."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">P2</div>
                <div className="author-info">
                  <p className="author-name">Core Functionality</p>
                  <p className="author-title">Project Phase 2</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "Phase 3 added search capabilities, dashboard categorization, and user profile management to enhance
                  the overall user experience."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">P3</div>
                <div className="author-info">
                  <p className="author-name">Enhanced Features</p>
                  <p className="author-title">Project Phase 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>
            <span className="gradient-text">Project</span> Story ☕
          </h2>
          <p>
            It all began at 2:13 AM—my fifth cup of coffee in hand, the Power BI dashboard glowing brighter than my career prospects, and my inner wannabe Product Manager whispering:
          </p>
          <blockquote>
            “This dashboard? This is revolutionary. Synergy. Value-driven. Scalable.”
          </blockquote>
          <p>
            I hit send. A recruiter replied:
          </p>
          <blockquote>
            “Cool... do you have a GitHub link?”
          </blockquote>
          <p>
            My eye twitched. My .pbix file cried in silence. Because let’s face it: Power BI dashboards on GitHub look like a coder tried uploading modern art into a filing cabinet.
          </p>
          <p>
            Fueled by caffeine and a deep desire to “circle back with a better solution,” I pulled my inner coder out of semi-retirement and built <strong>ReportRack</strong>—a sleek, no-nonsense platform where dashboards finally get the red carpet treatment they deserve.
          </p>
          <p>
            This isn’t just a project. It’s the MVP of MVPs. A SaaS-y solution to a silent struggle. A place where dashboards stop being attachments and start being assets.
          </p>
          <Link to="/signup" className="cta-button large">
            Try the Demo
            <svg
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2 className="logo">ReportRack</h2>
              <p>A student project demonstrating a Power BI dashboard repository platform</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Project</h4>
                <Link to="/browse">Sample Dashboards</Link>
                <Link to="/dashboard">Upload Demo</Link>
                <Link to="/about">About Project</Link>
              </div>
              <div className="footer-column">
                <h4>Technologies</h4>
                <Link to="/tech-stack">React</Link>
                <Link to="/tech-stack">Supabase</Link>
                <Link to="/tech-stack">Power BI</Link>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <Link to="/documentation">Documentation</Link>
                <Link to="/github">GitHub Repository</Link>
                <Link to="/credits">Credits</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} ReportRack - College Project. Not a commercial product.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
