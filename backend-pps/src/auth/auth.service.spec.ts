describe('AuthService', () => {
  it('exposes the login operation', async () => {
    const { AuthService } = await import('./auth.service.js');

    expect(typeof AuthService.prototype.login).toBe('function');
  });
});
