Aplicación Angular 20 para la interfaz de usuario del sistema de reconocimiento emocional. Consume la API del backend, gestiona la captura de cámara y micrófono, y muestra los resultados e historial. Desplegada en Firebase Hosting.

## Requisitos previos

- Node.js 18 o superior
- Angular CLI 20.0.5 o superior
- Cuenta de Firebase con Hosting habilitado

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/AndresPest/ProyectoFinalFrontEnd.git
   cd ProyectoFinalFrontEnd
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

## Configuración

1. **Entorno de Firebase**:
   - Abrir `src/environments/environments.ts`.
   - Reemplazar los valores de `firebase` con los de tu propio proyecto:

   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "TU_API_KEY",
       authDomain: "TU_PROYECTO.firebaseapp.com",
       projectId: "TU_PROYECTO",
       storageBucket: "TU_PROYECTO.firebasestorage.app",
       messagingSenderId: "TU_SENDER_ID",
       appId: "TU_APP_ID",
       measurementId: "TU_MEASUREMENT_ID"
     }
   };
   ```

   El archivo actual contiene la configuración del proyecto `reconocimiento-emocional-2d6e4` como referencia.

2. **Dependencias de MediaPipe**:
   El proyecto incluye `@mediapipe/face_mesh` y `@mediapipe/camera_utils` como dependencias de CommonJS. El archivo `angular.json` ya las tiene declaradas en `allowedCommonJsDependencies` para evitar advertencias de compilación.

## Ejecución local

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/` y se recargará automáticamente al modificar los archivos.

## Compilación para producción

```bash
ng build
```

Los archivos resultantes se almacenarán en el directorio `dist/`.

## Despliegue en Firebase Hosting

1. Instalar Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Iniciar sesión:
   ```bash
   firebase login
   ```

3. Inicializar el proyecto (si no está configurado):
   ```bash
   firebase init hosting
   ```
   Seleccionar el proyecto de Firebase correspondiente y establecer `dist/TESISFRONTEND/browser` como directorio público.

4. Desplegar:
   ```bash
   firebase deploy
   ```

---

## Notas sobre la configuración de Firebase

Ambos componentes comparten el mismo proyecto de Firebase. La configuración del frontend se toma directamente del archivo `environments.ts`, mientras que el backend utiliza una cuenta de servicio para acceder a Realtime Database. Es importante que ambas configuraciones apunten al mismo proyecto para garantizar la coherencia de los datos.
