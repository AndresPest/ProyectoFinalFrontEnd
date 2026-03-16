import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, addDoc, serverTimestamp, getDoc, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';

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

  async getDatosUsuario(uid: string) {
    const userDocRef = doc(this.firestore, `Usuario/${uid}`);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async register(email: string, pass: string, datos: DatosUsuario) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = credential.user.uid;
      
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

  async guardarResultadoCuestionario(uid: string, data: { 
      identificador: string, 
      puntaje: number, 
      tiempo: number,
      categorias?: any, // La '?' lo hace opcional
      fecha?: string
    }){
      
    try {
      const colRef = collection(this.firestore, 'Resultados_Cuestionario');
      return await addDoc(colRef, {
        usuario_uid: uid,
        identificador_cuestionario: data.identificador,
        puntaje_final: data.puntaje,
        tiempo_respuesta: data.tiempo,
        categorias: data.categorias,
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

  async getResultadosCuestionarios() {
  // 1. Esperamos a que Firebase nos diga quién es el usuario (resolviendo el problema de la recarga)
  const user = await firstValueFrom(authState(this.auth));
  
  if (!user) {
    console.warn("No se encontró usuario tras esperar authState");
    return [];
  }

  try {
    const colRef = collection(this.firestore, 'Resultados_Cuestionario');
    const q = query(
      colRef,
      where('usuario_uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error en getResultadosCuestionarios:", error);
    return [];
  }
}
}