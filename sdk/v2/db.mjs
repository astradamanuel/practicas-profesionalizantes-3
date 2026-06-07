import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

// 1. Cargamos la configuración para obtener la ruta de la DB
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// 2. Creamos la conexión de forma Sincrónica
// Esto crea una instancia única que vamos a exportar
export const db = new DatabaseSync(config.database.path);

console.log(`Conexión exitosa a: ${config.database.path} (usando DatabaseSync)`);