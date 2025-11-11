import { Injectable } from '@angular/core';
import { User } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [];

  register(user: User) {
    this.users.push(user);
    console.log('Usuario registrado:', user);
  }

  getAllUsers(): User[] {
    return this.users;
  }
}