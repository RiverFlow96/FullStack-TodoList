# Plan de trabajo pendiente

Lista operativa para preparar FullStack TodoList como una demo de portafolio fiable. Una tarea se marca completa solo cuando cumple el criterio de aceptación indicado y se verifica en el entorno correspondiente.

## Estado actual

- Commits publicados en `origin/main`: `a46a96b` (seguridad de cuentas y grupos), `b07f32d` (actualización de dependencias y CI con Bun), `f1b7ffa` (propagación de errores de API) y `ad967ea` (estado de login y renovación de tokens).
- Verificación local del estado actual (2026-11-22): pytest 77/77; Vitest 30/30; Ruff, ESLint, build frontend y `manage.py check` terminan correctamente. Cobertura observada: backend 55 % global; el porcentaje previo de frontend medía solo archivos importados por la suite, no toda la aplicación.
- C-04 se completó: `bun audit` no encuentra vulnerabilidades; `bun.lock` fija dependencias transitivas parcheadas, CI usa instalación congelada con Bun y se retiró `package-lock.json` para conservar una sola fuente de resolución.
- Pendientes locales previos detectados: cambios en `frontend/src/App.jsx` y `localhost.har` sin seguimiento. No forman parte de las tareas de este plan.

## Prioridad crítica

### C-01. Publicar y validar una demo funcional

**Estado (2026-11-22):** Render no tiene servicio del TodoList. Por autorización del usuario, `FreeMarket` fue pausado para liberar el límite de proyectos gratuitos y `RiverFlow96's TodoList` (`nelokvubhqqrfvblwlzx`) está `ACTIVE_HEALTHY` en Supabase. Sus 12 tablas Django estaban vacías y `django_migrations` sin registros; hay que verificar/adoptar ese esquema antes de ejecutar migraciones normales. `render.yaml` está publicado en `461bf89`: el Blueprint propone solo un backend gratuito en Render, sin base Render, y requiere `DATABASE_URL` manual. El plan aún no se aplicó. RLS ya está activado en las 12 tablas; falta introducir `DATABASE_URL` (pooler Supavisor en modo sesión) como secreto en Render y verificar la adopción de migraciones, CORS y flujos en navegador. [Plan Render](https://dashboard.render.com/blueprint/exs-dc188459fdbs73a3e6hg/sync/exe-dc18bhqjnfac7381ejv0).

**Objetivo:** ofrecer una URL pública y estable para que un reclutador pruebe la aplicación por navegador.

**Trabajo:** desplegar frontend, backend y PostgreSQL; configurar variables de entorno, HTTPS, dominios permitidos, CORS y CSRF; ejecutar migraciones en el despliegue; comprobar navegación directa en rutas SPA.

**Aceptación:** la home y las rutas profundas cargan por HTTPS; registro, login, cierre de sesión, CRUD de tareas, grupos y perfil funcionan en navegador; los errores de backend y CORS están ausentes en consola; datos sobreviven a un redeploy.

### C-02. Proporcionar un acceso de demostración seguro

**Objetivo:** permitir explorar la app sin que visitantes creen cuentas con datos personales.

**Trabajo:** escoger entre credenciales demo compartidas o aprovisionamiento temporal por visitante. Aislar y reiniciar datos demo, evitar que una persona vea o borre los datos de otra y publicar las instrucciones de acceso junto a la demo.

**Aceptación:** un visitante puede entrar siguiendo instrucciones públicas, crear y modificar datos de prueba y no puede acceder a cuentas ajenas; el mecanismo no expone secretos administrativos ni datos reales.

### C-03. Completar la revisión de seguridad y autenticación

**Objetivo:** cerrar el ciclo de sesión y verificar las fronteras de seguridad de la API.

**Trabajo:** unificar el contrato de retorno de login entre Axios y Zustand; revisar renovación y rotación de refresh JWT, persistencia del refresh rotado y revocación; revisar el uso de `localStorage` para tokens y documentar/implementar el modelo elegido; comprobar expiración, CORS, CSRF, rutas protegidas, permisos y aislamiento de usuarios.

**Aceptación:** pruebas de API y cliente cubren login válido e inválido, access expirado, refresh válido/expirado, rotación, logout y solicitudes concurrentes; las rutas privadas rechazan sesión inválida; ningún usuario puede leer o modificar datos de otro; orígenes no autorizados son rechazados.

**Resuelto parcialmente:** contraseñas con hash/validación y propiedad de grupos tienen pruebas desde `a46a96b`; el contrato de login/refresh y la persistencia del refresh rotado se corrigieron en `ad967ea`. Mantenerlos como regresiones dentro de esta revisión integral. La auditoría completa de expiración, almacenamiento, CORS, CSRF y concurrencia aún está pendiente.

**Hallazgo y mitigación Supabase (2026-11-22):** se habilitó RLS en las 12 tablas Django de `public` mediante la migración `enable_rls_on_django_public_tables`. No se crearon políticas: el proyecto usa la API Django, no Supabase Auth; el rol `postgres` usado por Django tiene `BYPASSRLS=true`, mientras `anon` y `authenticated` no lo tienen. La consulta de verificación confirmó RLS activo y cero políticas en cada tabla. Supabase ya no reporta RLS desactivado; informa 12 avisos `rls_enabled_no_policy` de nivel informativo, esperados por esta configuración. Si el frontend accediera directamente a la Data API o se integra Supabase Auth, diseñar políticas por usuario antes de habilitar esos flujos. [Guía RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Aviso del linter](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

### C-04. Resolver los avisos de dependencias usando Bun

**Objetivo:** actualizar las dependencias afectadas sin introducir cambios incompatibles y usar Bun como herramienta del frontend.

**Trabajo:** obtener una auditoría que funcione con Bun o una fuente de avisos verificable; identificar paquetes directos y transitivos, rangos corregidos y cambios mayores; actualizar primero los paquetes compatibles; revisar `package.json` y `bun.lock`; reemplazar el paso npm de CI por instalación reproducible con Bun y decidir si se elimina `package-lock.json` para mantener una sola fuente de resolución.

**Aceptación:** `bun audit` no informa vulnerabilidades conocidas altas o críticas en dependencias alcanzables de producción, o cada excepción tiene justificación explícita; instalación limpia con lockfile congelado, pruebas, lint y build pasan; CI usa Bun y el lockfile elegido; no se aplican actualizaciones mayores sin revisión de compatibilidad.

**Estado:** completado el 2026-11-22. Se añadieron overrides para `@babel/core` (>=7.29.6), `baseline-browser-mapping` (>=2.11.0) y `browserslist` (>=4.28.7), versiones que corrigen los avisos observados. `bun audit` informó “No vulnerabilities found”; `bun install --frozen-lockfile` pasó. Vitest 30/30, pytest 77/77, Ruff, lint, build y `manage.py check` pasaron. El lint conserva dos advertencias de archivos generados de cobertura y Vite advierte que el chunk principal supera 500 kB.

### C-05. Validar CI/CD en el proveedor

**Objetivo:** que los cambios defectuosos no se integren y que las instrucciones de CI funcionen en un runner limpio.

**Trabajo:** confirmar una ejecución real de `.github/workflows/ci.yml`; revisar pasos frontend y backend, versiones de runtimes, instalación reproducible, migraciones y permisos mínimos del workflow; verificar también CodeQL.

**Aceptación:** ejecución verde en GitHub Actions desde `main` y en un pull request; pytest, Vitest, Ruff, lint, build y `manage.py check` aparecen como controles requeridos; CodeQL completa análisis sin errores operativos.

**Estado:** CI y CodeQL completaron correctamente en `main` para `18f9599` y `fb25555` (22 de noviembre de 2026). El CI actualizado, incluido el job E2E, también pasó en [`2e2f506`](https://github.com/RiverFlow96/FullStack-TodoList/actions/runs/44991588752). La integración GitHub no permite consultar protección de ramas (HTTP 403) y no hay una ejecución reciente de PR con el workflow actual; falta confirmar ambos puntos antes de cerrar la tarea.

### C-06. Mantener pruebas y cobertura basadas en resultados reales

**Objetivo:** conservar evidencia actual y reproducible de calidad.

**Trabajo:** correr pytest y Vitest en CI; generar reportes en CI como artefactos; evitar que archivos generados de cobertura se mezclen con cambios de código; revisar cobertura por módulo antes de fijar umbrales.

**Aceptación:** ambos conjuntos pasan desde checkout limpio; reportes descargables muestran fecha/commit; README describe claramente que el 55 % backend es global y que el porcentaje frontend corresponde solo a archivos importados por pruebas.

**Estado:** completado el 2026-11-22. CI pasó en [fb25555](https://github.com/RiverFlow96/FullStack-TodoList/actions/runs/44989126291) y publicó `backend-coverage-fb25555115ae209f407c8abf9084ce033cebec93` (XML y HTML) y `frontend-coverage-fb25555115ae209f407c8abf9084ce033cebec93` (HTML y LCOV); ambos artefactos aparecen disponibles en GitHub. La suite local pasó pytest 77/77 con 55 % global y Vitest 30/30 con 93.33 % de instrucciones, 90.24 % de ramas, 80 % de funciones y 92.1 % de líneas en los archivos importados por las pruebas. Se retiraron del repositorio los reportes generados versionados y se ignora `backend/coverage.xml`.

## Alta prioridad

### A-01. Corregir propagación y presentación de errores de API

**Estado:** completado en `f1b7ffa`, publicado en `origin/main`; Vitest 30/30, lint y build pasaron en esa implementación.

**Objetivo:** impedir que errores de red/API parezcan resultados correctos.

**Trabajo:** retirar fallbacks silenciosos `[]` y `undefined` de `frontend/src/api/axios.js`; propagar errores a Zustand/páginas; conservar el estado actual ante fallos; distinguir error de carga de una lista vacía; mostrar mensajes localizados y estados de reintento donde ayude.

**Aceptación:** pruebas comprueban fallos 4xx, 5xx y de red en lectura, creación, edición y grupos; la UI nunca muestra éxito si la API falla y no borra datos válidos por un fallo de lectura.

### A-02. Alinear login, refresh y estado de sesión del frontend

**Estado:** completado en `ad967ea`, publicado en `origin/main`; Vitest 30/30, lint y build pasaron en esa implementación.

**Objetivo:** mantener la sesión y el estado de Zustand coherentes durante toda su vida.

**Trabajo:** hacer que `login()` retorne una estructura explícita con tokens y perfil, o que el store no espere campos que no se retornan; actualizar el refresh token rotado; limpiar estado global y almacenamiento en logout; evitar llamadas de refresh recursivas.

**Aceptación:** pruebas automatizadas cubren respuesta del login, actualización del store, refresh concurrente, logout y expiración. Esta tarea complementa C-03.

### A-03. Añadir pruebas end-to-end con Playwright

**Estado:** completado el 2026-11-22. Tres escenarios Playwright pasan en Chromium: ruta protegida, registro/login y ciclo CRUD de grupos/tareas con búsqueda y filtro por estado, logout y respuesta visible ante API 503. El job E2E pasó en [CI de `2e2f506`](https://github.com/RiverFlow96/FullStack-TodoList/actions/runs/44991588752). Vitest 30/30, pytest 77/77, Ruff, ESLint, build y `manage.py check` también pasaron localmente.

**Objetivo:** comprobar los recorridos completos desde un navegador real.

**Trabajo:** configurar Playwright y un entorno aislado de prueba; automatizar registro, login, rutas protegidas, creación/edición/eliminación de tareas, grupos, filtros y logout; incluir al menos un caso de API fallida.

**Aceptación:** los flujos principales pasan en CI con datos limpios y sin depender de servicios externos de IA; capturas/logs se conservan cuando falla una prueba.

### A-04. Mejorar el asistente de IA

**Objetivo:** ofrecer sugerencias seguras, útiles y resistentes a fallos del proveedor.

**Trabajo:** validar respuestas externas en el servidor; limitar cantidad y longitud del contexto antes de construir el prompt; añadir límite de uso específico por usuario/IP; configurar límites de salida y timeout efectivo; evitar exponer errores internos; mostrar reintento y fallos de forma clara; declarar que el contexto se envía al proveedor.

**Aceptación:** pruebas cubren proveedor no configurado, timeout, cuota, JSON malformado, respuesta fuera de esquema, contexto excesivo y throttling; secretos y trazas no aparecen en respuesta cliente.

### A-05. Actualizar la documentación pública del proyecto

**Objetivo:** que README español e inglés describan el estado real y permitan reproducirlo.

**Trabajo:** actualizar comandos a Bun si Bun queda como herramienta oficial; documentar arquitectura, configuración local, variables de entorno, pruebas, CI, demo, acceso de demostración y límites del asistente IA; reemplazar capturas por imágenes auténticas actuales; retirar cifras históricas no verificadas.

**Aceptación:** un desarrollador nuevo puede instalar y arrancar backend y frontend siguiendo la guía; ambas versiones coinciden en características y resultados medidos; enlaces de demo/repositorio funcionan.

### A-06. Mejorar el sistema visual y la adaptación responsive

**Objetivo:** dar consistencia visual a login, tareas, grupos y perfil en móvil y escritorio.

**Trabajo:** definir escalas de tipografía, color, espaciado y estados; reutilizar componentes para botones, formularios, errores y carga; revisar contraste, textos en inglés/español y pantallas estrechas.

**Aceptación:** capturas revisadas en móvil y escritorio muestran jerarquía y estilos consistentes; controles principales tienen estados hover, focus, disabled, loading y error; no hay desbordamiento horizontal en vistas clave.

### A-07. Completar búsqueda, filtros y ordenación

**Objetivo:** hacer que las tareas existentes puedan encontrarse y organizarse de forma predecible.

**Trabajo:** implementar búsqueda por título/descripción, filtro por grupo y estado y ordenación por fecha/título. Prioridad y fecha límite solo se ofrecen cuando A-08 incorpore esos campos. Decidir si el filtrado se hace en cliente o API según volumen y paginación.

**Aceptación:** controles se pueden combinar; reset limpia los filtros; estados vacíos y sin resultados se distinguen; pruebas cubren búsqueda, combinación y orden ascendente/descendente.

### A-08. Incorporar prioridad y fecha límite a las tareas

**Objetivo:** permitir planificar por importancia y vencimiento.

**Trabajo:** definir valores de prioridad, campo nullable de vencimiento, migración, serialización, validación y edición en la interfaz; mostrar tareas vencidas usando zona horaria definida; habilitar filtros de A-07.

**Aceptación:** migración funciona sobre base vacía y existente; API rechaza valores inválidos; crear/editar conserva los campos; tareas vencidas y sin fecha se muestran correctamente.

## Prioridad media

### M-01. Preparar Docker Compose para desarrollo

**Trabajo:** servicios de backend, frontend y PostgreSQL; volúmenes persistentes solo para datos locales; healthchecks; `.env.example`; comandos de migración claros.

**Aceptación:** desde checkout limpio, `docker compose up --build` deja la app lista y el backend espera a PostgreSQL saludable; no se incluyen secretos.

### M-02. Añadir observabilidad básica

**Trabajo:** logs JSON con request ID, endpoint de health/readiness, seguimiento de excepciones y métricas mínimas de API/IA sin registrar tokens, contraseñas ni prompt completo.

**Aceptación:** health distingue proceso activo y base disponible; errores tienen identificador correlacionable; pruebas verifican que datos sensibles no se registran.

### M-03. Mejorar accesibilidad

**Trabajo:** corregir controles interactivos anidados, etiquetas de formulario, foco visible, navegación por teclado, nombres accesibles, diálogo IA y contraste.

**Aceptación:** flujos críticos pueden completarse solo con teclado; controles tienen nombre/rol/estado accesibles; comprobación automatizada sin errores críticos y revisión manual de foco.

### M-04. Añadir paginación y optimizar consultas/renderizado

**Trabajo:** paginar endpoints de tareas; actualizar cliente para paginación; revisar índices y consultas; medir antes de memoizar o virtualizar componentes.

**Aceptación:** lista mayor que una página puede recorrerse sin perder filtros; consultas no hacen N+1; medición documenta tamaño de datos y tiempos representativos.

### M-05. Incorporar etiquetas o categorías

**Trabajo:** diseñar relación flexible usuario-etiqueta-tarea, endpoints y controles de asignación; mantener compatibilidad con grupos como organización primaria existente.

**Aceptación:** cada usuario administra solo sus etiquetas; una tarea puede tener varias; filtros y edición conservan asociaciones; migración probada.

### M-06. Añadir interfaz español/inglés

**Trabajo:** centralizar textos, escoger idioma inicial y persistir la preferencia; localizar fechas, validaciones, errores y estados de accesibilidad.

**Aceptación:** todas las vistas y mensajes principales cambian de idioma sin recargar datos; ninguna vista clave queda con cadenas sin traducir.

## Mejoras avanzadas

### X-01. Panel de productividad

Mostrar totales pendientes, completadas y vencidas y tendencias por periodo. Aceptación: métricas se calculan con todas las tareas, respetan zona horaria y pueden contrastarse con registros conocidos.

### X-02. Subtareas y recurrencias

Diseñar modelo de subtareas y reglas recurrentes con edición, finalización y generación de ocurrencias sin duplicados. Aceptación: reglas documentadas, migración segura y pruebas de límites temporales y recurrencia.

### X-03. Notificaciones

Definir canal (in-app o correo), consentimiento, frecuencia y zona horaria; evitar duplicados y ofrecer gestión de preferencias. Aceptación: recordatorio de prueba llega al destinatario correcto y se puede cancelar/desactivar.

### X-04. Funciones avanzadas de IA

Planificación, descomposición de objetivos y priorización asistida con revisión humana, límites de coste y validación de salida. Aceptación: resultados siempre editables, no se crean tareas sin confirmación y se respetan límites por usuario.

### X-05. Presentación profesional

Crear vídeo/GIF breve, capturas actuales y caso de estudio para portafolio/LinkedIn. Aceptación: contenido coincide con demo publicada, no revela datos personales ni secretos y enlaza a demo y repositorio.

## Registro de cambios del plan

- 2026-11-21: se documentó la lista con criterios de aceptación; correcciones de seguridad, empaquetado y CI incluidas en `a46a96b`.
- 2026-11-22: se resolvieron avisos transitivos de frontend con Bun y se registraron como completadas A-01 y A-02, ya implementadas en commits publicados.
