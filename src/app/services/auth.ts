import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface DatosUsuario {
  nombre: string;
  apellido: string;
  carrera: string;
  semestre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$: Observable<User | null> = authState(this.auth);

  get currentUser() {
    return this.auth.currentUser;
  }

  async register(email: string, pass: string, datos: DatosUsuario) {
    try {
      ////// Creamos el usuario en Firebase Authentication
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = credential.user.uid;
      
      ////// Creamos el documento del usuario en la colección 'Usuario'
      const userDocRef = doc(this.firestore, `Usuario/${uid}`);
      
      await setDoc(userDocRef, {
        uid: uid,
        Correo: email,
        Nombre: datos.nombre ?? '',
        Apellido: datos.apellido ?? '',
        Carrera: datos.carrera ?? '',
        Semestre: datos.semestre ?? '',
        fecha_registro: serverTimestamp()
      });

      return credential;
    } catch (error) {
      console.error("Error en el proceso de registro:", error);
      throw error;
    }
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

   //////// GUARDAR RESULTADOS DE CUESTIONARIOS (SISCO, Miller, CEAU)

  async guardarResultadoCuestionario(uid: string, data: { identificador: string, puntaje: number, tiempo: number }) {
    try {
      const colRef = collection(this.firestore, 'Resultados_Cuestionario');
      return await addDoc(colRef, {
        usuario_uid: uid,
        identificador_cuestionario: data.identificador,
        puntaje_final: data.puntaje,
        tiempo_respuesta: data.tiempo,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al guardar cuestionario:", error);
      throw error;
    }
  }

  async guardarResultadoFacial(uid: string, data: { modelo: string, emocion: string, confianza: number }) {
    try {
      const colRef = collection(this.firestore, 'Resultados_ReconFacial');
      return await addDoc(colRef, {
        usuario_uid: uid,
        tipo_modelo: data.modelo,
        emocion_detectada: data.emocion,
        confianza: data.confianza,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al guardar reconocimiento facial:", error);
      throw error;
    }
  }
}