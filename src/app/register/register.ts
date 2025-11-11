import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../services/user.service';
import { User } from '../models/usuario.model';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterOutlet, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class RegisterComponent {
  form: FormGroup;
  user = {
    displayName: '',
    email: '',
    password: ''
  };

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register() {
    if (this.form.valid) {
      this.userService.register(this.form.value as User);
    }
  }
}