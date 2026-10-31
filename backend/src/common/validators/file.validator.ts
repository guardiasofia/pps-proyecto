// backend/src/common/validators/file.validator.ts
import { BadRequestException } from '@nestjs/common';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MiB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
export function validateFileUpload(
  filename: string,
  mimeType: string,
  buffer: Buffer,
): void {
  //  Validar tamaño
  if (buffer.length > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `El archivo excede el límite de 5 MiB (tamaño: ${(buffer.length / 1024 / 1024).toFixed(2)} MiB)`,
    );
  }
  //  Validar MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new BadRequestException(
      `Tipo de archivo no permitido: ${mimeType}. Solo se aceptan: ${ALLOWED_MIME_TYPES.join(', ')}`,
    );
  }
  // ✅ Validar extensión
  const ext = filename.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new BadRequestException(
      `Extensión de archivo no permitida: ${ext}. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`,
    );
  }
  //  Validar firma de archivo (magic bytes)
  validateFileMagicBytes(buffer, mimeType);
  //  Sanitizar nombre de archivo
  if (!/^[\w\-. ]+$/.test(filename)) {
    throw new BadRequestException(
      'El nombre del archivo contiene caracteres no permitidos',
    );
  }
}
function validateFileMagicBytes(buffer: Buffer, mimeType: string): void {
  const magicBytes = buffer.slice(0, 8);
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  };
  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) return;
  const isValid = expectedSignatures.some((sig) =>
    sig.every((byte, i) => magicBytes[i] === byte),
  );
  if (!isValid) {
    throw new BadRequestException(
      `El archivo no corresponde al tipo MIME declarado: ${mimeType}`,
    );
  }
}