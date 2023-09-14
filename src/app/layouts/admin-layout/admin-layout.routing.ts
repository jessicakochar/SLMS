import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { BooksComponent } from 'src/app/pages/books/books.component';
import { StaffComponent } from 'src/app/pages/staff/staff.component';
import { ConfigComponent } from 'src/app/pages/config/config.component';
import { TagsComponent } from 'src/app/pages/tags/tags.component';
import { IssueListComponent } from 'src/app/pages/issue-list/issue-list.component';
import { NewIssueComponent } from 'src/app/pages/new-issue/new-issue.component';
import { PlansComponent } from 'src/app/pages/plans/plans.component';
import { MembersComponent } from 'src/app/pages/members/members.component';
import { CatalogueComponent } from 'src/app/pages/catalogue/catalogue.component';
import { UserHistoryComponent } from 'src/app/pages/user-history/user-history.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user-profile', component: UserProfileComponent },
    { path: 'catalogue', component: CatalogueComponent },
    { path: 'tables', component: TablesComponent },
    { path: 'icons', component: IconsComponent },
    { path: 'maps', component: MapsComponent },
    { path: 'books', component: BooksComponent },
    { path: 'staff', component: StaffComponent },
    { path: 'members', component: MembersComponent },
    { path: 'userHistory', component: UserHistoryComponent },
    { path: 'plans', component: PlansComponent },
    { path: 'newIssue', component: NewIssueComponent },
    { path: 'issueList', component: IssueListComponent },
    { path: 'tags', component: TagsComponent },
    { path: 'config', component: ConfigComponent },

];
