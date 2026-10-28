describe('AuthService', () => {
  it('exposes profile normalization without issuing credentials', async () => {
    const { AuthService } = await import('./auth.service.js');

    expect(typeof AuthService.prototype.getProfile).toBe('function');
    expect(Object.getOwnPropertyNames(AuthService.prototype)).not.toContain(
      'login',
    );
    expect(
      new AuthService().getProfile({
        sub: 42,
        roles: ['RRHH'],
        userName: 'María',
      }),
    ).toMatchObject({ id: 42, rol: 'RRHH', username: 'María' });
  });
});
