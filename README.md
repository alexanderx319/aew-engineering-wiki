# AEW - Alexander Engineering Wiki

AEW es una wiki de ingeniería personal desarrollada con:

- Next.js
- TypeScript
- Supabase
- Vercel

## Objetivo

Crear una wiki técnica personal con sincronización entre dispositivos, almacenamiento remoto y funcionamiento local-first.

## Estado actual

### Funciona

- Login
- Persistencia local
- Supabase
- Realtime
- Sincronización básica

### Bugs conocidos

- En producción (Vercel) existen inconsistencias al refrescar la página.
- Algunos estados aparecen/desaparecen después de múltiples refresh.
- Localhost funciona correctamente.
- La sincronización entre dispositivos aún requiere estabilización.

## Cómo ejecutar

```bash
npm install
npm run dev
