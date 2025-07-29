#!/bin/bash
# Script tự động cập nhật version cho cache busting

# Tạo version từ timestamp hiện tại
VERSION=$(date +"%Y%m%d%H%M")

echo "🔄 Updating version to: $VERSION"

# Cập nhật version trong index.html
sed -i "s/\?v=[0-9]*/\?v=$VERSION/g" index.html

# Cập nhật version trong các file JS
sed -i "s/\?v=[0-9]*/\?v=$VERSION/g" otp.js
sed -i "s/\?v=[0-9]*/\?v=$VERSION/g" messageRenderer.js

echo "✅ Version updated successfully!"
echo "📝 Files updated:"
echo "   - index.html (CSS and main JS)"
echo "   - otp.js (imports)"
echo "   - messageRenderer.js (imports)"

echo ""
echo "📋 Next steps:"
echo "   1. Test the application"
echo "   2. git add ."
echo "   3. git commit -m 'Update version to $VERSION'"
echo "   4. git push"