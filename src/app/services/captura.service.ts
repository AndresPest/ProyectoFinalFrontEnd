import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {
  private urlBackendCNN = 'https://crojas3-detectoremociones.hf.space/api/emocion-cnn';
  private urlBackendFaceMesh = 'https://crojas3-detectoremociones.hf.space/api/emocion-facemesh';

  constructor(private http: HttpClient) {}

  async redimensionarImagen(base64Str: string, ancho: number, alto: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = 'data:image/jpeg;base64,' + base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
      };
    });
  }

  async analizarEmocionCNN(imagenB64: string) {
    const imagenReducida = await this.redimensionarImagen(imagenB64, 48, 48);
    return lastValueFrom(this.http.post<any>(this.urlBackendCNN, { imagen: imagenReducida }));
  }

  async analizarEmocionFaceMesh(datos: { imagen: string, puntos: any[] }) {
    const imagenProcesada = await this.redimensionarImagen(datos.imagen, 224, 224);
    return lastValueFrom(this.http.post<any>(this.urlBackendFaceMesh, { 
      imagen: imagenProcesada, 
      puntos: datos.puntos 
    }));
  }
}