import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';

export interface AuthUser {
  id: string | number | null;
  email: string | null;
  username: string | null;
  rol: number | string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private accessToken: string | null = null;
  private user: AuthUser | null = null;
  private authorized = false;

  login(cuil: string, password: string) {
    return this.http.post<{ access_token: string; user: AuthUser }>(
      '/api/auth/login',
      { cuil: cuil.trim(), password },
    ).pipe(
      tap((response) => {
        this.accessToken = response.access_token;
        this.user = response.user;
        this.authorized = true;
      }),
    );
  }

  get token(): string | null {
    return this.accessToken;
  }

  get currentUser(): AuthUser | null {
    return this.user;
  }

  get isAuthorized() {
    return this.authorized;
  }

  logout() {
    this.accessToken = null;
    this.user = null;
    this.authorized = false;
  }
}
