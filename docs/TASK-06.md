# TÀI LIỆU THIẾT KẾ & TRIỂN KHAI TASK 6: API TẠO ĐƠN HÀNG (`POST /orders`)

| Thông tin dự án | Chi tiết |
|---|---|
| **Dự án** | BrewLite (Hệ thống đặt cà phê và thanh toán không tiền mặt) |
| **Môn học** | Công nghệ Phần mềm — HK I (2026–2027) |
| **Hạng mục** | Task 6: API tạo đơn hàng (`POST /orders`) |
| **Quy trình áp dụng** | Agile Scrum (Sprint 2) |
| **Branch Git** | `feature/task-06-create-order-api` |
| **Điểm mục tiêu** | 1.0 / 1.0 điểm |

---

## 1. Phân tích & Thiết kế Nghiệp vụ Task 6

Dựa trên đặc tả đề bài (Mục 8, 9.1, 12.1, 12.2) và dữ liệu thực đơn từ Task 2:

- **Endpoint:** `POST /orders` (Public ở Task 6; sẽ gắn `@UseGuards(JwtAuthGuard)` ở Task 7 theo đúng lộ trình backlog, nên trường `userId` thiết kế ở dạng optional lúc này để không chặn kiểm thử).
- **Validation (`class-validator` + `ValidationPipe`):**
  - Giỏ hàng `items` bắt buộc là mảng không rỗng (`@ArrayMinSize(1)`).
  - Mỗi phần tử `OrderItemDto` phải có `productId` (tồn tại trong danh sách sản phẩm của `ProductsService`), `size` (`S` | `M` | `L`), `toppings` (mảng tùy chọn, chỉ chấp nhận các topping hợp lệ từ thực đơn Figma), và `qty` (số nguyên $\ge 1$).
- **Tính giá phía Server (Chống gian lận giá từ Client):** Backend tự tính `unitPrice`, `lineTotal` và `total` dựa trên bảng giá gốc của `ProductsService` + phụ thu Size/Topping đã chốt ở Task 2:
  - **Size:** `S` (+0đ), `M` (+6.000đ), `L` (+12.000đ).
  - **Topping:** `Trân châu trắng` (+8.000đ), `Kem cheese macchiato` (+10.000đ).
- **Trạng thái khởi tạo:** Đơn hàng lưu thành công luôn mang trạng thái `PENDING` và trả về mã đơn (ví dụ: `ORD-20261117-XXXX`) kèm chi tiết đơn hàng (`HTTP 201 Created`).
- **Lưu trữ:** Đóng gói sạch qua Repository pattern / In-Memory Store (bất biến khi trả ra ngoài), sẵn sàng thay thế bằng Prisma/PostgreSQL ở Task 9 mà không phải sửa Controller hay DTO.

---

## 2. Cấu trúc thư mục mới trong `backend/src/`

```text
backend/src/
├── main.ts                          # Kích hoạt Global ValidationPipe
├── app.module.ts                    # Import OrdersModule
├── products/                        # (Đã có từ Task 2)
│   └── products.module.ts           # Export ProductsService để OrdersModule sử dụng
└── orders/
    ├── orders.types.ts              # Định nghĩa Order, OrderItem, OrderStatus, bảng giá Size/Topping
    ├── dto/
    │   └── create-order.dto.ts      # DTO validation với class-validator & class-transformer
    ├── orders.service.ts            # Xử lý kiểm tra sản phẩm, tính tiền, tạo đơn PENDING
    ├── orders.controller.ts         # Endpoint POST /orders
    ├── orders.module.ts             # Đóng gói OrdersModule
    ├── orders.service.spec.ts       # Unit test cho OrdersService
    └── orders.controller.spec.ts    # Unit test cho OrdersController
```

> **Lưu ý cài đặt thư viện:** Nếu `backend/package.json` chưa cài đặt sẵn bộ validation, chạy lệnh:
> ```bash
> npm --prefix backend install class-validator class-transformer
> ```

---

## 3. Mã nguồn chi tiết (Chuẩn TypeScript & Oxlint)

### A. Cập nhật `backend/src/products/products.module.ts` & `backend/src/main.ts`

Trong `backend/src/products/products.module.ts`, thêm `exports: [ProductsService]` để `OrdersModule` tiêm (`inject`) được `ProductsService`:

```typescript
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

Trong `backend/src/main.ts`, bật `ValidationPipe` toàn cục:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
void bootstrap();
```

---

### B. `backend/src/orders/orders.types.ts`

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DrinkSize {
  S = 'S',
  M = 'M',
  L = 'L',
}

export const SIZE_SURCHARGE: Readonly<Record<DrinkSize, number>> = Object.freeze({
  [DrinkSize.S]: 0,
  [DrinkSize.M]: 6000,
  [DrinkSize.L]: 12000,
});

export const TOPPING_PRICES: Readonly<Record<string, number>> = Object.freeze({
  'Trân châu trắng': 8000,
  'Kem cheese macchiato': 10000,
});

export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly size: DrinkSize;
  readonly toppings: readonly string[];
  readonly qty: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
}

export interface Order {
  readonly id: string;
  readonly userId?: string;
  readonly status: OrderStatus;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly note?: string;
  readonly createdAt: string;
}
```

---

### C. `backend/src/orders/dto/create-order.dto.ts`

```typescript
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DrinkSize, TOPPING_PRICES } from '../orders.types';

const ALLOWED_TOPPINGS = Object.keys(TOPPING_PRICES);

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId!: string;

  @IsEnum(DrinkSize, { message: 'size phải là một trong các giá trị: S, M, L' })
  size!: DrinkSize;

  @IsOptional()
  @IsArray({ message: 'toppings phải là một mảng chuỗi' })
  @IsString({ each: true })
  @IsIn(ALLOWED_TOPPINGS, {
    each: true,
    message: `Topping không hợp lệ. Chỉ hỗ trợ: ${ALLOWED_TOPPINGS.join(', ')}`,
  })
  toppings?: string[];

  @IsInt({ message: 'qty phải là số nguyên' })
  @Min(1, { message: 'qty tối thiểu phải bằng 1' })
  qty!: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'items phải là một mảng sản phẩm' })
  @ArrayMinSize(1, { message: 'Giỏ hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Ghi chú tối đa 200 ký tự' })
  note?: string;
}
```

---

### D. `backend/src/orders/orders.service.ts`

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  SIZE_SURCHARGE,
  TOPPING_PRICES,
} from './orders.types';

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  constructor(private readonly productsService: ProductsService) {}

  create(dto: CreateOrderDto, userId?: string): Order {
    const products = this.productsService.findAll();
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems: OrderItem[] = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId);
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm với mã '${itemDto.productId}' không tồn tại trong thực đơn.`,
        );
      }

      const uniqueToppings = Array.from(new Set(itemDto.toppings ?? []));
      const toppingsCost = uniqueToppings.reduce(
        (sum, topping) => sum + (TOPPING_PRICES[topping] ?? 0),
        0,
      );
      const sizeCost = SIZE_SURCHARGE[itemDto.size];
      const unitPrice = product.price + sizeCost + toppingsCost;
      const lineTotal = unitPrice * itemDto.qty;

      return Object.freeze({
        productId: product.id,
        productName: product.name,
        size: itemDto.size,
        toppings: Object.freeze(uniqueToppings),
        qty: itemDto.qty,
        unitPrice,
        lineTotal,
      });
    });

    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const newOrder: Order = Object.freeze({
      id: this.generateOrderCode(),
      ...(userId ? { userId } : {}),
      status: OrderStatus.PENDING,
      items: Object.freeze(orderItems),
      total,
      ...(dto.note?.trim() ? { note: dto.note.trim() } : {}),
      createdAt: new Date().toISOString(),
    });

    this.orders.push(newOrder);
    return newOrder;
  }

  findAll(): readonly Order[] {
    return Object.freeze([...this.orders]);
  }

  findById(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id);
  }

  private generateOrderCode(): string {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const randomPart = randomBytes(2).toString('hex').toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }
}
```

---

### E. `backend/src/orders/orders.controller.ts`, `orders.module.ts` & `app.module.ts`

**`backend/src/orders/orders.controller.ts`**
```typescript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import type { Order } from './orders.types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto): Order {
    return this.ordersService.create(createOrderDto);
  }
}
```

**`backend/src/orders/orders.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

**`backend/src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 4. Bộ Kiểm thử Tự động (Vitest — Unit & E2E)

### A. `backend/src/orders/orders.service.spec.ts`

```typescript
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ProductsService } from '../products/products.service';
import { OrdersService } from './orders.service';
import { DrinkSize, OrderStatus } from './orders.types';

describe('OrdersService', () => {
  const createService = () => new OrdersService(new ProductsService());

  it('tạo đơn hàng trạng thái PENDING và tính tổng tiền chính xác kèm size & topping', () => {
    const service = createService();

    // Cà phê sữa đá (35.000) + Size M (+6.000) + Trân châu trắng (+8.000) = 49.000 * 2 = 98.000
    // Trà đào cam sả (39.000) + Size S (+0) = 39.000 * 1 = 39.000
    // Tổng = 137.000
    const order = service.create({
      items: [
        {
          productId: 'coffee-001',
          size: DrinkSize.M,
          toppings: ['Trân châu trắng'],
          qty: 2,
        },
        {
          productId: 'tea-001',
          size: DrinkSize.S,
          qty: 1,
        },
      ],
      note: 'Ít đá giúp mình',
    });

    expect(order.id).toMatch(/^ORD-\d{8}-[0-9A-F]{4}$/);
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.items).toHaveLength(2);
    expect(order.items[0].unitPrice).toBe(49000);
    expect(order.items[0].lineTotal).toBe(98000);
    expect(order.total).toBe(137000);
    expect(order.note).toBe('Ít đá giúp mình');
    expect(service.findAll()).toHaveLength(1);
  });

  it('ném lỗi BadRequestException khi productId không tồn tại', () => {
    const service = createService();

    expect(() =>
      service.create({
        items: [{ productId: 'invalid-id', size: DrinkSize.S, qty: 1 }],
      }),
    ).toThrow(BadRequestException);
  });
});
```

### B. Bổ sung vào `backend/test/app.e2e-spec.ts` (Kiểm thử `ValidationPipe` & `POST /orders`)

Đảm bảo trong `beforeAll` của E2E test cũng gắn `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` giống `main.ts`, sau đó thêm các test case sau:

```typescript
it('POST /orders -> 201 Created, trả về mã đơn và trạng thái PENDING', async () => {
  const response = await request(app.getHttpServer())
    .post('/orders')
    .send({
      items: [
        {
          productId: 'coffee-004',
          size: 'L',
          toppings: ['Kem cheese macchiato'],
          qty: 1,
        },
      ],
    })
    .expect(201);

  expect(response.body.id).toMatch(/^ORD-\d{8}-[0-9A-F]{4}$/);
  expect(response.body.status).toBe('PENDING');
  // Cold Brew Muối (42.000) + Size L (12.000) + Kem cheese (10.000) = 64.000
  expect(response.body.total).toBe(64000);
});

it('POST /orders -> 400 Bad Request khi giỏ hàng rỗng hoặc sai dữ liệu', async () => {
  await request(app.getHttpServer())
    .post('/orders')
    .send({ items: [] })
    .expect(400);

  await request(app.getHttpServer())
    .post('/orders')
    .send({
      items: [{ productId: 'coffee-001', size: 'XL', qty: 0 }],
    })
    .expect(400);
});
```

---

## 5. Lệnh kiểm tra & Xác minh trước khi tạo PR

Chạy tuần tự trên terminal từ thư mục gốc dự án:

1. **Tạo nhánh chuẩn Git Flow:**
   ```bash
   git checkout -b feature/task-06-create-order-api
   ```
2. **Chạy Lint, Unit Test, E2E Test và Build:**
   ```bash
   npm run lint
   npm run test:backend
   npm --prefix backend run test:e2e
   npm run build
   ```
3. **Kiểm thử thủ công với HTTP request (PowerShell):**
   ```powershell
   $body = @{
     items = @(
       @{ productId = "coffee-001"; size = "M"; toppings = @("Trân châu trắng"); qty = 2 }
     )
     note = "Ít ngọt"
   } | ConvertTo-Json -Depth 3

   Invoke-RestMethod -Uri "http://localhost:3001/orders" -Method Post -ContentType "application/json" -Body $body
   ```