AEW — Alexander Engineering Wiki

AEW (Alexander Engineering Wiki) es una wiki personal de ingeniería desarrollada para centralizar conocimiento técnico, documentación, experimentos, proyectos, notas de estudio y registros de depuración.

Tecnologías

* Next.js
* React
* TypeScript
* Supabase
* Vercel
* Tailwind CSS

Características actuales

* Autenticación de usuarios
* Persistencia local
* Sincronización remota mediante Supabase
* Realtime entre dispositivos
* Sistema de categorías
* Gestión de secciones
* Edición de contenido
* Dashboard principal
* Historial de desarrollo
* Soporte para múltiples dispositivos

Estado del proyecto

El proyecto se encuentra en desarrollo activo.

Actualmente:

* Funciona correctamente en localhost.
* La sincronización básica entre dispositivos está implementada.
* Persisten problemas de sincronización y refresco en producción (Vercel).
* Se están investigando condiciones de carrera relacionadas con React, Realtime y el proceso de hidratación del estado.

Problemas conocidos

Bug principal

En producción pueden ocurrir inconsistencias donde:

* Los documentos aparecen y desaparecen después de múltiples refresh.
* Algunos cambios requieren refrescar la página para reflejarse.
* El comportamiento no se reproduce en localhost.

Objetivo

Convertir AEW en una plataforma de documentación técnica robusta, local-first y preparada para crecimiento futuro.

Uso de Inteligencia Artificial

Este proyecto fue desarrollado por Alexander con asistencia de herramientas de Inteligencia Artificial como ChatGPT, Claude y Gemini.

La IA fue utilizada como herramienta de apoyo para:

* Arquitectura de software
* Revisión de código
* Depuración
* Generación de propuestas técnicas
* Documentación

Todas las decisiones de diseño, pruebas, implementación, integración y validación final fueron realizadas por el autor del proyecto.

Contribuciones

Las contribuciones son bienvenidas.

Si encuentras errores, tienes sugerencias o deseas colaborar en la estabilización del sistema de sincronización, abre un Issue o Pull Request.
## AI Disclosure

This project was developed by Alexander with assistance from AI tools including ChatGPT, Claude and Gemini.

AI was used for:
- Architecture discussions
- Debugging assistance
- Code reviews
- Documentation

Final implementation, testing, integration and project decisions were performed by the project author.
