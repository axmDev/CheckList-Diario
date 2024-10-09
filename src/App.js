import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DigitalTable from './DigitalTable';
import About from './About';
import ValidationPage from './ValidationPage';
import './App.css';

function App() {

    const [navbarHidden, setNavbarHidden] = useState(false);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setNavbarHidden(true);
            } else {
                setNavbarHidden(false);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <Router>
            <div className="app">
                <nav className={`navbar ${navbarHidden ? 'hidden' : ''}`}>
                    <ul>
                        <li>
                            <Link to="/">Inicio</Link>
                        </li>
                        <li>
                            <Link to="/about">Acerca de</Link>
                        </li>
                        <li>
                            <Link to="/validation">Validar formulario</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<DigitalTable />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/validation" element={<ValidationPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;