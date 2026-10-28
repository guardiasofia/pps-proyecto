import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empleado, Solicitud } from '../core/municipal.service';

@Component({
  selector: 'app-hr-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (section() === 'Resumen') {
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-top"><span>Personal activo</span><span class="metric-icon blue">+</span></div><strong>{{ activeEmployees().length }}</strong><small>Legajos en estado activo</small></article>
        <article class="metric-card"><div class="metric-top"><span>Solicitudes abiertas</span><span class="metric-icon amber">◷</span></div><strong>{{ requests().length }}</strong><small>Para revisión de RRHH</small></article>
        <article class="metric-card"><div class="metric-top"><span>Distribuciones</span><span class="metric-icon green">↗</span></div><strong>{{ distribution().length }}</strong><small>Áreas con personal</small></article>
      </div>
      <div class="content-grid">
        <section class="panel requests-panel"><div class="panel-heading"><div><p class="eyebrow">Actividad reciente</p><h2>Últimas solicitudes</h2></div><button class="text-button" (click)="navigate.emit('Solicitudes')">Ver todas <span>→</span></button></div><div class="request-list">
          @for (request of requests(); track request.id) {<div class="request-row"><div class="request-symbol">{{ (request.empleadoNombre || 'E').charAt(0) }}</div><div class="request-copy"><strong>{{ request.empleadoNombre || request.solicitante }}</strong><span>{{ changeEntries(request).length }} campos · #{{ request.id }}</span></div><span class="request-date">{{ request.fecha }}</span><span class="tag">{{ request.estado }}</span></div>}
        </div></section>
        <section class="panel insight-panel"><p class="eyebrow">Distribución del personal activo</p><h2>Por repartición</h2><div class="donut" [style.background]="distributionGradient()"><div><strong>{{ activeEmployees().length }}</strong><span>personas</span></div></div><div class="legend">@for (group of distribution(); track group.name) {<span><i [style.backgroundColor]="group.color"></i>{{ group.name }} <b>{{ group.percentage }}%</b></span>}</div></section>
      </div>
    } @else if (section() === 'Personal') {
      <section class="panel directory-panel"><div class="panel-heading"><div><p class="eyebrow">Directorio municipal</p><h2>Personal</h2></div><div class="search-box"><span>⌕</span><input [ngModel]="search()" (ngModelChange)="searchChange.emit($event)" placeholder="Buscar por nombre o área" /></div></div><div class="table-wrap"><table><thead><tr><th>PERSONA</th><th>REPARTICIÓN</th><th>FUNCIÓN</th><th>ESTADO</th></tr></thead><tbody>@for (employee of filteredEmployees(); track employee.id) {<tr><td><div class="person-cell"><div class="mini-avatar">{{ employee.nombre.charAt(0) }}{{ employee.apellido.charAt(0) }}</div><strong>{{ employee.nombre }} {{ employee.apellido }}</strong></div></td><td>{{ employee.reparticion }}</td><td>{{ employee.funcion }}</td><td><span class="tag active-tag">{{ employee.estado }}</span></td></tr>}</tbody></table></div></section>
    } @else if (section() === 'Solicitudes') {
      <section class="panel directory-panel inbox-panel"><div class="panel-heading"><div><p class="eyebrow">Bandeja de RRHH</p><h2>Solicitudes pendientes</h2><p class="inbox-summary">Revisá los cambios antes de aprobarlos.</p></div><button class="refresh-button" (click)="refresh.emit()"><span aria-hidden="true">↻</span> Actualizar</button></div>@if (approvalError()) { <p class="form-error">{{ approvalError() }}</p> }<div class="request-list request-inbox">@for (request of requests(); track request.id) {<article class="request-row"><div class="request-symbol" aria-hidden="true">↻</div><div class="request-copy"><strong>{{ request.empleadoNombre || 'Empleado' }}</strong><span class="request-id">{{ request.solicitante }} · {{ request.empleadoActivo ? 'Activo' : 'Inactivo' }} · #{{ request.id }}</span></div><div class="request-changes"><span class="changes-label">Datos a modificar</span>@for (change of changeEntries(request); track change.label) {<span><b>{{ change.label }}</b>{{ change.value }}</span>}</div><div class="request-meta"><span class="request-date"><span aria-hidden="true">◷</span> {{ request.fecha }}</span><span class="tag"><span aria-hidden="true">!</span> {{ request.estado }}</span><button class="approve-button" [disabled]="approvingId() === request.id" (click)="approve.emit(request)"><span aria-hidden="true">✓</span> {{ approvingId() === request.id ? 'Aprobando...' : 'Aprobar' }}</button></div></article>} @empty {<p class="empty-copy">No hay solicitudes pendientes.</p>}</div></section>
    } @else if (section() === 'Reportes') {
      <section class="report-grid"><article class="panel report-card request-report-card"><div class="report-icon amber-icon">S</div><p class="eyebrow">Gestión de RRHH</p><h2>Exportar solicitud</h2><p>Generá un PDF listo para imprimir con el detalle del cambio solicitado.</p><select [ngModel]="reportId()" (ngModelChange)="reportIdChange.emit($event)"><option [ngValue]="null">Elegir solicitud</option>@for (request of requests(); track request.id) {<option [ngValue]="request.id">{{ request.empleadoNombre || request.solicitante }} · #{{ request.id }}</option>}</select><button class="primary-button full" [disabled]="reportId() === null || reportLoading()" (click)="downloadReport.emit()">{{ reportLoading() ? 'Generando...' : 'Exportar / imprimir PDF' }}</button></article></section>
      @if (reportError()) { <p class="form-error">{{ reportError() }}</p> }
    }
  `,
})
export class HrViewComponent {
  readonly section = input.required<string>();
  readonly employees = input<Empleado[]>([]);
  readonly activeEmployees = input<Empleado[]>([]);
  readonly requests = input<Solicitud[]>([]);
  readonly distribution = input<Array<{ name: string; count: number; percentage: number; color: string }>>([]);
  readonly distributionGradient = input('');
  readonly filteredEmployees = input<Empleado[]>([]);
  readonly search = input('');
  readonly approvalError = input('');
  readonly approvingId = input<number | string | null>(null);
  readonly reportId = input<number | string | null>(null);
  readonly reportError = input('');
  readonly reportLoading = input(false);
  readonly changeEntries = input.required<(request: Solicitud) => Array<{ label: string; value: string }>>();
  readonly navigate = output<string>();
  readonly searchChange = output<string>();
  readonly refresh = output<void>();
  readonly approve = output<Solicitud>();
  readonly reportIdChange = output<number | string | null>();
  readonly downloadReport = output<void>();
}
