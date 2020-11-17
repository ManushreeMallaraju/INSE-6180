import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReviewService } from '../services/review.service';
import { Review } from '../shared/review';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-review-dashboard',
  templateUrl: './review-dashboard.component.html',
  styleUrls: ['./review-dashboard.component.scss']
})
export class ReviewDashboardComponent implements OnInit {
  params: string;
  dataTrue:boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private reviewService: ReviewService, 
    private authService : AuthService, private route: Router) { }
  reviews: any[];
  filteredReviews: any[];
  ngOnInit() {
    this.activatedRoute.params.subscribe(data => {
      this.params = data['role'];
      if (this.params == 'admin') {
        this.reviewService.getAllReviews().subscribe(res => {
          console.log("Noise Added data " + res);
          
          this.decryptData(res).then(data => {
            this.reviews = data;
            this.filteredReviews = data;
            this.dataTrue = true;
            console.log("Original data without noise");
            
            this.reviews.forEach(a => {
              console.log(a);
            })
          });
        }, error => { this.route.navigate(['login']); })
      }
      else {
        this.reviewService.getReview(this.params).subscribe(res => {
          this.decryptData(res).then(data => {
            this.reviews = data;
            this.filteredReviews = data;
            this.dataTrue = true;
            console.log(data);
          });
        }, error => { this.route.navigate(['login']); })
      }
    })
    
  }

  decryptData(data) {
    return new Promise<[]>((resolve, reject) => {
    try {
      let bytes = CryptoJS.AES.decrypt(data, 'say-open');
      if (bytes.toString()) {
        let val = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        resolve(JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
      }

      // return data;
    } catch (e) {
      console.log(e);
    }
  })
  }


 

  logOut() {
    this.authService.destroyCredentials();
    this.reviews = [];
    this.filteredReviews = [];
    this.dataTrue = false;
    this.route.navigate(['login']);
  }

  applyFilter(query) {
    this.filteredReviews = this.reviews.filter(a => {return a.status.includes(query) || a.email.includes(query)});
  }

}
