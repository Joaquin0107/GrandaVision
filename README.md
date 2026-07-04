# SmartStock GV

Prototipo funcional de gestión de cadena de suministro para **Granda Visión**, construido con Angular 20 (standalone components) y un **Fake Backend** basado en `localStorage` sembrado desde archivos JSON (`public/assets/data`). No requiere base de datos ni backend real.

## Stack

- Angular 20 (standalone, signals donde aplica)
- Angular Material + Tailwind CSS v4
- ng2-charts (Chart.js) para gráficos
- Fake Backend: `LocalStoreService` (siembra JSON → localStorage, simula GET/POST/PUT/DELETE con latencia)
- Login simulado (usuario `admin` / contraseña `123456`), sesión guardada en localStorage

## Estructura

```
src/app/
  core/
    models/       interfaces de dominio (Producto, Orden, Alerta, Indicadores, Usuario)
    services/     LocalStoreService + servicios de dominio (CRUD sobre localStorage)
    guards/       authGuard / guestGuard
  layouts/
    main-layout/  sidebar + navbar + <router-outlet>
  pages/
    auth/login
    dashboard
    inventario
    alertas
    ordenes
    reportes
    configuracion
  shared/components/
    iris-gauge/   anillo tipo "apertura de lente" (KPI, elemento de marca)
    kpi-card/     tarjeta de indicador reutilizable
public/assets/data/  productos.json, ordenes.json, usuarios.json, alertas.json, indicadores.json, proveedores.json
```

## Ejecutar en desarrollo

```bash
npm install
npm start        # o: ng serve
```

Abre `http://localhost:4200`. Ingresa con `admin` / `123456`.

## Compilar para producción

```bash
npm run build
```

El resultado queda en `dist/smartstock-gv/browser`.

## Desplegar en Firebase Hosting

1. Instala la CLI de Firebase (una sola vez):
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión:
   ```bash
   firebase login
   ```
3. Verifica/crea el proyecto en Firebase Console y actualiza el alias en `.firebaserc`
   (reemplaza `smartstock-gv` por el ID real de tu proyecto de Firebase).
4. Compila y despliega:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

El archivo `firebase.json` ya está configurado para servir `dist/smartstock-gv/browser`
y redirigir todas las rutas a `index.html` (necesario para el enrutador de Angular).

## Notas sobre el Fake Backend

- Todas las colecciones se siembran una sola vez desde `public/assets/data/*.json` y
  luego viven en `localStorage` (`gv_productos`, `gv_ordenes`, etc.).
- El estado de cada producto (Disponible / Stock Bajo / Stock Crítico / Sobrestock) se
  calcula automáticamente en `core/models/producto.model.ts`, nunca se guarda "a mano".
- Las alertas se regeneran a partir del inventario cada vez que se listan (regla de
  negocio, sin IA), conservando si ya fueron marcadas como leídas.
- En **Configuración** hay un botón para restablecer todos los datos de la demo a su
  estado original.
- Para migrar a una API REST real en el futuro, solo hace falta reemplazar la
  implementación de `core/services/*.service.ts` — los componentes no cambian.
