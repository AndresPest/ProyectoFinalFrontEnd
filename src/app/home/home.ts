import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../services/navigation';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
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
export class Home {

  constructor(private navService: Navigation, private authService: AuthService) {}

  irA(ruta: string) {
    if (ruta === 'cuestionario') {
      if (this.authService.currentUser) {
        this.navService.irA('cuestionario');
      } else {
        this.navService.irA('login');
      }
    }
  }

}
