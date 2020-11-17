import { Injectable } from '@angular/core';
import { Review } from '../shared/review';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {

    constructor(private http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService) { }

    getAllReviews(): Observable<Review[]> {
        return this.http.get<Review[]>(baseURL + 'reviews')
            .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getReview(username): Observable<Review[]> {
        return this.http.get<Review[]>(baseURL + 'reviews/' + username)
            .pipe(catchError(this.processHTTPMsgService.handleError));
    }

}