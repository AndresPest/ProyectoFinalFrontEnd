import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { trigger, transition, style, animate } from '@angular/animations';
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
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    NavbarComponent, 
    RouterOutlet
  ],
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

  usuario = '';
  password = '';
  
  errorMessage = signal<string | null>(null);

  async iniciarSesion() {
    this.errorMessage.set(null);

    try {
      const res = await this.authService.login(this.usuario, this.password);
      
      console.log('Login exitoso con Firebase:', res.user.uid);
      this.router.navigate(['/resultados']);
      
    } catch (err: any) {
      console.error('Error de login:', err.code);

      if (err.code === 'auth/invalid-credential') {
        this.errorMessage.set('Usuario o contraseña incorrectos.');
      } else {
        this.errorMessage.set('Ocurrió un error al intentar iniciar sesión.');
      }
    }
  }

  form: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  irA(ruta: string) {
    this.navService.irA(ruta);
  }
}