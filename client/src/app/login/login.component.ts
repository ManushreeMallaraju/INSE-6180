import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  role: string;
  loginForm: FormGroup;
  user = { username: '', password: '', remember: false };
  subscription: Subscription;
  hideButton:boolean = false;
  admin;
  @ViewChild('closeButton', {
    static: false
  }) closeButton;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private route: Router) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
  }

  changeRole(name) {
    this.role = name;
  }

  validateUser() {
    console.log(this.user);
    this.authService.logIn(this.user)
      .subscribe(async res => {
        if (res.success) {
          console.log("Login Successful");
          this.authService.loadUserCredentials();
          this.subscription = await this.authService.checkIsAdmin()
            .subscribe(name => {
              console.log(name);
              this.admin = name;
              this.hideButton = true; 
            });
        }
        else
          console.log(res);
      }, error => {
        console.log(error)
      });
  }

  goToReview(){
    if (this.admin) {
      this.route.navigate(['review/' + 'admin']);
    }
    else {
      this.route.navigate(['review/' + this.user.username]);
    }
  }
  close() {
    this.closeButton.nativeElement.click();
  }
}
