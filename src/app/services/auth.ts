import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, updateDoc, setDoc, collection, addDoc, serverTimestamp, getDoc, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { ResultadosCuestionario } from '../resultados/resultados';
import { AnalisisFacial } from '../resultados/resultados';

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
    fecha: string}) {

    const colRef = collection(this.firestore, 'Resultados_Cuestionario');
    
    const nuevoDocRef = doc(colRef);

    let objetoAGuardar: any = {
      usuario_uid: uid,
      identificador_cuestionario: data.identificador,
      puntaje_final: data.puntaje,
      nivel_estres: data.nivel,
      tiempo_respuesta: data.tiempo,
      categorias: data.categorias || null,
      timestamp: serverTimestamp()
    };

    if (data.identificador === "Test de Vulnerabilidad al Estrés - L.H. Miller y A.D. Smith") {
      objetoAGuardar.categoriaVulnerableLv1 = data.categoriaVulnerableLv1 || null;
      objetoAGuardar.categoriaVulnerableLv2 = data.categoriaVulnerableLv2 || null;
      objetoAGuardar.categoriaVulnerableLv3 = data.categoriaVulnerableLv3 || null;
    } else if (
      data.identificador === "CEAU - Cuestionario de Estrés Académico en la Universidad" ||
      data.identificador === "SISCO - Inventario Sistémico Cognoscitivista para el estudio del estrés académico" ||
      data.identificador === "Inventario Sobre Vulnerabilidad al Estrés (Beech, Burns y Sheffield, 1982)" ||
      data.identificador === "Inventario de Síntomas de Estrés. Segunda versión - Arturo Barraza Macías"
    ) {
      objetoAGuardar.categoriasResaltantes = data.categoriasResaltantes || null;
      objetoAGuardar.categoriasAtencion = data.categoriasAtencion || null;
    } else {
      throw new Error(`Identificador de cuestionario no reconocido: ${data.identificador}`);
    }

    try {
      await setDoc(nuevoDocRef, objetoAGuardar);
      
      console.log(`[Firestore] Estructura base creada con éxito. ID reservado: ${nuevoDocRef.id}`);
      
      return nuevoDocRef;
    } catch (error) {
      console.error("Error crítico al guardar en Resultados_Cuestionario:", error);
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

  async getResultadosCuestionarios(): Promise<ResultadosCuestionario[]> {
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
      } as ResultadosCuestionario));
    } catch (error) {
      console.error("Error en getResultadosCuestionarios:", error);
      return [];
    }
  }

  async guardarAnalisisFacialCuestionario(uid: string, data: { 
    resultado_id: string,
    identificador_cuestionario: string, 
    historial_cnn: any[], 
    historial_facemesh: any[] 
  }) {
    try {
      const colRef = collection(this.firestore, 'Analisis_Facial_Sesion');
      return await addDoc(colRef, {
        usuario_uid: uid,
        identificador_cuestionario: data.identificador_cuestionario,
        cuestionario_id: data.resultado_id,
        historial_cnn: data.historial_cnn,
        historial_facemesh: data.historial_facemesh,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al guardar análisis facial de la sesión:", error);
      throw error;
    }
  }

  async getAnalisisFacialSesion(): Promise<AnalisisFacial[]> {
    const user = await firstValueFrom(authState(this.auth));
    
    if (!user) {
      console.warn("No se encontró usuario tras esperar authState");
      return [];
    }

    try {
      const colRef = collection(this.firestore, 'Analisis_Facial_Sesion');
      const q = query(
        colRef,
        where('usuario_uid', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AnalisisFacial));
    } catch (error) {
      console.error("Error en getAnalisisFacialSesion:", error);
      return [];
    }
  }

  async actualizarAudioCuestionario(uid: string, resultadoId: string, data: any) {
    const docRef = doc(this.firestore, `Resultados_Cuestionario/${resultadoId}`);
    return await updateDoc(docRef, data);
  }

}