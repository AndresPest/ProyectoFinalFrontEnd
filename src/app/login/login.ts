import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms'; // Cambiado FormsModule por ReactiveFormsModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { Navigation } from '../services/navigation';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, // Asegúrate de tener este
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    NavbarComponent, 
    RouterOutlet
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  constructor(private navService: Navigation) {}

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  cargando = signal<boolean>(false); // Añadido para feedback visual

  // Definición del formulario reactivo
  form: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.email]], // Se asume que el usuario es el email
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async iniciarSesion() {
    if (this.form.invalid) return;

    this.errorMessage.set(null);
    this.cargando.set(true);

    // Extraemos los valores directamente del formulario reactivo
    const { usuario, password } = this.form.value;

    try {
      const res = await this.authService.login(usuario, password);
      console.log('Login exitoso con Firebase:', res.user.uid);
      
      // Redirección exitosa
      this.router.navigate(['/resultados']);
      
    } catch (err: any) {
      console.error('Error de login:', err.code);
      this.cargando.set(false);

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      } else {
        this.errorMessage.set('Error: Credenciales inválidas o problema de conexión.');
      }
    }
  }

  irA(ruta: string) {
    this.navService.irA(ruta);
  }
}