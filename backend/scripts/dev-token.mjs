// Genera un JWT de PRUEBA para desarrollo local (no usar en producción).
// Uso:  npm run token:rrhh   |   npm run token:empleado   |   npm run token:ana
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const USUARIOS = {
  rrhh: { sub: 1, rol: 'RRHH', username: 'Admin RRHH', email: 'admin@pps.com' },
  empleado: { sub: 3, rol: 'EMPLEADO', username: 'Carlos Gómez', email: 'empleado@pps.com' },
  ana: { sub: 2, rol: 'EMPLEADO', username: 'Ana García', email: 'ana@pps.com' },
};

const quien = process.argv[2] ?? 'rrhh';
const payload = USUARIOS[quien];
if (!payload) {
  console.error(`Usuario desconocido: ${quien}. Opciones: ${Object.keys(USUARIOS).join(', ')}`);
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Este script es solo para desarrollo.');
  process.exit(1);
}
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Definí JWT_SECRET en backend/.env (HS256). Este script no soporta JWT_PUBLIC_KEY.');
  process.exit(1);
}
console.log(jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' }));
