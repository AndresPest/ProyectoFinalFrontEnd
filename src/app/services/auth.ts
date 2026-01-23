import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(usuario: string, password: string): Observable<any> {
    return this.http.post('https://proyectofinalbackend-iuk0.onrender.com/api/login', { usuario, password });
  }
}