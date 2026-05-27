import express from 'express';
import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuración del almacenamiento de archivos de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Le pone la fecha en milisegundos al nombre para que nunca se dupliquen
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Filtro de seguridad: Verificar sesión iniciada
const verificarLogin = (req, res, next) => {
    if (!req.session.usuarioLogueado) return res.status(401).send("Acceso denegado.");
    next();
};

// 1. OBTENER TODAS LAS ENTREGAS (READ)
router.get('/', verificarLogin, (req, res) => {
    db.all(`SELECT * FROM tareas`, [], (err, filas) => {
        if (err) return res.status(500).send("Error al obtener tareas.");
        res.json(filas);
    });
});

// 2. CREAR NUEVA ENTREGA (CREATE)
router.post('/', verificarLogin, upload.single('archivo'), (req, res) => {
    const { titulo, descripcion, link } = req.body;
    const archivoRuta = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
        `INSERT INTO tareas (titulo, descripcion, link, archivo) VALUES (?, ?, ?, ?)`, 
        [titulo, descripcion, link || null, archivoRuta], 
        function(err) {
            if (err) return res.status(500).send("Error al crear la tarea.");
            res.json({ id: this.lastID, titulo, descripcion, link, archivo: archivoRuta });
        }
    );
});

// 3. EDITAR COMPLETA CON ARCHIVOS (UPDATE)
router.put('/:id', verificarLogin, upload.single('archivo'), (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, link } = req.body;
    
    if (req.file) {
        // ESCENARIO A: El usuario seleccionó un archivo nuevo para reemplazar el anterior
        const archivoRuta = `/uploads/${req.file.filename}`;
        db.run(
            `UPDATE tareas SET titulo = ?, descripcion = ?, link = ?, archivo = ? WHERE id = ?`,
            [titulo, descripcion, link, archivoRuta, id],
            function(err) {
                if (err) return res.status(500).send("Error al actualizar con archivo.");
                res.send("Tarea corregida con éxito.");
            }
        );
    } else {
        // ESCENARIO B: El usuario solo cambió textos (dejó el mismo archivo intacto)
        db.run(
            `UPDATE tareas SET titulo = ?, descripcion = ?, link = ? WHERE id = ?`,
            [titulo, descripcion, link, id],
            function(err) {
                if (err) return res.status(500).send("Error al actualizar texto.");
                res.send("Texto actualizado con éxito.");
            }
        );
    }
});

// 4. ELIMINAR ENTREGA (DELETE)
router.delete('/:id', verificarLogin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tareas WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).send("Error al eliminar.");
        res.send("Tarea eliminada.");
    });
});

export default router;