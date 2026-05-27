import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const router = express.Router();

// REGISTRAR USUARIO (Cifrando contraseña)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const passwordCifrada = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO usuarios (username, password) VALUES (?, ?)`, [username, passwordCifrada], (err) => {
            if (err) return res.status(400).send("El usuario ya existe.");
            res.send("Usuario registrado con éxito de forma segura.");
        });
    } catch {
        res.status(500).send("Error en el servidor.");
    }
});

// INICIAR SESIÓN
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM usuarios WHERE username = ?`, [username], async (err, usuario) => {
        if (err || !usuario) return res.status(401).send("Usuario o contraseña incorrectos.");
        
        const coinciden = await bcrypt.compare(password, usuario.password);
        if (coinciden) {
            req.session.usuarioLogueado = usuario.username;
            res.send("Inicio de sesión correcto. ¡Bienvenido!");
        } else {
            res.status(401).send("Usuario o contraseña incorrectos.");
        }
    });
});

// CERRAR SESIÓN
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.send("Sesión cerrada.");
});

export default router;