const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const os = require('os');


const app = express();
const port = 3001;


app.use(cors());
app.use(bodyParser.json());


// Database Connection
const db = mysql.createConnection({
    host: '172.16.77.172',
    user: 'axroot',
    password: 'adminControl',
    database: 'completes'
});


db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos');
    }
});


// List with test station's IP's
const lineas = {
    1: {
        '172.16.77.160': 'rack-flg-01-01',
        '172.16.77.161': 'rack-flg-01-02',
        '172.16.77.162': 'rack-flg-01-03',
        '172.16.77.163': 'rack-flg-01-04',
        '172.16.77.166': 'rack-flg-01-05',
        '172.16.77.167': 'rack-flg-01-06',
        '172.16.77.168': 'rack-flg-01-07',
        // Add more IP's, is neccessary...
    },
    2: {
        '172.16.77.169': 'rack-flg-02-01',
        '172.16.77.170': 'rack-flg-02-02',
        '172.16.77.171': 'rack-flg-02-03',
        '172.16.77.173': 'rack-flg-02-04',
        '172.16.77.174': 'rack-flg-02-05',
        '172.16.77.175': 'rack-flg-02-06',
        '172.16.77.176': 'rack-flg-02-07',
        // Add more IP's, is neccessary...
    },
    3: {
        '172.16.77.177': 'rack-flg-03-01',
        '172.16.77.178': 'rack-flg-03-02',
        '172.16.77.179': 'rack-flg-03-03',
        '172.16.77.180': 'rack-flg-03-04',
        '172.16.77.181': 'rack-flg-03-05',
        '172.16.77.182': 'rack-flg-03-06',
        '172.16.77.183': 'rack-flg-03-07',
        // Add more IP's, is neccessary...
    },
    4: {
        // Need edit, add correct IP
        '172.16.77.000': 'rack-flg-04-01',
        // Add more IP's, is neccessary...
    }
};


app.get('/get-client-info', (req, res) => {
    const clientInfo = {
        ipAddress: req.ip,
        hostName: os.hostname(), 
    };
    res.json(clientInfo);
});


function getEquipoInfoPorIp(ip) {
    for (const linea in lineas) {
        if (lineas[linea][ip]) {
            return { linea_id: linea, host_name: lineas[linea][ip] };
        }
    }
    return { linea_id: null, host_name: 'Equipo desconocido' };
}


app.post('/save-client-info', (req, res) => {
    const { ip_address } = req.body;

    const equipoInfo = getEquipoInfoPorIp(ip_address);

    if (!equipoInfo.linea_id) {
        return res.status(400).json({ error: 'IP no reconocida' });
    }

    const query = 'INSERT INTO equipos (host_name, linea_id, ip_address) VALUES (?, ?, ?)';
    const values = [equipoInfo.host_name, equipoInfo.linea_id, ip_address];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al guardar en la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al guardar en la base de datos.', details: err.message });
        }
        res.status(200).json({ message: `Equipo ${equipoInfo.host_name} de la línea ${equipoInfo.linea_id} registrado con éxito.` });
    });
});


app.post('/submit-form', (req, res) => {
    const { turno, fecha, completado, realizadoPor, comentarios } = req.body;

    if (!turno || !fecha || !completado || !realizadoPor) {
        return res.status(400).json({ error: 'Por favor, completa todos los campos obligatorios.' });
    }

    const query = 'INSERT INTO tasks (Turno, Completado, Fecha, RealizadoPor, Comentarios) VALUES (?, ?, ?, ?, ?)';
    const values = [turno, completado, fecha, realizadoPor, comentarios];
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err.message);
            return res.status(500).json({ error: 'Error al guardar en la base de datos.', details: err.message });
        }
        res.status(200).json({ message: 'Formulario completado y registrado con éxito.' });
    });
});


app.get('/check-form-status', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const query = "SELECT completado FROM tasks WHERE fecha = ?";
    db.query(query, [today], (err, result) => {
        if (err) {
            console.error('Error al consultar el estado del formulario:', err);
            res.status(500).json({ message: 'Error al verificar el estado' });
        } else {
            if (result.length > 0 && result[0].completado === 'Completado') {
                res.json({ completed: true });
            } else {
                res.json({ completed: false });
            }
        }
    });
});


// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});