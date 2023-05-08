import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(): Observable<boolean> | Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(true)
        } else {
          this.router.navigate(['/login'])
          resolve(false);
        }
      })
    })
  }

}
