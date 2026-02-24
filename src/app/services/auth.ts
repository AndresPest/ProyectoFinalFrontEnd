import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Registro: Crea el usuario en Auth y el documento en Firestore
  async register(email: string, pass: string, nombre: string) {
    // 1. Crear usuario en Firebase Auth
    const res = await createUserWithEmailAndPassword(this.auth, email, pass);
    const uid = res.user.uid;

    // 2. Crear documento en la colección 'usuario' (coincidiendo con tu captura)
    await setDoc(doc(this.firestore, 'usuario', uid), {
      uid: uid,
      nombre: nombre,
      correo: email,
      contraseña: pass, // Nota: En producción no se recomienda guardar pass en texto plano
      apellido: "",
      carrera: "",
      semestre: "",
      perfil_estres: {
        ult_conexion: new Date().toLocaleDateString(),
        ult_puntaje: "0"
      }
    });
    return res;
  }

  // Login: Simple y directo
  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Logout
  logout() {
    return signOut(this.auth);
  }
}