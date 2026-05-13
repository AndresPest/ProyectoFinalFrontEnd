import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { Navigation } from '../services/navigation';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NavbarComponent, RouterOutlet],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
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
export class LoginComponent {

  constructor(private navService: Navigation) {}

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  cargando = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async iniciarSesion() {
    if (this.form.invalid) return;

    this.errorMessage.set(null);
    this.cargando.set(true);

    const { usuario, password } = this.form.value;

    try {
      const res = await this.authService.login(usuario, password);
      console.log('Login exitoso con Firebase:', res.user.uid);
      
      this.router.navigate(['/cuestionario']);
      
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