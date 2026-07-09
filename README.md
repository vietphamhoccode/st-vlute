<div align="center">

<img src="https://i.ibb.co/ns2CNXxw/logo.png" alt="ST VLUTE Logo" width="120" height="120">

# ST VLUTE

**Thời khóa biểu • Điểm số • Hồ sơ học tập — gọn trong một ứng dụng**

Ứng dụng di động dành cho sinh viên VLUTE, giúp tra cứu thông tin học tập nhanh chóng ngay trên điện thoại.

![Android](https://img.shields.io/badge/Android-Available-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-Coming%20Soon-8E8E93?style=for-the-badge&logo=apple&logoColor=white)
![Expo](https://img.shields.io/badge/Made%20with-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

</div>

<br>

## Mục lục

- [Giới thiệu](#gioi-thieu)
- [Tính năng chính](#tinh-nang-chinh)
- [Tải xuống & Cài đặt](#tai-xuong-cai-dat)
- [Nguyên lý hoạt động](#nguyen-ly-hoat-dong)
- [Lưu ý bảo mật](#luu-y-bao-mat)
- [Hỗ trợ](#ho-tro)

<br>

<a id="gioi-thieu"></a>

## 📖 Giới thiệu

**ST VLUTE** là ứng dụng Expo/React Native giúp sinh viên VLUTE xem nhanh thời khóa biểu, điểm số, hồ sơ học tập và lịch học ngay trên điện thoại.

Ứng dụng sử dụng trực tiếp tài khoản **cổng đào tạo VLUTE**, giúp sinh viên tra cứu thông tin học tập một cách nhanh chóng và tiện lợi, không cần đăng ký thêm tài khoản riêng.

<a id="tinh-nang-chinh"></a>

## ✨ Tính năng chính

|  | Tính năng | Mô tả |
|:---:|---|---|
| 🔐 | **Đăng nhập** | Đăng nhập trực tiếp bằng tài khoản cổng đào tạo VLUTE |
| 🏠 | **Trang chủ** | Xem thông tin học kỳ hiện tại |
| 📅 | **Lịch học** | Xem lịch học theo từng ngày |
| 🗓️ | **Thời khóa biểu** | Xem theo ngày hoặc theo toàn bộ học kỳ |
| 📊 | **Điểm số** | Xem điểm số và điểm thành phần từng môn học |
| 👤 | **Hồ sơ sinh viên** | Xem hồ sơ và thông tin cố vấn học tập |
| ⚡ | **Cache dữ liệu** | Lưu cache cục bộ, giảm số lần gọi API |

<a id="tai-xuong-cai-dat"></a>

## 📥 Tải xuống & Cài đặt

### 🤖 Android — Đã sẵn sàng

<div align="center">

[![Download APK](https://img.shields.io/badge/Download-APK%20for%20Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://drive.google.com/file/d/1wEjtsMixw0yZRBK9JDnyNMRzwE3kgJO9/view?usp=sharing)

</div>

**Hướng dẫn cài đặt:**

1. Mở **[link tải APK](https://drive.google.com/file/d/1wEjtsMixw0yZRBK9JDnyNMRzwE3kgJO9/view?usp=sharing)** ở trên và tải file về điện thoại.
2. Mở file APK vừa tải xuống.
3. Nếu hệ thống hiện cảnh báo *"Cài đặt ứng dụng từ nguồn không xác định"*, chọn **Cài đặt** → **Cho phép**.
   - Trên một số máy, cần bật thủ công tại **Cài đặt → Bảo mật → Cho phép cài đặt ứng dụng từ nguồn không xác định**.
4. Chờ quá trình cài đặt hoàn tất.
5. Mở ứng dụng từ màn hình chính và đăng nhập bằng tài khoản VLUTE của bạn.

### 🍎 iOS — Sắp ra mắt

> 🚧 Phiên bản iOS hiện đang được phát triển và sẽ sớm ra mắt. Hãy đón chờ nhé!

<a id="nguyen-ly-hoat-dong"></a>

## ⚙️ Nguyên lý hoạt động

**Đăng nhập**
Ứng dụng kết nối trực tiếp với hệ thống cổng đào tạo VLUTE để xác thực tài khoản người dùng.

**Lấy dữ liệu sinh viên**
Sau khi đăng nhập thành công, ứng dụng gọi các API sinh viên để lấy:
- Thời khóa biểu
- Điểm số
- Thông tin hồ sơ
- Học kỳ hiện tại

**Cache dữ liệu**
Để giảm số lần gọi mạng, ứng dụng lưu cache cục bộ bằng bộ nhớ thiết bị. Khi mở lại, dữ liệu được tải nhanh hơn mà không cần gọi lại liên tục.

**Giao diện**
Ứng dụng được xây dựng bằng **React Native + Expo**, mang lại trải nghiệm gần giống nhau trên cả Android và iOS.

<a id="luu-y-bao-mat"></a>

## 🔐 Lưu ý bảo mật

- ❌ Không chia sẻ mật khẩu hoặc token đăng nhập.
- ❌ Không cài ứng dụng từ nguồn không rõ ràng.
- ✅ Chỉ dùng tài khoản của chính bạn.
- ✅ Nếu dùng máy lạ, hãy đăng xuất khỏi ứng dụng trước khi trả lại máy.

<a id="ho-tro"></a>

## 🆘 Hỗ trợ

Nếu gặp lỗi khi cài đặt hoặc sử dụng, vui lòng kiểm tra lại:

- [ ] Kết nối internet
- [ ] Phiên bản Android phù hợp
- [ ] Quyền cài đặt ứng dụng từ nguồn không xác định
- [ ] Tài khoản VLUTE đang hoạt động

---

<div align="center">

Được phát triển dành cho sinh viên VLUTE 💙

</div>
