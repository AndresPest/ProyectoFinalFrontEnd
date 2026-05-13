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
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';

interface Carrera {
  nombre: string;
  maxSemestres: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, 
    MatIconModule, RouterOutlet, NavbarComponent],
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

  carreras: Carrera[] = [
    { nombre: 'Administración de Empresas', maxSemestres: 8 },
    { nombre: 'Contaduría Pública', maxSemestres: 8 },
    { nombre: 'Relaciones Industriales', maxSemestres: 8 },
    { nombre: 'Comunicación Social', maxSemestres: 8 },
    { nombre: 'Ingeniería Civil', maxSemestres: 8 },
    { nombre: 'Ingeniería Informática', maxSemestres: 8 },
    { nombre: 'Ingeniería Industrial', maxSemestres: 8 },
    { nombre: 'Derecho', maxSemestres: 9 }
  ];

  semestres: number[] = [];

  profileForm!: FormGroup;
  hideOld = true;
  hideNew = true;

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
        const userDocRef = doc(this.firestore, `Usuario/${user.uid}`);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          this.profileForm.patchValue({
            nombre: userData['Nombre'],
            apellido: userData['Apellido'],
            carrera: userData['Carrera'],
            semestre: userData['Semestre'],
            correo: userData['Correo']
          });

          setTimeout(() => {
            const semestre = userData['Semestre'];
            
            if (semestre) {
              this.profileForm.get('semestre')?.setValue(Number(semestre));
            }
          }, 100);
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
      const userDocRef = doc(this.firestore, `Usuario/${user.uid}`);
      
      const datosAActualizar = {
        Nombre: formValue.nombre,
        Apellido: formValue.apellido,
        Carrera: formValue.carrera,
        Semestre: formValue.semestre
      };

      await updateDoc(userDocRef, datosAActualizar);

      if (formValue.passwordNueva && formValue.passwordActual) {
        const credential = EmailAuthProvider.credential(user.email!, formValue.passwordActual);
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, formValue.passwordNueva);
        alert('Perfil y contraseña actualizados correctamente.');
      } else {
        alert('Perfil actualizado correctamente en la nube.');
      }

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

    get semestresDisponibles(): number[] {
      const seleccionada = this.profileForm.get('carrera')?.value;
      const carrera = this.carreras.find(c => c.nombre === seleccionada);
      return carrera ? Array.from({ length: carrera.maxSemestres }, (_, i) => i + 1) : [];
    }

    onCarreraChange() {
      this.profileForm.get('semestre')?.setValue(null);
    }

}