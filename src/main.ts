import 'zone.js'; // <--- IMPORTANTE: Debe ser la primera línea
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.component.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Configuración de entornos (basado en tu estructura de carpetas)
import { environment } from './environments/environments';

bootstrapApplication(AppComponent, {
  providers: [
    // Soluciona el error NG0908 al gestionar la detección de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    // Inicialización de Firebase con los datos de tu environment.ts
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
}).catch((err) => console.error(err));