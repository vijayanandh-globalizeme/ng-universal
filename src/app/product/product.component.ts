import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../post.service';
import { Location } from '@angular/common';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  post: any;

  constructor(private route: ActivatedRoute, private service: PostService) {
    const id = this.route.snapshot.paramMap.get('id');

    this.service.getPostData(id)
    .subscribe(response => {
      this.post = response;
    });

  }

  ngOnInit() { 
    
  }
}
