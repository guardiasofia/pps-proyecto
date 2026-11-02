import 'dotenv/config';
import { randomBytes, scrypt } from 'node:crypto';
import { Client } from 'pg';

function promptValue(message, masked = false) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Ejecutá este comando desde una terminal interactiva');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const cleanup = () => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          cleanup();
          reject(new Error('Operación cancelada'));
          return;
        }
        if (character === '\r' || character === '\n') {
          cleanup();
          resolve(value);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write('\b \b');
          }
          continue;
        }
        value += character;
        process.stdout.write(masked ? '*' : character);
      }
    };

    process.stdout.write(message);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onData);
  });
}

function createPasswordHash(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(
        `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`,
      );
    });
  });
}

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? 'pps_user',
  password: process.env.DB_PASSWORD ?? 'pps_password',
  database: process.env.DB_NAME ?? 'pps_db',
});
let connected = false;

try {
  const enteredCuil = (await promptValue('CUIL de la cuenta: ')).trim();
  if (!/^[0-9\s.-]+$/.test(enteredCuil)) {
    throw new Error(
      'El CUIL solo puede contener dígitos, espacios, puntos y guiones',
    );
  }
  const cuil = enteredCuil.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cuil)) {
    throw new Error('El CUIL debe contener 11 dígitos');
  }

  const password = await promptValue(
    'Nueva contraseña (mínimo 12 caracteres): ',
    true,
  );
  const confirmation = await promptValue('Repetí la contraseña: ', true);
  if (password.length < 12) {
    throw new Error('La contraseña debe tener al menos 12 caracteres');
  }
  if (password !== confirmation) {
    throw new Error('Las contraseñas no coinciden');
  }

  await client.connect();
  connected = true;
  const result = await client.query(
    `SELECT u.usucodigo
     FROM public.empleados e
     JOIN public.usuarioslegajos ul
       ON ul.legajo = e.legajo AND ul.estado = 'AC'
     JOIN public.usuarios u
       ON u.usucodigo = ul.usucodigo AND u.estado = 'AC'
     WHERE e.estado = 'AC'
       AND regexp_replace(e.cuil, '[^0-9]', '', 'g') = $1`,
    [cuil],
  );
  if (result.rowCount !== 1) {
    throw new Error(
      result.rowCount === 0
        ? 'No hay una cuenta activa vinculada de forma única a ese CUIL'
        : 'Hay varias cuentas activas vinculadas a ese CUIL; corregí la asociación antes de continuar',
    );
  }

  const passwordHash = await createPasswordHash(password);
  await client.query(
    'UPDATE public.usuarios SET password_hash = $1 WHERE usucodigo = $2',
    [passwordHash, result.rows[0].usucodigo],
  );
  console.log('Contraseña asignada correctamente.');
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'No se pudo asignar la contraseña',
  );
  process.exitCode = 1;
} finally {
  if (connected) await client.end();
}
