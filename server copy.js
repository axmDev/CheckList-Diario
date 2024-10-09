const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const os = require('os');
const { error } = require('console');
const app = express();
const port = 3001;


app.use(cors());
app.use(bodyParser.json());


// Database Connection
const db = mysql.createConnection({
    host: '192.168.204.193',
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


const lineas = {
    1: {
        '192.168.204.193': 'rack-flg-01-01',

    },
    2: {
        '192.168.206.218': 'rack-flg-02-01',
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
    const { turno, fecha, completado, realizadoPor, comentarios, ip_address } = req.body;
    const equipoInfo = getEquipoInfoPorIp(ip_address);

    if (!equipoInfo.linea_id) {
        return res.status(400).json({ error: 'IP no reconocida' });
    }

    if (!turno || !fecha || !completado || !realizadoPor) {
        return res.status(400).json({ error: 'Por favor, completa todos los campos obligatorios.' });
    }

    const query = 'INSERT INTO tasks (Estacion, Turno, Fecha, RealizadoPor, Completado, Comentarios) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [equipoInfo.host_name, turno, fecha, realizadoPor, completado, comentarios];
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
    const query = "SELECT completado FROM taskss WHERE fecha = ?";
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