import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { Subscription } from 'rxjs';

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

  private cd = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private authSub?: Subscription;

  menuAbierto = false;

  ngOnInit() {
      this.authSub = this.authService.user$.subscribe(() => {
        this.zone.run(() => {
          this.cd.detectChanges();
        });
      });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.cd.detectChanges();
  }
  
  async logout() {
    try {
      this.menuAbierto = false;
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
    this.menuAbierto = false;
    this.zone.run(() => {
      this.router.navigate([ruta]);
    });
  }
}
