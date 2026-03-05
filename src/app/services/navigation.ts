import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class Navigation {

  constructor(private router: Router) {}

  irA(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }
  
}
