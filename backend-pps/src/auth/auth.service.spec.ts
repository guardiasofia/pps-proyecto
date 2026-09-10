import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('should not implement local credentials authentication', () => {
    expect(AuthService.prototype.login).toBeUndefined();
    expect(AuthService.prototype.register).toBeUndefined();
  });
});
