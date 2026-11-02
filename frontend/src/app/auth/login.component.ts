import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="login-page">
      <section class="login-card">
        <div class="brand login-brand"><div class="brand-mark">C</div><div><strong>Concordia</strong><span>Municipalidad</span></div></div>
        <p class="eyebrow">Gestión interna</p>
        <h1>Ingresar al sistema</h1>
        <p class="login-copy">Accedé al panel de gestión municipal de Concordia.</p>
        <form (ngSubmit)="submit()">
          <label>Usuario (CUIL)<input name="cuil" [(ngModel)]="cuil" inputmode="numeric" autocomplete="username" maxlength="50" placeholder="20-12345678-9" required /></label>
          <label>Contraseña<input name="password" [(ngModel)]="password" type="password" autocomplete="current-password" maxlength="1024" required /></label>
          @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
          <button class="primary-button full" type="submit" [disabled]="!cuil.trim() || !password || busy">{{ busy ? 'Ingresando…' : 'Ingresar' }}</button>
        </form>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  readonly loggedIn = output<void>();
  cuil = '';
  password = '';
  error = '';
  busy = false;

  submit() {
    if (!this.cuil.trim() || !this.password || this.busy) return;
    this.busy = true;
    this.error = '';
    this.authService.login(this.cuil, this.password).subscribe({
      next: () => {
        this.busy = false;
        this.password = '';
        this.loggedIn.emit();
      },
      error: (response: { status?: number }) => {
        this.busy = false;
        this.error = response.status === 401 || response.status === 400
          ? 'CUIL o contraseña incorrectos, o cuenta no habilitada.'
          : 'No se pudo iniciar sesión. Verificá que el backend esté disponible.';
      },
    });
  }
}
