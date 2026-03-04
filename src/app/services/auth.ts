import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  authState, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyección de dependencias de Firebase (Angular 17+)
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable para rastrear el estado de la sesión en toda la app
  user$: Observable<User | null> = authState(this.auth);

  /**
   * Obtener el usuario actual de forma síncrona
   */
  get currentUser() {
    return this.auth.currentUser;
  }

  /**
   * REGISTRO: Crea la cuenta en Auth y el perfil en Firestore
   * @param email Correo electrónico
   * @param pass Contraseña (mínimo 6 caracteres)
   * @param datos Objeto con Nombre, Apellido, Carrera y Semestre
   */
  async register(email: string, pass: string, datos: { nombre: string, apellido: string, carrera: string, semestre: string }) {
    try {
      // 1. Crear el usuario en Firebase Authentication
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      
      // 2. Crear el documento del usuario en la colección 'Usuario'
      // Usamos el UID de Auth como ID del documento para que estén vinculados
      const userDocRef = doc(this.firestore, `Usuario/${credential.user.uid}`);
      
      await setDoc(userDocRef, {
        uid: credential.user.uid,
        Correo: email,
        Nombre: datos.nombre,
        Apellido: datos.apellido,
        Carrera: datos.carrera,
        Semestre: datos.semestre,
        fecha_registro: serverTimestamp()
      });

      return credential;
    } catch (error) {
      console.error("Error en el proceso de registro:", error);
      throw error;
    }
  }

  /**
   * LOGIN: Inicia sesión con correo y contraseña
   */
  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  /**
   * LOGOUT: Cierra la sesión activa
   */
  logout() {
    return signOut(this.auth);
  }

  /**
   * GUARDAR RESULTADOS DE CUESTIONARIOS (SISCO, Miller, CEAU)
   */
  async guardarResultadoCuestionario(uid: string, data: { identificador: string, puntaje: number, tiempo: number }) {
    try {
      const colRef = collection(this.firestore, 'Resultados_Cuestionario');
      return await addDoc(colRef, {
        usuario_uid: uid,
        identificador_cuestionario: data.identificador,
        puntaje_final: data.puntaje,
        tiempo_respuesta: data.tiempo, // en segundos
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al guardar cuestionario:", error);
      throw error;
    }
  }

  /**
   * GUARDAR RESULTADOS DE RECONOCIMIENTO FACIAL (CNN y FaceMesh)
   * Aquí es donde diferenciamos los dos modelos para tu tesis
   */
  async guardarResultadoFacial(uid: string, data: { modelo: string, emocion: string, confianza: number }) {
    try {
      const colRef = collection(this.firestore, 'Resultados_ReconFacial');
      return await addDoc(colRef, {
        usuario_uid: uid,
        tipo_modelo: data.modelo, // Ej: 'FaceMesh-Landmarks' o 'CNN-Convolutional'
        emocion_detectada: data.emocion,
        confianza: data.confianza, // Valor de 0 a 100
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al guardar reconocimiento facial:", error);
      throw error;
    }
  }
}