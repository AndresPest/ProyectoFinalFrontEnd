import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { Router, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-central-funciones',
  imports: [ NavbarComponent, RouterOutlet ],
  templateUrl: './central-funciones.html',
  styleUrl: './central-funciones.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInTrigger', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CentralFunciones {

  constructor(private router: Router) {}
  
  private routerAuth = inject(Router);

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
