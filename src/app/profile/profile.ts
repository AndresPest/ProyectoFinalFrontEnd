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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, RouterOutlet, NavbarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInTrigger', [
      transition('* => *', [
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
  semestres: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private fb: FormBuilder) {
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
      correo: [{ value: 'usuario@correo.com', disabled: true }],
      passwordActual: [''],
      passwordNueva: ['', [Validators.minLength(6)]]
    });
  }

  loadUserData() {
    const savedData = JSON.parse(localStorage.getItem('user_profile') || '{}');
    if (savedData.nombre) {
      this.profileForm.patchValue({
        nombre: savedData.nombre,
        apellido: savedData.apellido,
        carrera: savedData.carrera,
        semestre: savedData.semestre
      });
    }
  }

  guardarPerfil() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.getRawValue();
      
      if (formValue.passwordNueva && !formValue.passwordActual) {
        alert('Debes ingresar tu contraseña actual para establecer una nueva.');
        return;
      }

      const { passwordActual, passwordNueva, ...datosAGuardar } = formValue;
      localStorage.setItem('user_profile', JSON.stringify(datosAGuardar));
      
      alert('Perfil actualizado correctamente.');
      this.profileForm.patchValue({ passwordActual: '', passwordNueva: '' });
    }
  }
}