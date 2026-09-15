# 📚 Sistema de Autogestión de Datos - PPS

Proyecto de **Práctica Profesional Supervisada** de la Licenciatura en Sistemas (UNER).  
El objetivo es desarrollar un sistema web para la **Municipalidad de Concordia** que permita la autogestión de actualización de datos de empleados, con validación y aprobación por parte de Recursos Humanos.

---
## 👥 Desarrolladora
- **Sofía Guardia** (@guardiasofia)  

## 🎯 Objetivos
- Implementar un sistema modular con **NestJS (backend)** y **Angular (frontend)**.  
- Gestionar datos de empleados en **PostgreSQL**.  
- Incorporar autenticación y autorización mediante **JWT**.  
- Permitir carga y aprobación de solicitudes de actualización de datos.  
- Generar reportes en formato PDF.

---

## 🚀 Tecnologías utilizadas
- **Backend:** NestJS (Node.js, TypeScript)  
- **Frontend:** Angular  
- **Base de datos:** PostgreSQL  
- **Contenedores:** Docker + docker-compose  
- **Administración:** pgAdmin  

---

## 📂 Estructura del proyecto
- `frontend/` → Interfaces y componentes visuales  
- `backend/` → Lógica de negocio y API REST  
- `pps_db.sql` → Script de roles, permisos y solicitudes  
- `docker-compose.yml` → Configuración de servicios y contenedores  

## ⚙️ Instalación y ejecución
1. Clonar el repositorio:
   ```bash
   git clone https://gitlab.com/guardiasofia/pps-proyecto.git

2. Instalar dependencias en cada módulo:
   ```bash
    cd backend && npm install
    cd ../frontend && npm install

3. Levantar los servicios con Docker:
   ```bash
    docker-compose up

4. Acceder a la aplicación en http://localhost:3000

## 📜 Licencia
- Este proyecto es de uso académico y no posee licencia comercial.

