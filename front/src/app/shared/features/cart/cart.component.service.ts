import { Injectable } from '@angular/core';
import { Product } from 'app/products/data-access/product.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);

  cart$ = this.cartSubject.asObservable();

  addToCart(product: Product) {
    this.cartItems.push(product);
    this.cartSubject.next(this.cartItems);
  }

  removeToCart(product: Product) {
    const index = this.cartItems.findIndex((item: Product) => item.id === product.id);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.cartSubject.next([...this.cartItems]);
    }
  }

  getCartItems() {
    return this.cartItems;
  }
}