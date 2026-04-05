# Guia rapida: merge y ramas

Este documento resume un flujo seguro para mergear `features` a `main`, volver a tu rama de trabajo y continuar sin perder historial.

## 1) Merge recomendado (via Pull Request)

### Paso a paso

1. Actualiza ramas locales:

```bash
git checkout main
git pull origin main

git checkout features
git pull origin features
```

2. Sincroniza `features` con `main` para resolver conflictos antes del PR:

```bash
git checkout features
git merge main
# (opcional) en lugar de merge, usar rebase:
# git rebase main
```

3. Ejecuta validaciones en `features`:

```bash
# frontend
cd frontend
npm run lint
npm run build

# backend
cd ../backend
python manage.py check
python manage.py migrate --noinput
```

4. Sube `features` y abre PR hacia `main`.
5. Espera CI en verde y mergea el PR.

## 2) Merge por comandos (si no usas PR)

```bash
git checkout main
git pull origin main
git merge --no-ff features
git push origin main
```

## 3) Volver a la rama anterior

### Opcion rapida (ultima rama usada)

```bash
git switch -
```

### Opcion explicita

```bash
git checkout features
# o
git switch features
```

## 4) Seguir trabajando en `features` despues del merge

No pierdes el merge. El historial queda en `main` y puedes continuar en `features`.

Flujo recomendado luego del merge:

```bash
git checkout main
git pull origin main

git checkout features
git merge main
# o: git rebase main
```

## 5) Si necesitas revertir un merge

### Caso A: el merge ya fue pusheado (recomendado)

1. Busca el SHA del commit de merge:

```bash
git log --oneline --graph
```

2. Revierte ese merge:

```bash
git checkout main
git pull origin main
git revert -m 1 <SHA_DEL_MERGE>
git push origin main
```

### Caso B: merge local sin push

```bash
git reset --hard ORIG_HEAD
```

## 6) Opciones recomendadas

- **Para equipo/produccion:** PR + CI + branch protection en `main`.
- **Estrategia de merge recomendada:** `squash merge` para features grandes (historial mas limpio).
- **Para rollback seguro en remoto:** `git revert` (evita reescritura de historial).
- **Practica ideal:** una rama por feature (`feature/nombre-corto`) en lugar de reutilizar siempre `features`.

## 7) Mini checklist antes de merge a produccion

- [ ] CI en verde
- [ ] Build frontend OK
- [ ] Check/migrate backend OK
- [ ] Variables de entorno de produccion listas
- [ ] Smoke test en staging/preview
- [ ] PR revisado y aprobado
