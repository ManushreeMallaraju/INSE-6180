import { Injectable, Injector } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private inject: Injector) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authService = this.inject.get(AuthService);

        const authToken = authService.getToken();

        const authReq = req.clone({ headers: req.headers.set('Authorization', 'bearer ' + authToken)});
        return next.handle(authReq);
    }
}

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
    constructor(private inject: Injector) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authService = this.inject.get(AuthService);
        const authToken = authService.getToken();

        return next.handle(req)
            .pipe(tap((event: HttpEvent<any>) => {

            }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401 && authToken) {
                        console.log("Unauthorized Interceptor" + err);
                        authService.checkJWTtoken();
                    }
                }
            }));
    }
}