import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {

  private urlBackendCNN = 'https://crojas3-detectoremociones.hf.space/api/emocion';
  private urlBackendFaceMesh = 'https://crojas3-detectoremociones.hf.space/api/emocion';

  constructor(private http: HttpClient) {}

  private imagenB64: string | null = null;

  setImagen(imagen: string) {
    this.imagenB64 = imagen;
  }

  getImagen(): string | null {
    return this.imagenB64;
  }



  async redimensionarImagen(base64Str: string, ancho: number = 48, alto: number = 48): Promise<string> {
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
    const imagenReducida = await this.redimensionarImagen(imagenB64);
    return lastValueFrom(this.http.post<any>(this.urlBackendCNN, { imagen: imagenReducida }));
  }

  async analizarEmocionFaceMesh(imagenB64: string) {
    const imagenReducida = await this.redimensionarImagen(imagenB64);
    return lastValueFrom(this.http.post<any>(this.urlBackendFaceMesh, { imagen: imagenReducida }));
  }
}
