import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ValidationPage.css';

const ValidationPage = () => {
    const [formStatus, setFormStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://192.168.207.152:3001/check-form-status')
            .then(response => {
                setFormStatus(response.data.completed);
                setLoading(false);
            })
            .catch(error => {
                setError('Hubo un problema al verificar el estado del formulario');
                setLoading(false);
            });
    }, []);

    if (loading) {
        // return <div className='loaderMsg'>Cargando estado del formulario...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container">
            <div className='glass'>
            {formStatus ? (
                <div>
                    <h1 className='goodMsg'>El formulario ha sido completado</h1>
                    <p>El formulario del día fue llenado correctamente.</p>
                </div>
            ) : (
                <div>
                    <h1 className='badMsg'>El formulario aún no ha sido completado</h1>
                    <p>El formulario del día no ha sido llenado.</p>
                </div>
            )}
            </div>
        </div>
    );
}

export default ValidationPage;