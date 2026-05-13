import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterOutlet } from '@angular/router'; 
import { NavbarComponent } from '../navbar/navbar'; 
import { AuthService } from '../services/auth';
import { Navigation } from '../services/navigation';

interface Carrera {
  nombre: string;
  maxSemestres: number;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NavbarComponent, RouterOutlet],
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

export class RegisterComponent {

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

  constructor(private navService: Navigation) {}

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = false;

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    carrera: ['', [Validators.required]],
    semestre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async register() {
    if (this.form.invalid || this.cargando) return;

    this.cargando = true;
    const { email, password, nombre, apellido, carrera, semestre } = this.form.value;

    try {
      await this.authService.register(email, password, { 
        nombre, 
        apellido, 
        carrera, 
        semestre 
      });
      
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.cargando = false;
      
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

  get semestresDisponibles(): number[] {
    const carreraSeleccionada = this.form.get('carrera')?.value;
    const carrera = this.carreras.find(c => c.nombre === carreraSeleccionada);
    
    if (carrera) {
      return Array.from({ length: carrera.maxSemestres }, (_, i) => i + 1);
    }
    return [];
  }

  onCarreraChange() {
    this.form.get('semestre')?.setValue('');
  }
}