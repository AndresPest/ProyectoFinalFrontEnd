import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router'; 
import { NavbarComponent } from '../navbar/navbar'; 
import { AuthService } from '../services/auth';
import { Navigation } from '../services/navigation';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    NavbarComponent, 
    RouterOutlet    
  ],
})
export class RegisterComponent {

  constructor(private navService: Navigation) {}

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variable para controlar el estado de carga y evitar el error de "email-already-in-use"
  cargando = false;

  // Formulario actualizado con todos los campos requeridos por el AuthService
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    carrera: ['', [Validators.required]],
    semestre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async register() {
    // Si el formulario es inválido o ya hay una petición en curso, no hacer nada
    if (this.form.invalid || this.cargando) return;

    this.cargando = true;
    const { email, password, nombre, apellido, carrera, semestre } = this.form.value;

    try {
      // Enviamos el objeto 'datos' tal como lo espera el AuthService.register
      await this.authService.register(email, password, { 
        nombre, 
        apellido, 
        carrera, 
        semestre 
      });
      
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.cargando = false; // Liberamos el botón si hay un error para poder reintentar
      
      // Manejo específico para el error que viste en consola
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo electrónico ya está registrado.');
      } else {
        alert('Error en el proceso de registro: ' + error.message);
      }
    }
  }

  irA(ruta: string) {
    this.navService.irA(ruta);
  }
}