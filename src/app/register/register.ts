import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router'; 
import { NavbarComponent } from '../navbar/navbar'; 
import { AuthService } from '../services/auth';

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
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async register() {
    if (this.form.invalid) return;
    const { email, password, displayName } = this.form.value;
    try {
      await this.authService.register(email, password, displayName);
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }
}