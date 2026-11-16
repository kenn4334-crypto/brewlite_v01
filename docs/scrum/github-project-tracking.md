# BREWLITE — HƯỚNG DẪN THIẾT LẬP VÀ THEO DÕI GITHUB PROJECT & MILESTONES

| Thông tin cấu hình | Chi tiết |
|---|---|
| **Dự án** | BrewLite (Assignment 1) |
| **Repository** | [`vohuunghiaah/brewlite_v01`](https://github.com/vohuunghiaah/brewlite_v01) |
| **Mục đích** | Đề xuất cấu trúc chuẩn hóa việc quản lý 3 Sprints trên nền tảng GitHub Projects (Project V2), Milestones và Issues, đồng bộ trực tiếp với các Pull Request thực tế. |

---

## 1. Hiện trạng trên GitHub của repository `brewlite_v01`

- **GitHub Issues & Milestones:** Hiện tại repository `vohuunghiaah/brewlite_v01` chưa có Issue hoặc Milestone nào (`open_issues_count: 0`).
- **GitHub Projects:** Tài khoản `vohuunghiaah` đang có một dự án bảng Kanban: `BrewLite — Product Backlog` (Project #2), tuy nhiên các issue trong dự án đó (`[BL-00]` đến `[BL-04]`) đang thuộc về repository `brewlite` (Assignment 2).
- **Quyền hạn truy cập:** Tài khoản hiện tại có đầy đủ quyền quản trị (`admin: true`), cho phép tạo Milestones, Issues và liên kết Project.
- **Nguyên tắc triển khai:** Tránh tạo rác dữ liệu (spam issues) hoặc tự động sinh ra các issue hàng loạt gây trùng lặp. Đề xuất cấu trúc chuẩn hóa dưới đây để nhóm sinh viên / Product Owner chủ động kích hoạt hoặc phê duyệt.

---

## 2. Đề xuất cấu trúc 3 Milestones trên GitHub

Để phân tách rõ ràng 3 Sprint theo đề bài Assignment 1 mà **không dùng Git branch để thay thế khái niệm Sprint**, nhóm đề xuất tạo 3 Milestones chuẩn như sau:

| Milestone Title | Mô tả chi tiết | Thời hạn (Due Date) | Các Tasks trực thuộc |
|---|---|:---:|---|
| **`Sprint 1: Nền tảng & Hiển thị Menu`** | Xây dựng kiến trúc Monorepo, API thực đơn `GET /products`, giao diện Menu chuẩn Figma Make và hộp thoại tùy biến sản phẩm. | Chưa xác nhận *(Đề xuất 2-3 ngày hoàn tất Task 4)* | Task 1, Task 2, Task 3, Task 4 |
| **`Sprint 2: Giỏ hàng, Đặt đơn & Xác thực`** | Quản lý state giỏ hàng (Cart), API tiếp nhận đơn `POST /orders`, hệ thống đăng ký/đăng nhập JWT và băm mật khẩu `bcrypt`. | Chưa xác nhận | Task 5, Task 6, Task 7 |
| **`Sprint 3: Thanh toán, Bàn giao & Nghiệp vụ nâng cao`** | Tích hợp cổng thanh toán giả lập, tra cứu đơn `GET /orders/me`, đóng gói Docker Compose và Order State Machine. | Chưa xác nhận | Task 8, Task 9, Task 10 |

---

## 3. Đề xuất cấu trúc GitHub Project Board (Kanban View)

Tạo một GitHub Project mới mang tên: **`BrewLite ASM1 — Scrum Board`** (loại Table + Board):

### Các cột trạng thái (Status Field):
1. **`📋 Product Backlog`**: Các công việc trong tương lai chưa đưa vào Sprint hiện tại (Task 5 đến Task 10).
2. **`🎯 Sprint Backlog / To Do`**: Các công việc thuộc phạm vi Sprint 1 chưa bắt đầu code (**Task 4**).
3. **`⏳ In Progress`**: Các công việc đang được phát triển trên nhánh tính năng riêng.
4. **`👀 In Review`**: Các nhánh đã mở Pull Request đang chờ kiểm thử và code review.
5. **`✅ Done`**: Các tính năng đã đáp ứng 100% Definition of Done và Pull Request đã merge vào `main` (**Task 1, Task 2, Task 3**).

---

## 4. Bảng ánh xạ Issue và Pull Request thực tế

Khi nhóm tạo các GitHub Issues cho từng Task, cấu hình liên kết với PR tương ứng như sau:

| Mã Task | Tiêu đề Issue đề xuất | Milestone | Trạng thái trên Board | Pull Request thực tế đã liên kết |
|:---:|---|:---:|:---:|---|
| **Task 1** | `[TASK-01] Khởi tạo dự án và cấu trúc Monorepo` | Sprint 1 | **Done** | [PR #1](https://github.com/vohuunghiaah/brewlite_v01/pull/1) |
| **Task 2** | `[TASK-02] API danh sách sản phẩm (NestJS GET /products)` | Sprint 1 | **Done** | [PR #2](https://github.com/vohuunghiaah/brewlite_v01/pull/2) |
| **Task 3** | `[TASK-03] Trang Menu Frontend (Next.js gọi /products)` | Sprint 1 | **Done** | [PR #6](https://github.com/vohuunghiaah/brewlite_v01/pull/6) (sau recovery từ PR #4) |
| **Task 4** | `[TASK-04] Chi tiết & tùy chọn sản phẩm (Size & Topping)` | Sprint 1 | **To Do** | *Sẽ mở khi bắt đầu code Task 4* |
| **Task 5** | `[TASK-05] Giỏ hàng (Client Cart State Management)` | Sprint 2 | **Product Backlog** | *Sprint 2* |
| **Task 6** | `[TASK-06] API tạo đơn hàng (NestJS POST /orders)` | Sprint 2 | **Product Backlog** | *Sprint 2* |
| **Task 7** | `[TASK-07] Đăng ký / Đăng nhập (Auth JWT & bcrypt)` | Sprint 2 | **Product Backlog** | *Sprint 2* |
| **Task 8** | `[TASK-08] Thanh toán không tiền mặt (Mock Payment)` | Sprint 3 | **Product Backlog** | *Sprint 3* |
| **Task 9** | `[TASK-09] Tra cứu đơn hàng & Đóng gói Docker Compose` | Sprint 3 | **Product Backlog** | *Sprint 3* |
| **Task 10** | `[TASK-10] Nghiệp vụ nâng cao (Order State Machine & Idempotent)` | Sprint 3 | **Product Backlog** | *Sprint 3* |

---

## 5. Quy tắc vận hành Git và Board (Workflow Guidelines)

1. **Không dùng nhánh Git để thay cho Sprint:** Nhánh Git chỉ phản ánh tính năng kỹ thuật (`feature/task-04-product-detail`, `fix/*`, `docs/*`), không tạo các nhánh dạng `sprint-1`, `sprint-2`. Sprint được quản lý bởi Milestone và Project Board.
2. **Không sửa đổi lịch sử các PR đã merge:** Giữ nguyên trạng thái PR #1 đến #6 trên GitHub.
3. **Mỗi Task gắn liền 1 Pull Request:** Khi hoàn thành Task 4, mở PR trỏ vào `main`, liên kết từ khóa tự động đóng Issue (ví dụ: `Closes #4` hoặc `Resolves #4`).
