import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth';
import { Navigation } from '../services/navigation';


@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss'],
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
export class ResultadosComponent {


  constructor(private navService: Navigation) {}

  irA(ruta: string) {
    this.navService.irA(ruta);
  }
}
