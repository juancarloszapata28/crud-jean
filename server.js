import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import tareasRoutes from './routes/tareas.js';

const app = express();

// 1. CONFIGURACIÓN DE MIDDLEWARES (Procesamiento de datos del formulario)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CARPETAS PÚBLICAS (Esto le da permiso al navegador para acceder a los archivos)
app.use(express.static('public')); // Permite cargar tu index.html y estilos
app.use('/uploads', express.static('uploads')); // ¡PERMITE VER Y DESCARGAR TUS TAREAS ADJUNTAS!

// 3. CONFIGURACIÓN DE SESIONES (Para mantener al estudiante logueado)
app.use(session({
    secret: 'clave_secreta_emmanuel_123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Puesto en false ya que trabajas en localhost
}));

// 4. CONEXIÓN DE LAS RUTAS DEL SISTEMA (API)
app.use('/api/auth', authRoutes); // Maneja el login y registro de usuarios
app.use('/api/tareas', tareasRoutes); // Maneja el CRUD de tareas (crear, leer, editar, borrar)

// 5. ENCENDIDO DEL SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor corriendo con éxito en la computadora.`);
    console.log(`🌍 Abre tu navegador en: http://localhost:${PORT}`);
    console.log(`==================================================`);
});