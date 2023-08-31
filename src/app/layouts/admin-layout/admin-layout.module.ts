import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BooksComponent } from '../../pages/books/books.component';
import { StaffComponent } from '../../pages/staff/staff.component';
import { MembersComponent } from '../../pages/members/members.component';
import { PlansComponent } from '../../pages/plans/plans.component';
import { NewIssueComponent } from '../../pages/new-issue/new-issue.component';
import { IssueListComponent } from '../../pages/issue-list/issue-list.component';
import { ConfigComponent } from '../../pages/config/config.component';
import { TagsComponent } from '../../pages/tags/tags.component';
// import { Catalogue } from 'src/app/utils/catalogueModel';
import { CatalogueComponent } from 'src/app/pages/catalogue/catalogue.component';


// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    ClipboardModule,
    ReactiveFormsModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    MapsComponent,
    BooksComponent,
    StaffComponent,
    MembersComponent,
    PlansComponent,
    NewIssueComponent,
    IssueListComponent,
    ConfigComponent,
    TagsComponent,
    CatalogueComponent,
  ]
})

export class AdminLayoutModule { }
