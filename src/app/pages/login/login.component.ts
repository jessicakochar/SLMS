import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMsg: string;
  loginForm: FormGroup;

  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    });
  }

  loginUser() {
    this.loader = true;
    let values: { email: string; password: string } = { ...this.loginForm.value };
    this.authService.fetchUserFromFirestore(values)
      .then(
        () => this.loader = false,
        (err) => {
          this.loader = false;
          this.errorMsg = err;
        })
  }

}
