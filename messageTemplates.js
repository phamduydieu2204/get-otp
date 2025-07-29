// 🎨 MESSAGE TEMPLATES - Định nghĩa template đẹp cho từng case
export const MESSAGE_TEMPLATES = {
  // ❌ ERRORS
  EMAIL_NOT_FOUND: {
    type: 'error',
    icon: '📧',
    title: 'Email không có trong hệ thống',
    content: 'Chúng tôi không tìm thấy email này trong danh sách đăng ký.',
    suggestions: [
      'Vui lòng điền đúng email (mà bạn sở hữu) đã đăng ký với Vidieu.vn',
      'Email phải trùng khớp chính xác với email bạn đã đăng ký dịch vụ ChatGPT Plus'
    ],
    note: 'Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi:',
    actions: [
      {
        text: '📘 Fanpage Facebook',
        link: 'https://www.facebook.com/vidieuvn.muatoolAmazon',
        type: 'facebook'
      },
      {
        text: '📱 Zalo hỗ trợ',
        link: 'https://zalo.me/0815282286',
        type: 'zalo'
      }
    ]
  },

  SUBSCRIPTION_EXPIRED: {
    type: 'warning',
    icon: '⏰',
    title: 'Chu kỳ sử dụng đã hết hạn',
    content: 'Gói dịch vụ của bạn đã hết hạn vào ngày {expiredDate} và cần được gia hạn.',
    suggestions: [],
    note: null,
    actions: [
      {
        text: 'Gia hạn ngay',
        link: 'https://vidieu.vn/chatgpt-4-0/',
        type: 'primary'
      },
      {
        text: '📘 Facebook',
        link: 'https://www.facebook.com/vidieuvn.muatoolAmazon',
        type: 'facebook'
      },
      {
        text: '📱 Zalo',
        link: 'https://zalo.me/0815282286',
        type: 'zalo'
      }
    ]
  },

  DEVICE_LIMIT_REACHED: {
    type: 'warning',
    icon: '📱',
    title: 'Đã đạt giới hạn thiết bị',
    content: 'Bạn đã sử dụng {currentDevices}/{maxDevices} thiết bị được phép trong gói.',
    suggestions: [
      'Đăng xuất khỏi thiết bị khác để tiếp tục',
      'Hoặc nâng cấp gói để tăng số thiết bị'
    ],
    note: 'Bạn có thể quản lý thiết bị đã đăng nhập trong tài khoản',
    action: {
      text: 'Nâng cấp gói',
      link: 'https://vidieu.vn/upgrade'
    }
  },

  ACCOUNT_NOT_FOUND: {
    type: 'error',
    icon: '🔍',
    title: 'Không tìm thấy thông tin tài khoản',
    content: 'Có lỗi kỹ thuật trong việc truy xuất thông tin tài khoản.',
    suggestions: [
      'Vui lòng thử lại sau ít phút',
      'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn'
    ],
    note: null,
    action: {
      text: 'Liên hệ hỗ trợ',
      link: 'https://vidieu.vn/support'
    }
  },

  EMAIL_OTP_NOT_FOUND: {
    type: 'error',
    icon: '📬',
    title: 'Không tìm thấy email chứa mã OTP',
    content: 'Không tìm thấy email xác thực trong thời gian gần đây.',
    suggestions: [
      'Kiểm tra thư mục spam/junk',
      'Đảm bảo đã yêu cầu mã từ ứng dụng',
      'Thử lại với phương thức Authy'
    ],
    note: 'Email OTP thường được gửi trong vòng 1-2 phút',
    action: null
  },

  SYSTEM_ERROR: {
    type: 'error',
    icon: '⚠️',
    title: 'Lỗi hệ thống',
    content: '{error}',
    suggestions: [
      'Kiểm tra kết nối internet',
      'Thử lại sau 1-2 phút',
      'Liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn'
    ],
    note: 'Server có thể đang bảo trì hoặc quá tải',
    actions: [
      {
        text: 'Thử lại',
        link: 'javascript:location.reload()',
        type: 'primary'
      },
      {
        text: '📘 Facebook',
        link: 'https://www.facebook.com/vidieuvn.muatoolAmazon',
        type: 'facebook'
      },
      {
        text: '📱 Zalo',
        link: 'https://zalo.me/0815282286',
        type: 'zalo'
      }
    ]
  },

  // 🌐 NETWORK ERRORS - Chi tiết hóa lỗi kết nối
  NETWORK_ERROR: {
    type: 'error',
    icon: '🌐',
    title: 'Lỗi kết nối mạng',
    content: 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối internet của bạn.',
    suggestions: [
      'Kiểm tra kết nối WiFi/4G/5G',
      'Thử tắt và bật lại mạng',
      'Đổi sang mạng khác nếu có thể'
    ],
    note: 'Đây thường là vấn đề từ phía mạng internet của bạn',
    actions: [
      {
        text: 'Thử lại ngay',
        link: 'javascript:void(0)',
        type: 'retry'
      },
      {
        text: 'Chẩn đoán mạng',
        link: 'javascript:void(0)',
        type: 'diagnostic',
        action: 'runNetworkDiagnostic'
      }
    ]
  },

  TIMEOUT_ERROR: {
    type: 'warning',
    icon: '⏱️',
    title: 'Hết thời gian chờ',
    content: 'Yêu cầu mất quá nhiều thời gian để xử lý. Server có thể đang quá tải.',
    suggestions: [
      'Thử lại sau 30 giây',
      'Kiểm tra tốc độ mạng',
      'Đổi sang mạng nhanh hơn nếu có thể'
    ],
    note: 'Timeout thường xảy ra khi server đang xử lý nhiều yêu cầu cùng lúc',
    actions: [
      {
        text: 'Thử lại sau 30s',
        link: 'javascript:void(0)',
        type: 'retry-delayed'
      }
    ]
  },

  SERVER_OVERLOAD: {
    type: 'warning',
    icon: '🔥',
    title: 'Server đang quá tải',
    content: 'Server đang xử lý quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
    suggestions: [
      'Đợi 2-3 phút rồi thử lại',
      'Tránh spam click liên tục',
      'Thử lại vào lúc ít người dùng hơn'
    ],
    note: 'Giờ cao điểm (8-10h, 14-16h, 20-22h) thường có nhiều người dùng',
    actions: [
      {
        text: 'Thử lại sau 2 phút',
        link: 'javascript:void(0)',
        type: 'retry-delayed'
      }
    ]
  },

  QUOTA_EXCEEDED: {
    type: 'error',
    icon: '📊',
    title: 'Đã vượt quá giới hạn sử dụng',
    content: 'Hệ thống đã đạt giới hạn xử lý hàng ngày. Vui lòng thử lại vào ngày mai.',
    suggestions: [
      'Thử lại sau 00:00 (đêm nay)',
      'Liên hệ hỗ trợ để được tư vấn',
      'Nâng cấp gói dịch vụ để tăng quota'
    ],
    note: 'Quota được reset vào 00:00 GMT+7 hàng ngày',
    actions: [
      {
        text: '📘 Facebook',
        link: 'https://www.facebook.com/vidieuvn.muatoolAmazon',
        type: 'facebook'
      },
      {
        text: '📱 Zalo',
        link: 'https://zalo.me/0815282286',
        type: 'zalo'
      }
    ]
  },

  // ✅ SUCCESS
  CHECK_SUCCESS: {
    type: 'success',
    icon: '✅',
    title: 'Đủ điều kiện lấy mã OTP',
    content: 'Tài khoản của bạn hợp lệ và sẵn sàng lấy mã xác thực.',
    suggestions: [],
    note: null,
    action: null
  },

  OTP_SUCCESS: {
    type: 'success',
    icon: '🎉',
    title: 'Lấy mã OTP thành công',
    content: 'Mã xác thực đã được tạo và sẵn sàng sử dụng.',
    suggestions: [
      'Nhấp vào mã để sao chép',
      'Mã có hiệu lực trong 30 giây'
    ],
    note: null,
    action: null
  },

  // ℹ️ INFO
  WAITING_FOR_OTP: {
    type: 'info',
    icon: '⏳',
    title: 'Đang xử lý yêu cầu',
    content: 'Vui lòng đợi trong giây lát để hệ thống tạo mã OTP.',
    suggestions: [],
    note: null,
    action: null
  },

  COUNTDOWN_WAITING: {
    type: 'info',
    icon: '⏱️',
    title: 'Vui lòng đợi <span class="countdown-seconds">{seconds}</span> giây',
    content: 'Để đảm bảo mã OTP chính xác, hãy đợi đến chu kỳ tiếp theo.',
    suggestions: [],
    note: 'Mã OTP được làm mới mỗi 30 giây',
    action: null
  }
};

// 🎯 ERROR CODE MAPPING
export const ERROR_CODES = {
  'EMAIL_NOT_FOUND': 'EMAIL_NOT_FOUND',
  'SUBSCRIPTION_EXPIRED': 'SUBSCRIPTION_EXPIRED', 
  'DEVICE_LIMIT_REACHED': 'DEVICE_LIMIT_REACHED',
  'ACCOUNT_NOT_FOUND': 'ACCOUNT_NOT_FOUND',
  'EMAIL_OTP_NOT_FOUND': 'EMAIL_OTP_NOT_FOUND',
  'SYSTEM_ERROR': 'SYSTEM_ERROR',
  'NETWORK_ERROR': 'NETWORK_ERROR',
  'TIMEOUT_ERROR': 'TIMEOUT_ERROR',
  'SERVER_OVERLOAD': 'SERVER_OVERLOAD',
  'QUOTA_EXCEEDED': 'QUOTA_EXCEEDED',
  'CHECK_SUCCESS': 'CHECK_SUCCESS',
  'OTP_SUCCESS': 'OTP_SUCCESS',
  'WAITING_FOR_OTP': 'WAITING_FOR_OTP',
  'COUNTDOWN_WAITING': 'COUNTDOWN_WAITING'
};

// 🔧 NETWORK DIAGNOSTIC UTILITIES
export const NetworkDiagnostics = {
  // Kiểm tra kết nối internet cơ bản
  checkOnlineStatus: () => {
    return navigator.onLine;
  },
  
  // Ping test đơn giản
  pingTest: async (url = 'https://www.google.com/favicon.ico') => {
    try {
      const start = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD', 
        cache: 'no-cache',
        mode: 'no-cors'
      });
      const latency = Date.now() - start;
      return { success: true, latency };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Phân tích lỗi network
  analyzeNetworkError: (error) => {
    if (!navigator.onLine) {
      return 'NETWORK_OFFLINE';
    }
    
    if (error.name === 'AbortError') {
      return 'TIMEOUT_ERROR';
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return 'NETWORK_ERROR';
    }
    
    if (error.message?.includes('NetworkError')) {
      return 'NETWORK_ERROR';
    }
    
    if (error.message?.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    
    return 'SYSTEM_ERROR';
  }
};