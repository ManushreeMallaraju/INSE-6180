import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { map, catchError } from 'rxjs/operators';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

interface AuthResponse {
  status: string;
  success: string;
  token: string;
}

interface JWTResponse {
  status: string;
  success: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  tokenKey = 'JWT';
  isAuthenticated = false;
  username: Subject<string> = new Subject<string>();
  authToken: string = undefined;
  isAdmin: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  clearUserName() {
    this.username.next(undefined);
    this.isAdmin.next(undefined);
  }

  destroyCredentials() {
    this.authToken = undefined;
    this.clearUserName();
    this.isAuthenticated = false;
    localStorage.removeItem(this.tokenKey);
  }

  sendUserName(name: string, admin:boolean) {
    this.username.next(name);
    this.isAdmin.next(admin);
  }

  checkJWTtoken() {
    this.http.get<JWTResponse>(baseURL + 'users/checkJWTtoken')
      .subscribe(res => {
        console.log('JWT token valid:', res);
        this.sendUserName(res.user.username, res.user.admin);
      }, 
      err => {
        console.log('JWT token invalid', err);
        this.destroyCredentials();
      })
  }

  useCredentials(credentials: any) {
    this.isAuthenticated = true;
    this.sendUserName(credentials.username, credentials.admin);
    this.authToken = credentials.token;
  }

  loadUserCredentials() {
    const credentials = JSON.parse(localStorage.getItem(this.tokenKey));
    console.log('load User Credentials', credentials);
    if(credentials && credentials.username !== undefined) {
      this.useCredentials(credentials);
      if(this.authToken) {
        this.checkJWTtoken();
      }
    }
  }

  storeUserCredentials(credentials: any) {
    console.log("Credentials", credentials);
    localStorage.setItem(this.tokenKey, JSON.stringify(credentials));
    this.useCredentials(credentials);
  }

  logIn(user: any): Observable<any> {
    return this.http.post<AuthResponse>(baseURL + 'users/login', { 'username': user.username, 'password': user.password })
      .pipe(map(res => {
        this.storeUserCredentials({ username: user.username, token: res.token});
        return { 'success': true, 'username': user.username};
      }),
        catchError(error => this.processHTTPMsgService.handleError));
  }

  getUserName(): Observable<string> {
    return this.username.asObservable();
  }

  checkIsAdmin(): Observable<boolean> {
    return this.isAdmin.asObservable();
  }

  logOut() {
    this.destroyCredentials();
  }

  getToken() : string {
    return this.authToken;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
