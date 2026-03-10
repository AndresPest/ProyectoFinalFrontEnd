import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})

export class NavbarComponent {
  constructor(private router: Router) {}

  public authService = inject(AuthService);
  private routerAuth = inject(Router);

  user$ = this.authService.user$;

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
