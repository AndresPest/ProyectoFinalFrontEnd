import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterOutlet } from '@angular/router';

// Imports de Firebase
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatIconModule, 
    RouterOutlet, 
    NavbarComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  hideOld = true;
  hideNew = true;
  // En tu Firestore el semestre es un String ("10"), por eso usamos strings aquí
  semestres: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  initForm() {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      carrera: ['', Validators.required],
      semestre: ['', Validators.required],
      correo: [{ value: '', disabled: true }],
      passwordActual: [''],
      passwordNueva: ['', [Validators.minLength(6)]]
    });
  }

  async loadUserData() {
    const user = this.auth.currentUser;
    if (user) {
      try {
        // Referencia al documento usando el UID del usuario autenticado
        const userDocRef = doc(this.firestore, `Usuario/${user.uid}`);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Mapeo desde Firestore (Mayúsculas) hacia el Formulario (minúsculas)
          this.profileForm.patchValue({
            nombre: userData['Nombre'],
            apellido: userData['Apellido'],
            carrera: userData['Carrera'],
            semestre: userData['Semestre'],
            correo: userData['Correo']
          });
        }
      } catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
      }
    }
  }

  async guardarPerfil() {
    if (this.profileForm.invalid) return;

    const user = this.auth.currentUser;
    if (!user) {
      alert("No se encontró sesión activa.");
      return;
    }

    const formValue = this.profileForm.getRawValue();

    try {
      // 1. Actualizar datos en Firestore
      const userDocRef = doc(this.firestore, `Usuario/${user.uid}`);
      
      const datosAActualizar = {
        Nombre: formValue.nombre,
        Apellido: formValue.apellido,
        Carrera: formValue.carrera,
        Semestre: formValue.semestre
      };

      await updateDoc(userDocRef, datosAActualizar);

      // 2. Lógica opcional para cambio de contraseña en Firebase Auth
      if (formValue.passwordNueva && formValue.passwordActual) {
        const credential = EmailAuthProvider.credential(user.email!, formValue.passwordActual);
        
        // Re-autenticación necesaria para cambios sensibles
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, formValue.passwordNueva);
        alert('Perfil y contraseña actualizados correctamente.');
      } else {
        alert('Perfil actualizado correctamente en la nube.');
      }

      // Limpiar campos de password
      this.profileForm.patchValue({ passwordActual: '', passwordNueva: '' });

    } catch (error: any) {
      console.error("Error en la operación:", error);
      if (error.code === 'auth/wrong-password') {
        alert("La contraseña actual es incorrecta.");
      } else {
        alert("Ocurrió un error al intentar guardar los cambios.");
      }
    }
  }
}