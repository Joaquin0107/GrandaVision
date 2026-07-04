import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Fix: si las fuentes web (Manrope/Inter) terminan de cargar después de que
// Angular Material ya calculó el "notch" del borde de los mat-form-field
// (appearance="outline"), el ancho del label cambia pero el corte del borde
// queda desalineado, dejando una línea residual. Forzamos un resize sintético
// para que Material vuelva a medir y recalcular el notch de todos los campos.
if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => {
    window.dispatchEvent(new Event('resize'));
  });
}