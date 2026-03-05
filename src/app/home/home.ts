import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../services/navigation';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  constructor(private navService: Navigation) {}

  irA(ruta: string) {
    this.navService.irA(ruta);
  }

}
