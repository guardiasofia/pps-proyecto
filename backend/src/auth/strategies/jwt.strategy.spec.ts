import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it } from 'vitest';
import { JwtStrategy, resolveJwtOptions } from './jwt.strategy.js';

const originalEnvironment = {
  jwtSecret: process.env.JWT_SECRET,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  jwtAlgorithm: process.env.JWT_ALGORITHM,
  jwtMaxAge: process.env.JWT_MAX_AGE,
};

function restoreEnvironment() {
  if (originalEnvironment.jwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalEnvironment.jwtSecret;
  if (originalEnvironment.jwtPublicKey === undefined) delete process.env.JWT_PUBLIC_KEY;
  else process.env.JWT_PUBLIC_KEY = originalEnvironment.jwtPublicKey;
  if (originalEnvironment.jwtAlgorithm === undefined) delete process.env.JWT_ALGORITHM;
  else process.env.JWT_ALGORITHM = originalEnvironment.jwtAlgorithm;
  if (originalEnvironment.jwtMaxAge === undefined) delete process.env.JWT_MAX_AGE;
  else process.env.JWT_MAX_AGE = originalEnvironment.jwtMaxAge;
}

describe('JwtStrategy', () => {
  afterEach(restoreEnvironment);

  it('rejects startup when no external verification key is configured', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_PUBLIC_KEY;

    expect(() => new JwtStrategy()).toThrow('JWT_PUBLIC_KEY o JWT_SECRET');
  });

  it('requires an exp claim', () => {
    process.env.JWT_SECRET = 'test-external-secret';
    const strategy = new JwtStrategy();
    const options = resolveJwtOptions();
    const tokenWithoutExpiration = jwt.sign({ sub: 1 }, 'test-external-secret');

    expect(() => strategy.validate({ sub: 'user-1' })).toThrow(UnauthorizedException);
    const verified = jwt.verify(tokenWithoutExpiration, options.secretOrKey, {
      algorithms: options.algorithms,
    });
    expect(() => strategy.validate(verified)).toThrow('debe incluir una expiración');
  });

  it('normalizes a valid externally-issued identity', () => {
    process.env.JWT_SECRET = 'test-external-secret';
    const strategy = new JwtStrategy();

    expect(strategy.validate({ sub: 3, exp: Math.floor(Date.now() / 1000) + 60, roles: ['RRHH'] }))
      .toMatchObject({ id: 3, rol: 'RRHH' });
  });

  it('rejects expired, old, and incorrectly signed JWTs', () => {
    process.env.JWT_SECRET = 'test-external-secret';
    process.env.JWT_MAX_AGE = '1s';
    const options = resolveJwtOptions();
    const expired = jwt.sign({ sub: 1 }, 'test-external-secret', { expiresIn: -1 });
    const oldButUnexpired = jwt.sign({ sub: 1, iat: Math.floor(Date.now() / 1000) - 5 }, 'test-external-secret', { expiresIn: 60 });
    const badSignature = jwt.sign({ sub: 1, exp: Math.floor(Date.now() / 1000) + 60 }, 'different-secret');

    expect(() => jwt.verify(expired, options.secretOrKey, {
      algorithms: options.algorithms,
      maxAge: options.jsonWebTokenOptions.maxAge,
    })).toThrow();
    expect(() => jwt.verify(oldButUnexpired, options.secretOrKey, {
      algorithms: options.algorithms,
      maxAge: options.jsonWebTokenOptions.maxAge,
    })).toThrow();
    expect(() => jwt.verify(badSignature, options.secretOrKey, {
      algorithms: options.algorithms,
      maxAge: options.jsonWebTokenOptions.maxAge,
    })).toThrow();
  });
});