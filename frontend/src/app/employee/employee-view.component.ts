import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FichaEmpleado } from '../core/municipal.service';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="employee-portal">
      <article class="panel employee-welcome">
        <div class="employee-mark">C</div><p class="eyebrow">Datos personales</p>
        <h2>Autogestión de datos</h2>
        <p>Enviá una presentación con uno o varios cambios. Recursos Humanos revisará los valores actuales y solicitados antes de aprobar.</p>
        <button class="primary-button" (click)="newRequest.emit()"><span>+</span> Nueva solicitud</button>
      </article>
      <article class="employee-note"><span class="notice-icon">i</span><div><strong>Presentaciones pendientes</strong><span>Unificá teléfonos de contacto y agregá todos los datos en una sola solicitud antes de enviarla.</span></div></article>
    </section>

    @if (profile(); as employeeProfile) {
      <section class="profile-grid">
        <article class="panel profile-card"><p class="eyebrow">Ficha personal</p><h2>{{ employeeProfile.nombre }} {{ employeeProfile.apellido }}</h2><div class="profile-fields">
          <span><b>Legajo</b>{{ employeeProfile.legajo }}</span><span><b>DNI</b>{{ employeeProfile.dni || 'Sin cargar' }}</span><span><b>Fecha de nacimiento</b>{{ employeeProfile.nacimiento || 'Sin cargar' }}</span><span><b>Nacionalidad</b>{{ employeeProfile.nacionalidad || 'Sin cargar' }}</span><span><b>CUIL</b>{{ employeeProfile.cuil || 'Sin cargar' }}</span><span><b>Estado civil</b>{{ employeeProfile.estadoCivil || 'Sin cargar' }}</span><span><b>Función</b>{{ employeeProfile.funcion || 'Sin cargar' }}</span><span><b>Repartición</b>{{ employeeProfile.reparticion || 'Sin cargar' }}</span><span><b>Estado</b>{{ employeeProfile.estado || 'Sin cargar' }}</span>
        </div></article>
        <article class="panel profile-card"><p class="eyebrow">Cuenta de acceso</p><h2>Usuario vinculado</h2><div class="profile-fields"><span><b>Usuario</b>{{ $any(employeeProfile.cuenta)?.usunombre || 'Sin cargar' }} {{ $any(employeeProfile.cuenta)?.apenom || '' }}</span><span><b>Email de acceso</b>{{ $any(employeeProfile.cuenta)?.email || 'Sin cargar' }}</span><span><b>Rol</b>{{ $any(employeeProfile.cuenta)?.rol || 'Sin cargar' }}</span><span><b>Estado</b>{{ $any(employeeProfile.cuenta)?.estado || 'Sin cargar' }}</span></div></article>
        <article class="panel profile-card"><p class="eyebrow">Domicilio y contacto</p><div class="profile-fields"><span><b>Calle y número</b>{{ $any(employeeProfile.direccion)?.calle || 'Sin cargar' }} {{ $any(employeeProfile.direccion)?.callenro || '' }}</span><span><b>Barrio</b>{{ $any(employeeProfile.direccion)?.barrio || 'Sin cargar' }}</span><span><b>Ciudad</b>{{ $any(employeeProfile.direccion)?.ciudad || 'Sin cargar' }}</span><span><b>Provincia</b>{{ $any(employeeProfile.direccion)?.provincia || 'Sin cargar' }}</span><span><b>Teléfono 1</b>{{ $any(employeeProfile.direccion)?.tel1 || 'Sin cargar' }}</span><span><b>Teléfono 2</b>{{ $any(employeeProfile.direccion)?.tel2 || 'Sin cargar' }}</span><span><b>Email</b>{{ $any(employeeProfile.direccion)?.email || 'Sin cargar' }}</span></div></article>
        <article class="panel profile-card"><p class="eyebrow">Familiares</p>@for (family of employeeProfile.familiares; track $index) {<div class="readonly-row"><strong>{{ family['apellidos'] }} {{ family['nombres'] }}</strong><span>{{ family['parentesco'] }} · {{ family['tipo_documento'] }} {{ family['numero_documento'] }}</span></div>} @empty {<p class="catalog-note">Sin familiares registrados.</p>}</article>
        <article class="panel profile-card"><p class="eyebrow">Estudios</p>@for (study of employeeProfile.estudios; track $index) {<div class="readonly-row"><strong>{{ study['estudio'] || study['titulo'] }}</strong><span>{{ study['institucion'] }} · {{ study['f_graduado'] || 'Fecha no informada' }}</span></div>} @empty {<p class="catalog-note">Sin estudios registrados.</p>}</article>
        <article class="panel profile-card"><p class="eyebrow">Certificado de discapacidad</p><div class="readonly-row"><strong>{{ employeeProfile.cud ? 'CUD registrado' : 'Sin CUD registrado' }}</strong><span>{{ $any(employeeProfile.cud)?.fechavencimiento || '' }}</span></div></article>
      </section>
    }
  `,
})
export class EmployeeViewComponent {
  readonly profile = input<FichaEmpleado | null>(null);
  readonly newRequest = output<void>();
}
