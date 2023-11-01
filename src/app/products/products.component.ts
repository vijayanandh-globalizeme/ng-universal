import { Component, OnInit } from '@angular/core';
import { PRODUCTS } from '../mocked-products';
import { PostService } from '../post.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit {
  posts: any;

  constructor(private service: PostService) {}

  ngOnInit() {
    this.service.getPosts()
        .subscribe(response => {
          this.posts = response;
        });
   }
}
