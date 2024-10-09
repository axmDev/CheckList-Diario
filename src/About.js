import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="container">
            <div className="glass">
                <h1>Informacion</h1>
                <p>Si se detecta alguna anomalia en la estacion de prueba (cable dañado, etc.) reporte al tecnico de pruebas, si falta material de lo que pide el MPI reportelo al ingeniero de pruebas.</p>
                <h1>Soporte</h1>
                <p>Desarrollador: Axel Ambrosio.</p>
                <p>Para cualquier duda respecto a la pagina, modificacion o actualizacion ponerse en contacto con el desarrollador.</p>
                <p>Correo: axel.ambrosio@flex.com</p>
            </div>
        </div>
    );
};

export default About;