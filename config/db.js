import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tareas.db', (err) => {
    if (err) {
        console.error("Error al conectar la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada con éxito.");
    }
});

// Crear tablas iniciales si no existen
db.serialize(() => {
    // 1. Tabla de Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // 2. Tabla de Tareas (con soporte para archivos y links)
    db.run(`CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descripcion TEXT
    )`, () => {
        // PARCHE EN VIVO: Si la base de datos ya existía, esto le agrega las columnas que faltan
        db.run(`ALTER TABLE tareas ADD COLUMN link TEXT`, () => {});
        db.run(`ALTER TABLE tareas ADD COLUMN archivo TEXT`, () => {});
    });
});

export default db;