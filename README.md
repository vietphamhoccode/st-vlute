# ST VLUTE

ST VLUTE là ứng dụng Expo/React Native giúp sinh viên VLUTE xem nhanh thời khóa biểu, điểm số, hồ sơ học tập và lịch học trên điện thoại.

Ứng dụng này được thiết kế để sử dụng trực tiếp bằng tài khoản cổng đào tạo VLUTE, giúp sinh viên tra cứu thông tin học tập một cách nhanh chóng và tiện lợi.

## 1. Tính năng chính

- Đăng nhập bằng tài khoản cổng đào tạo VLUTE
- Xem trang chủ với thông tin học kỳ hiện tại
- Xem lịch học theo ngày
- Xem thời khóa biểu theo ngày hoặc toàn học kỳ
- Xem điểm số và điểm thành phần từng môn
- Xem hồ sơ sinh viên và thông tin cố vấn học tập
- Cache dữ liệu cục bộ để giảm số lần gọi API

## 2. Cách tải và cài đặt ứng dụng

Sau khi dự án đã được build sẵn bằng EAS, bạn chỉ cần tải file APK/iOS về máy và cài đặt.

### 2.1 Tải APK Android

1. Mở link tải APK do dự án cung cấp.
2. Tải file APK về điện thoại Android.
3. Mở file APK.
4. Nếu hệ thống hiện cảnh báo “Cài đặt ứng dụng từ nguồn không xác định”, chọn:
   - Cài đặt
   - Cho phép
5. Chờ quá trình cài đặt hoàn tất.
6. Mở ứng dụng từ màn hình chính.

> Lưu ý: trên một số máy, bạn cần bật tính năng “Cài đặt ứng dụng từ nguồn không xác định” trong Cài đặt > Bảo mật.

### 2.2 Tải file iOS (.ipa hoặc file build nội bộ)

1. Tải file build iOS về máy Mac hoặc iPhone đã được cấp quyền.
2. Nếu là file .ipa, thường cần dùng TestFlight hoặc phương pháp cài đặt nội bộ từ Apple Developer.
3. Nếu đang dùng máy Mac và Xcode, có thể cài trực tiếp bằng Xcode hoặc qua TestFlight.
4. Mở ứng dụng sau khi cài đặt xong.

> iOS thường khó cài hơn Android vì cần môi trường Apple, Xcode và quyền phát triển. Nếu bạn chỉ cần dùng thử, nên dùng TestFlight hoặc build nội bộ từ Apple Developer.

## 3. Cách cài đặt trên Android

### Bước 1: Bật cài đặt từ nguồn không xác định

- Vào Cài đặt
- Chọn Bảo mật hoặc Bảo mật và quyền riêng tư
- Bật Cho phép cài đặt ứng dụng từ nguồn không xác định

### Bước 2: Cài APK

- Mở file APK đã tải
- Chọn Cài đặt
- Đợi hoàn tất

### Bước 3: Mở ứng dụng

- Sau khi cài xong, mở ứng dụng từ màn hình chính
- Đăng nhập bằng tài khoản VLUTE của bạn

## 4. Cách cài đặt trên iOS

### Phương án 1: Qua TestFlight (được khuyến nghị)

1. Cài TestFlight trên iPhone.
2. Mở link phân phối do người phát triển gửi.
3. Chọn cài đặt.
4. Mở ứng dụng từ màn hình chính sau khi cài xong.

### Phương án 2: Cài bằng Xcode trên Mac

1. Cài Xcode.
2. Kết nối iPhone với máy Mac.
3. Mở Xcode và chọn thiết bị.
4. Build và cài ứng dụng trực tiếp.

> Nếu bạn không có môi trường Mac và Apple Developer, việc cài iOS sẽ khó hơn Android.

## 5. Cách build file ứng dụng (nếu cần tự build)

### Build Android

```bash
npx eas build --platform android --profile preview
```

### Build iOS

```bash
npx eas build --platform ios --profile preview
```

Sau khi build xong, bạn sẽ nhận được file hoặc link tải để phân phối cho người dùng.

## 6. Nguyên lý hoạt động của ứng dụng

### 6.1 Đăng nhập

Ứng dụng kết nối với hệ thống cổng đào tạo VLUTE để xác thực tài khoản người dùng.

### 6.2 Lấy dữ liệu sinh viên

Sau khi đăng nhập thành công, app sẽ gọi các API sinh viên để lấy:
- thời khóa biểu
- điểm số
- thông tin hồ sơ
- học kỳ hiện tại

### 6.3 Cache dữ liệu

Để giảm số lần gọi mạng, ứng dụng lưu cache cục bộ bằng bộ nhớ thiết bị. Khi mở lại, dữ liệu có thể được tải nhanh hơn mà không cần gọi lại liên tục.

### 6.4 Giao diện

Ứng dụng dùng React Native + Expo để hiển thị giao diện trên cả Android và iOS với trải nghiệm gần giống nhau.

## 7. Lưu ý bảo mật

- Không chia sẻ mật khẩu hoặc token đăng nhập.
- Không cài ứng dụng từ nguồn không rõ ràng.
- Chỉ dùng tài khoản của chính bạn.
- Nếu dùng máy lạ, hãy đăng xuất khỏi ứng dụng trước khi trả lại.

## 8. Hỗ trợ

Nếu gặp lỗi khi cài đặt hoặc sử dụng, vui lòng kiểm tra:
- kết nối internet
- phiên bản Android/iOS phù hợp
- quyền cài đặt ứng dụng
- tài khoản VLUTE đang hoạt động
