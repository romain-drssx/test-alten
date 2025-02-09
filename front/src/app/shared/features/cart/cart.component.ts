import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { CommonModule } from '@angular/common';
import { Product } from "app/products/data-access/product.model";
import { CartService } from "./cart.component.service";
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
  standalone: true,
  imports: [CommonModule, CardModule, RouterLink, ButtonModule, BadgeModule],
})
export class CartComponent {
  cartItems: Product[] = [];

  isCartOpen = false;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((items: Product[]) => {
      this.cartItems = items;
    });
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  remove(product: Product) {
    this.cartService.removeToCart(product);
  }
}
