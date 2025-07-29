# 🔄 Version Management & Cache Busting

## Mục đích
Đảm bảo người dùng luôn nhận được phiên bản mới nhất của ứng dụng mà không cần xóa cache trình duyệt thủ công.

## Cách hoạt động
- Sử dụng **version query parameters** (`?v=YYYYMMDDHHMM`)
- Mỗi lần cập nhật code, version timestamp sẽ thay đổi
- Trình duyệt sẽ tự động tải file mới thay vì dùng cache cũ

## Cấu trúc File
```
index.html          -> style.css?v=202507290338, otp.js?v=202507290338
otp.js              -> constants.js?v=202507290338, messageRenderer.js?v=202507290338  
messageRenderer.js  -> messageTemplates.js?v=202507290338
```

## Cách sử dụng

### 🐧 Linux/Mac:
```bash
./update-version.sh
```

### 🪟 Windows:
```cmd
update-version.bat
```

### ✋ Thủ công:
1. Tạo timestamp: `date +"%Y%m%d%H%M"`
2. Thay thế tất cả `?v=XXXXXXXXXX` bằng timestamp mới trong:
   - `index.html`
   - `otp.js` 
   - `messageRenderer.js`

## Workflow Deploy

```bash
# 1. Cập nhật code
# 2. Chạy script update version
./update-version.sh

# 3. Commit & push
git add .
git commit -m "Update version for cache busting"
git push
```

## Lợi ích
✅ Tự động force update cho user cũ  
✅ Không cần xóa cache thủ công  
✅ Dễ maintain và deploy  
✅ Compatible với mọi trình duyệt  

## Lưu ý
- Mỗi lần deploy phải chạy script update version
- Version sử dụng format: YYYYMMDDHHMM (12 số)
- Script tự động backup file gốc (.backup)