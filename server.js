const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 3001;


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


// Database Connection
const db = mysql.createConnection({
    host: '192.168.206.74',
    user: 'axroot',
    password: 'adminControl',
    database: 'completes'
});


db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to the database');
    }
});


const lineas = {
    1: {
        '192.168.204.197': 'rack-flg-01-01',

    },
    2: {
        '192.168.206.74': 'rack-flg-02-01',
    },
    3: {
        '192.168.206.43': 'device-Manuel-Iglesias'
    }
};


app.get('/get-client-info', (req, res) => {
    const clientInfo = {
        ipAddress: req.ip,
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


app.post('/submit-form', (req, res) => {
    const { turno, fecha, completado, realizadoPor, comentarios, ip_address, activitiesStatus } = req.body;

    if (!turno || !fecha || !completado || !realizadoPor || !ip_address || !activitiesStatus) {
        return res.status(400).json({ error: 'Por favor, completa todos los campos obligatorios, incluyendo el estado de las actividades.' });
    }


    const equipoInfo = getEquipoInfoPorIp(ip_address);

    if (!equipoInfo.linea_id) {
        return res.status(400).json({ error: 'IP no reconocida.' });
    }


    const query = 'INSERT INTO tasks (Estacion, Turno, Fecha, RealizadoPor, Completado, Comentarios) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [equipoInfo.host_name, turno, fecha, realizadoPor, completado, comentarios];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err.message);
            return res.status(500).json({ error: 'Error al guardar en la base de datos.', details: err.message });
        }

        const taskId = result.insertId;

        const activityQuery = 'INSERT INTO activities (task_id, activity_name, status) VALUES ?';
        const activityValues = activitiesStatus.map((status, index) => [taskId, `Actividad ${index + 1}`, status]);

        db.query(activityQuery, [activityValues], (err) => {
            if (err) {
                console.error('Error al guardar las actividades:', err.message);
                return res.status(500).json({ error: 'Error al guardar las actividades en la base de datos.', details: err.message });
            }
            res.status(200).json({ message: 'Formulario completado y registrado con éxito.' });
        });
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
    console.log(`Server running on http://0.0.0.0:${port}`);
});