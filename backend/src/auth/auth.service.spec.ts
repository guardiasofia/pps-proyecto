describe('AuthService', () => {
  it('authenticates an active account by normalized CUIL and issues a JWT', async () => {
    const { AuthService } = await import('./auth.service.js');
    const { hashPassword } = await import('./password.js');
    const jwt = await import('jsonwebtoken');
    const passwordHash = await hashPassword('una-clave-segura-123');
    const dataSource = {
      query: vi.fn().mockResolvedValue([
        {
          usucodigo: 2,
          username: 'Ana García',
          email: 'ana@example.org',
          idrol: 2,
          descripcion: 'empleado',
          password_hash: passwordHash,
        },
      ]),
    };
    const previousSecret = process.env.JWT_SECRET;
    const previousPublicKey = process.env.JWT_PUBLIC_KEY;
    const previousPrivateKey = process.env.JWT_PRIVATE_KEY;
    const previousAlgorithm = process.env.JWT_ALGORITHM;
    const previousMaxAge = process.env.JWT_MAX_AGE;
    delete process.env.JWT_PUBLIC_KEY;
    delete process.env.JWT_PRIVATE_KEY;
    process.env.JWT_SECRET = 'test-login-secret';
    process.env.JWT_ALGORITHM = 'HS256';
    process.env.JWT_MAX_AGE = '1h';

    try {
      const result = await new AuthService(dataSource).login(
        '20-30123456-8',
        'una-clave-segura-123',
      );
      const payload = jwt.default.verify(
        result.access_token,
        'test-login-secret',
      );
      const { JwtStrategy } = await import('./strategies/jwt.strategy.js');
      const authenticatedUser = new JwtStrategy().validate(payload);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('usuarioslegajos'),
        ['20301234568'],
      );
      expect(dataSource.query.mock.calls[0][0]).toContain(
        'NULLIF(BTRIM(u.usunombre), \'\')',
      );
      expect(result.user).toMatchObject({
        id: '2',
        rol: '2',
        username: 'Ana García',
      });
      expect(payload).toMatchObject({ sub: '2', rol: '2', iss: 'pps-local' });
      expect(authenticatedUser).toMatchObject({ id: '2', rol: 'EMPLEADO' });
    } finally {
      if (previousSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousSecret;
      if (previousPublicKey === undefined) delete process.env.JWT_PUBLIC_KEY;
      else process.env.JWT_PUBLIC_KEY = previousPublicKey;
      if (previousPrivateKey === undefined) delete process.env.JWT_PRIVATE_KEY;
      else process.env.JWT_PRIVATE_KEY = previousPrivateKey;
      if (previousAlgorithm === undefined) delete process.env.JWT_ALGORITHM;
      else process.env.JWT_ALGORITHM = previousAlgorithm;
      if (previousMaxAge === undefined) delete process.env.JWT_MAX_AGE;
      else process.env.JWT_MAX_AGE = previousMaxAge;
    }
  }, 20000);

  it('rejects users without exactly one active employee link', async () => {
    const { AuthService } = await import('./auth.service.js');
    const service = new AuthService({ query: vi.fn().mockResolvedValue([]) });

    await expect(
      service.login('20-30123456-8', 'una-clave-segura-123'),
    ).rejects.toThrow('CUIL o contraseña incorrectos');
  }, 20000);

  it('normalizes JWT profile claims', async () => {
    const { AuthService } = await import('./auth.service.js');
    const service = new AuthService({ query: vi.fn() });

    expect(
      service.getProfile({
        sub: 42,
        roles: ['RRHH'],
        userName: 'María',
      }),
    ).toMatchObject({ id: '42', rol: 'RRHH', username: 'María' });
  });
});
