import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router';

// Asegúrate de que la ruta apunte a tu nuevo servicio de Firebase
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
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
  // Inyectamos las dependencias necesarias
  private authService = inject(AuthService);
  private router = inject(Router);

  // Mantenemos tus variables para el [(ngModel)]
  usuario = '';
  password = '';
  
  // Signal para manejar mensajes de error en la UI si lo deseas
  errorMessage = signal<string | null>(null);

  async iniciarSesion() {
    this.errorMessage.set(null); // Limpiamos errores previos

    try {
      // Llamamos al login de Firebase (ahora es una Promesa)
      const res = await this.authService.login(this.usuario, this.password);
      
      console.log('Login exitoso con Firebase:', res.user.uid);
      
      // Redirigimos a la pantalla principal (por ejemplo, resultados)
      this.router.navigate(['/resultados']);
      
    } catch (err: any) {
      console.error('Error de login:', err.code);
      
      // Manejo básico de errores comunes de Firebase
      if (err.code === 'auth/invalid-credential') {
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      } else {
        this.errorMessage.set('Ocurrió un error al intentar iniciar sesión.');
      }
    }
  }
}