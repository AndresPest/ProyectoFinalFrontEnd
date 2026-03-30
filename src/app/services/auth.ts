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
      nivel: string,
      categorias?: any,
      // Para Miller y Smith
      categoriaVulnerableLv1?: any,
      categoriaVulnerableLv2?: any,
      categoriaVulnerableLv3?: any,
      // Para CEAU y SISCO
      categoriasResaltantes?: any,
      categoriasAtencion?: any,

      tiempo: number,
      fecha: string
    }){
    
    if (data.identificador === "Test de Vulnerabilidad al Estrés - L.H. Miller y A.D. Smith"){
      try {
        const colRef = collection(this.firestore, 'Resultados_Cuestionario');
        return await addDoc(colRef, {
          usuario_uid: uid,
          identificador_cuestionario: data.identificador,
          puntaje_final: data.puntaje,
          nivel_estres: data.nivel,
          tiempo_respuesta: data.tiempo,
          categorias: data.categorias,
          categoriaVulnerableLv1: data.categoriaVulnerableLv1,
          categoriaVulnerableLv2: data.categoriaVulnerableLv2,
          categoriaVulnerableLv3: data.categoriaVulnerableLv3,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error al guardar cuestionario:", error);
        throw error;
      }
    }else if (data.identificador === "CEAU - Cuestionario de Estrés Académico en la Universidad"){
      try {
        const colRef = collection(this.firestore, 'Resultados_Cuestionario');
        return await addDoc(colRef, {
          usuario_uid: uid,
          identificador_cuestionario: data.identificador,
          puntaje_final: data.puntaje,
          nivel_estres: data.nivel,
          tiempo_respuesta: data.tiempo,
          categorias: data.categorias,
          categoriasResaltantes: data.categoriasResaltantes,
          categoriasAtencion: data.categoriasAtencion,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error al guardar cuestionario:", error);
        throw error;
      }
    }else if (data.identificador === "SISCO - Inventario Sistémico Cognoscitivista para el estudio del estrés académico"){
      try {
        const colRef = collection(this.firestore, 'Resultados_Cuestionario');
        return await addDoc(colRef, {
          usuario_uid: uid,
          identificador_cuestionario: data.identificador,
          puntaje_final: data.puntaje,
          nivel_estres: data.nivel,
          tiempo_respuesta: data.tiempo,
          categorias: data.categorias,
          categoriasResaltantes: data.categoriasResaltantes,
          categoriasAtencion: data.categoriasAtencion,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error al guardar cuestionario:", error);
        throw error;
      }
    }else if (data.identificador === "Inventario Sobre Vulnerabilidad al Estrés (Beech, Burns y Sheffield, 1982)"){
      try {
        const colRef = collection(this.firestore, 'Resultados_Cuestionario');
        return await addDoc(colRef, {
          usuario_uid: uid,
          identificador_cuestionario: data.identificador,
          puntaje_final: data.puntaje,
          nivel_estres: data.nivel,
          tiempo_respuesta: data.tiempo,
          categorias: data.categorias,
          categoriasResaltantes: data.categoriasResaltantes,
          categoriasAtencion: data.categoriasAtencion,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error al guardar cuestionario:", error);
        throw error;
      }
    }else if (data.identificador === "Inventario de Síntomas de Estrés. Segunda versión - Arturo Barraza Macías"){
      try {
        const colRef = collection(this.firestore, 'Resultados_Cuestionario');
        return await addDoc(colRef, {
          usuario_uid: uid,
          identificador_cuestionario: data.identificador,
          puntaje_final: data.puntaje,
          nivel_estres: data.nivel,
          tiempo_respuesta: data.tiempo,
          categorias: data.categorias,
          categoriasResaltantes: data.categoriasResaltantes,
          categoriasAtencion: data.categoriasAtencion,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error al guardar cuestionario:", error);
        throw error;
      }
    }
    else {
      throw new Error(`Identificador de cuestionario no reconocido: ${data.identificador}`);
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