import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'fas fa-chart-line text-primary', class: '' },
  { path: '/books', title: 'Manage Books', icon: 'fas fa-book text-primary', class: '' },
  { path: '/members', title: 'Manage Members', icon: 'fas fa-users text-primary', class: '' },
  { path: '/plans', title: 'Edit Membership Plans', icon: 'fas fa-money-check text-primary', class: '' },
  { path: '/newIssue', title: 'Issue Book', icon: 'fas fa-plus text-primary', class: '' },
  { path: '/issueList', title: 'Issue List', icon: 'fas fa-list-ul text-primary', class: '' },
  { path: '/tags', title: 'Edit Tags', icon: 'fas fa-tags text-primary', class: '' },
  { path: '/config', title: 'Edit Config', icon: 'fas fa-cog text-primary', class: '' },
  // { path: '/icons', title: 'Icons', icon: 'ni-planet text-blue', class: '' },
  // { path: '/maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '' },
  // { path: '/user-profile', title: 'User profile', icon: 'ni-single-02 text-yellow', class: '' },
  // { path: '/tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '' },
  // { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '' },
  // { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
}
