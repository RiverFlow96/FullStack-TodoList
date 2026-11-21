# Pendientes y hallazgos del proyecto

Este archivo reúne el trabajo pendiente para convertir FullStack TodoList en una demo de portafolio verificable. Las casillas indican trabajo por hacer; no representan resultados ya comprobados.

## Hallazgos de la revisión del código

Revisión estática realizada el 21 de noviembre de 2026. Estos hallazgos deben confirmarse con pruebas de integración después de instalar las dependencias.

1. **Resuelto — actualización de contraseñas:** `backend/apps/accounts/serializers.py` aplica `set_password()` al crear y actualizar usuarios, y ejecuta los validadores de Django. Las pruebas comprueban el hash y el inicio de sesión con la contraseña nueva.
2. **Resuelto — aislamiento entre usuarios:** `backend/apps/tasks/serializers.py` limita el campo `group` a grupos del propietario de la tarea. Las pruebas comprueban creación y edición con un grupo ajeno.
3. **Alto — errores de API ocultos:** varias funciones de `frontend/src/api/axios.js` capturan errores y devuelven `undefined` o una lista vacía. `frontend/src/store/useStore.js` puede interpretar esas respuestas como operaciones exitosas o como ausencia de datos. Propagar los errores y mostrar estados de fallo sin alterar el estado local como si la petición hubiera funcionado.
4. **Medio — estado de autenticación inconsistente:** `login()` en `frontend/src/api/axios.js` devuelve `true`, pero `useAuthStore.login()` espera `data.access`. El token se guarda en `localStorage`, mientras que `token` en Zustand queda indefinido. Unificar el contrato de retorno y probar el inicio y la renovación de sesión.
5. **Resuelto — correo propio:** `validate_email()` excluye la instancia actual al comprobar duplicados. La prueba de actualización con el mismo correo pasa.

**Estado de verificación (21 de noviembre de 2026):** pytest pasó 77 pruebas con 55 % de cobertura global del backend; Vitest pasó 30 pruebas con 97.61 % de cobertura en los archivos medidos. Ruff, lint y build pasaron. La CI ya incluye ambas suites, pero todavía no se verificó una ejecución en GitHub Actions. `npm audit --omit=dev` informó 10 avisos en dependencias de producción (9 altos y 1 moderado). Los cambios locales previos en `frontend/src/App.jsx` y `localhost.har` permanecen intactos.

## Prioridad crítica

- [ ] Publicar una demo funcional: Desplegar frontend, backend y PostgreSQL, configurar HTTPS y verificar que todos los flujos funcionen desde el navegador.
- [ ] Crear acceso de demostración: Permitir que un reclutador pruebe la aplicación sin proporcionar información personal, mediante una cuenta demo o datos temporales.
- [ ] Auditar seguridad y autenticación: Verificar expiración y renovación de JWT, almacenamiento seguro de tokens, CORS, CSRF y permisos. El aislamiento entre tareas y grupos ya tiene pruebas.
- [ ] Revisar avisos de dependencias de producción: Analizar y corregir los 10 avisos reportados por `npm audit --omit=dev`, actualizando paquetes de forma controlada y repitiendo pruebas, lint y build.
- [ ] Verificar CI/CD: Ejecutar los workflows existentes, corregir fallos y asegurar que pruebas, lint y compilación bloqueen cambios defectuosos.
- [x] Comprobar pruebas y cobertura reales: pytest y Vitest ejecutados; resultados actualizados en los README. El hallazgo 5 quedó corregido.

## Alta prioridad

- [ ] Mejorar el diseño visual: Unificar tipografía, colores, espaciado, iconografía, estados de carga y diseño responsive.
- [ ] Añadir búsqueda, filtros y ordenación: Buscar tareas por texto y filtrar por grupo, estado, prioridad o fecha cuando esos campos existan.
- [ ] Implementar prioridades y fechas límite: Añadir prioridades, vencimientos y avisos visuales de tareas atrasadas.
- [ ] Mejorar el asistente de IA: Generar sugerencias contextuales con validación de respuestas, límites de uso y control de errores.
- [ ] Crear documentación profesional: Actualizar README en inglés y español, incluir capturas reales, arquitectura, demo, instalación y características.
- [ ] Añadir tests end-to-end: Probar registro, inicio de sesión, creación y edición de tareas, grupos y rutas protegidas mediante Playwright. Cubrir los hallazgos 3 y 4.

## Prioridad media

- [ ] Incorporar Docker Compose: Preparar un entorno reproducible con frontend, backend y PostgreSQL, con healthchecks y variables de entorno.
- [ ] Añadir observabilidad: Configurar registros estructurados, seguimiento de errores y endpoints de salud.
- [ ] Mejorar accesibilidad: Optimizar navegación por teclado, etiquetas, contraste, foco y compatibilidad con lectores de pantalla.
- [ ] Introducir paginación y optimización: Evitar cargar demasiadas tareas a la vez, revisar consultas SQL y optimizar el rendimiento frontend.
- [ ] Agregar categorías o etiquetas: Permitir clasificar tareas de manera flexible más allá de los grupos existentes.
- [ ] Habilitar internacionalización: Ofrecer interfaz en español e inglés, ideal para demostrar el proyecto a reclutadores internacionales.

## Mejoras avanzadas

- [ ] Crear panel de productividad: Mostrar tareas pendientes, completadas, vencidas y métricas por período.
- [ ] Añadir subtareas y recurrencias: Permitir listas de subtareas y tareas repetitivas con reglas configurables.
- [ ] Implementar notificaciones: Recordatorios de fechas límite por la aplicación o correo electrónico.
- [ ] Incorporar funciones de IA más avanzadas: Sugerencias de planificación, descomposición de objetivos en tareas y priorización asistida.
- [ ] Preparar una presentación profesional: Crear GIF o vídeo corto, capturas auténticas y un caso de estudio para LinkedIn y tu portafolio.
