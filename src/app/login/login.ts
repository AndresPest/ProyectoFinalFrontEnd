import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NavbarComponent, RouterOutlet],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  usuario = '';
  password = '';

  constructor(private authService: AuthService) {}

  iniciarSesion() {
    this.authService.login(this.usuario, this.password).subscribe({
      next: res => console.log('Login exitoso:', res),
      error: err => console.error('Error de login:', err)
    });
  }
}