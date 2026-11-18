import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { Product } from './products.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Product[] {
    return this.productsService.findAll();
  }
}