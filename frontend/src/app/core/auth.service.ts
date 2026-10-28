import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';

export interface AuthUser {
  id: number | null;
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

  login(token: string) {
    const accessToken = token.trim();
    return this.http.get<{ user: AuthUser }>('/api/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).pipe(
      map((response) => ({ access_token: accessToken, user: response.user })),
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