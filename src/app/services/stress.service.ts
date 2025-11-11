import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EstresCuestionario } from '../models/estres-cuestionario.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StressService {
  constructor(private http: HttpClient) {}

  submitAnswers(respuestas: EstresCuestionario[]): Observable<any> {
    return this.http.post('http://localhost:5000/api/stress', { respuestas });
  }

  submitScore(puntaje: number): Observable<any> {
  return this.http.post('http://localhost:5000/api/estrescuestionario', { puntaje });
  }
}