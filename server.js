const express = require('express');
const fs = require('fs');
const path = require('path'); // Módulo para manejo de rutas
const app = express();
const PORT = process.env.PORT || 3000; // Puerto en el que se ejecutará el servidor

// Middleware para manejar JSON en las solicitudes
app.use(express.json());

// Rutas a los archivos JSON
const countriesFile = path.join(__dirname, 'countries.json');
const citiesFile = path.join(__dirname, 'cities.json');

// Ruta para guardar datos de países en archivo countries.json
app.post('/api/countries', (req, res) => {
    const data = req.body;
    fs.writeFile(countriesFile, JSON.stringify(data), err => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al guardar los países.' });
            return;
        }
        res.json({ message: 'Datos de países guardados exitosamente.' });
    });
});

// Ruta para guardar datos de ciudades en archivo cities.json
app.post('/api/cities', (req, res) => {
    const data = req.body;
    fs.writeFile(citiesFile, JSON.stringify(data), err => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al guardar las ciudades.' });
            return;
        }
        res.json({ message: 'Datos de ciudades guardados exitosamente.' });
    });
});

// Ruta para cargar datos de países desde countries.json
app.get('/api/countries', (req, res) => {
    fs.readFile(countriesFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al cargar los países.' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Ruta para cargar datos de ciudades desde cities.json
app.get('/api/cities', (req, res) => {
    fs.readFile(citiesFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al cargar las ciudades.' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
