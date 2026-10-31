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
          <label>Token de acceso externo<textarea name="token" [(ngModel)]="token" rows="4" autocomplete="off" required></textarea></label>
          @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
          <button class="primary-button full" type="submit" [disabled]="!token.trim() || busy">{{ busy ? 'Validando…' : 'Validar token' }}</button>
        </form>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  readonly loggedIn = output<void>();
  token = '';
  error = '';
  busy = false;

  submit() {
    if (!this.token.trim() || this.busy) return;
    this.busy = true;
    this.error = '';
    this.authService.login(this.token.trim()).subscribe({
      next: () => {
        this.busy = false;
        this.token = '';
        this.loggedIn.emit();
      },
      error: () => {
        this.busy = false;
        this.error = 'El token no es válido o expiró. Solicitá uno vigente al proveedor de identidad.';
      },
    });
  }
}
