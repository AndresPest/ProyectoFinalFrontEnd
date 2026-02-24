import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GradcamService {
  private apiUrl = 'https://croxx312-reconocimientoemocional.hf.space/api/gradcam'; // ajusta host/puerto
        
  constructor(private http: HttpClient) {}

  generarMapaCalor(imagenBase64: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { image: imagenBase64 });
  }

  /*return this.http.post<any>('http://localhost:5000/api/gradcam', { imagen: imagenB64 })
      .subscribe({
        next: res => {
          this.mensaje = `✅ Rostro detectado con ${res.puntos?.length || 0} puntos`;
          console.log(res.puntos);
        },
        error: err => {
          console.error('Error al contactar con backend:', err);
          this.mensaje = '❌ No se pudo contactar con el backend';
        }
      });*/


}
