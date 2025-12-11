import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {
  private imagenB64: string | null = null;

  setImagen(imagen: string) {
    this.imagenB64 = imagen;
  }

  getImagen(): string | null {
    return this.imagenB64;
  }
}
