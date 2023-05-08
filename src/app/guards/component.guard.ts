import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';
import { take, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AdminModel } from '../utils/AdminModel';

@Injectable({
  providedIn: 'root'
})
export class ComponentGuard implements CanActivate {
  adminModel: AdminModel;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.adminModel = JSON.parse(localStorage.getItem('admin'));
    return this.authService.user$.pipe(
      take(1),
      map(user => (user && this.adminModel.roles[route.url[0]['path']] && this.adminModel.status)  ? true : false),
      tap(canGo => {
        if (!canGo) {
          this.toastr.warning("You don't have sufficent permissions to access this.");
        }
      })
    );
  }

}
