import { getConstants } from './constants.js?v=202507290338';
import { MessageRenderer } from './messageRenderer.js?v=202507290338';

let otpCountdown = null;
let otpValidityCountdown = null;
let messageRenderer = null;
let lastRequestTime = 0;
let isProcessing = false;
const RATE_LIMIT_DELAY = 5000; // 5 giây

// Hàm helper để reset trạng thái nút
function resetButton() {
  const btn = document.getElementById("btnGetOtp");
  if (btn) {
    isProcessing = false;
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    btn.classList.remove('processing');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const { SERVICES } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const output = document.getElementById("otpResult");
  
  // Khởi tạo message renderer
  messageRenderer = new MessageRenderer(output);

  // Xóa các option hiện tại trừ option đầu tiên
  softwareSelect.innerHTML = '';
  
  // Thêm các dịch vụ từ constants
  SERVICES.forEach((service, index) => {
    const option = document.createElement("option");
    option.value = service.value;
    option.textContent = service.label;
    if (index === 0) option.selected = true; // ChatGPT Plus là mặc định
    softwareSelect.appendChild(option);
  });
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const email = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value; // Lấy dịch vụ được chọn
  const otpSource = "authy"; // mặc định luôn dùng Authy
  const output = document.getElementById("otpResult");
  const btn = document.getElementById("btnGetOtp");

  // Vô hiệu hóa nút ngay lập tức
  btn.disabled = true;
  btn.textContent = "⏳ Đang xử lý...";
  btn.classList.add('processing');

  // Rate limiting check
  const now = Date.now();
  if (isProcessing) {
    messageRenderer.render('SYSTEM_ERROR', {
      error: "Đang xử lý yêu cầu trước đó. Vui lòng đợi..."
    });
    // Reset nút nếu đang xử lý
    resetButton();
    return;
  }

  if (now - lastRequestTime < RATE_LIMIT_DELAY) {
    const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000);
    messageRenderer.render('SYSTEM_ERROR', {
      error: `Vui lòng đợi ${remainingTime} giây trước khi thử lại`
    });
    // Reset nút nếu rate limited
    resetButton();
    return;
  }

  isProcessing = true;
  lastRequestTime = now;
  messageRenderer.render('WAITING_FOR_OTP');


  if (!email) {
    alert("Vui lòng nhập email của bạn!");
    resetButton();
    return;
  }

  const { BACKEND_URL } = getConstants();

  // Step 1: Gọi check với timeout
  let checkResult;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const checkRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getOtpCheck",
        email,
        software,
        otpSource
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!checkRes.ok) {
      throw new Error(`Server error: ${checkRes.status}`);
    }

    checkResult = await checkRes.json();
  } catch (error) {
    console.error("Lỗi kiểm tra OTP:", error);
    if (error.name === 'AbortError') {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Yêu cầu kiểm tra hết thời gian chờ. Vui lòng thử lại."
      });
    } else {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Không thể kết nối tới server. Vui lòng thử lại sau."
      });
    }
    resetButton();
    return;
  }

  if (checkResult.status === "error") {
    messageRenderer.render(checkResult.code || 'SYSTEM_ERROR', checkResult.data);
    resetButton();
    return;
  }

const currentTime = Date.now();
const msUntilNextOtp = 30000 - (currentTime % 30000);
const secondsLeft = Math.ceil(msUntilNextOtp / 1000);

if (secondsLeft < 20) {
  const delay = msUntilNextOtp + 1000; // đợi sang chu kỳ kế tiếp
  let seconds = Math.ceil(delay / 1000);

  messageRenderer.render('COUNTDOWN_WAITING', { seconds });
  clearInterval(otpCountdown);
  otpCountdown = setInterval(() => {
    seconds--;
    messageRenderer.updateCountdown(seconds);
    if (seconds <= 0) {
      clearInterval(otpCountdown);
      fetchFinalOtp(email, software, otpSource);
    }
  }, 1000);
} else{
  fetchFinalOtp(email, software, otpSource);
}
});

async function fetchFinalOtp(email, software, otpSource) {
  const { BACKEND_URL } = getConstants();
  const output = document.getElementById("otpResult");
  const btn = document.getElementById("btnGetOtp");

  let result;
  try {
    const otpStrategy = SmartRetryStrategies.createOtpStrategy(messageRenderer);
    
    result = await retryManager.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Tăng timeout lên 60s

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getOtpFinal",
          email,
          software,
          otpSource
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`Server overload: ${response.status}`);
        }
        if (response.status === 429) {
          throw new Error(`Quota exceeded: ${response.status}`);
        }
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    }, {
      ...otpStrategy,
      errorAnalyzer: NetworkDiagnostics.analyzeNetworkError
    });
    
  } catch (retryError) {
    console.error("Lỗi lấy OTP Final sau khi retry:", retryError);
    
    const errorCode = retryError.errorCode || NetworkDiagnostics.analyzeNetworkError(retryError.originalError);
    globalRetryStats.recordFailure(errorCode);
    
    // Hiển thị lỗi chi tiết
    switch (errorCode) {
      case 'TIMEOUT_ERROR':
        messageRenderer.render('TIMEOUT_ERROR');
        break;
      case 'NETWORK_ERROR':
      case 'NETWORK_OFFLINE':
        messageRenderer.render('NETWORK_ERROR');
        break;
      case 'SERVER_OVERLOAD':
        messageRenderer.render('SERVER_OVERLOAD');
        break;
      case 'QUOTA_EXCEEDED':
        messageRenderer.render('QUOTA_EXCEEDED');
        break;
      default:
        messageRenderer.render('SYSTEM_ERROR', {
          error: `Lỗi sau ${retryError.attempts} lần thử: ${retryError.originalError?.message || 'Unknown error'}`
        });
    }
    
    resetButton();
    return;
  }

  if (result.status === "success") {
    const otpData = {
      otp: result.otp,
      deviceInfo: result.data ? `Đã sử dụng ${result.data.currentDevices}/${result.data.maxDevices} thiết bị` : null
    };
    messageRenderer.renderOTPSuccess(otpData);
  } else {
    messageRenderer.render(result.code || 'SYSTEM_ERROR', result.data);
  }
  resetButton();
}

// 🔍 Network Diagnostic Function
async function runNetworkDiagnostic() {
  if (isProcessing) {
    console.log('🚫 Cannot run diagnostic while processing OTP request');
    return;
  }

  console.log('🔍 Starting network diagnostic...');
  
  try {
    // Disable button during diagnostic
    const btn = document.getElementById("btnGetOtp");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔍 Chẩn đoán...";
    }

    // Run full diagnostic
    const results = await networkDiagnostics.runFullDiagnostic(messageRenderer);
    
    // Generate and show report
    const report = networkDiagnostics.generateUserReport();
    const analysis = networkDiagnostics.analyzeResults();
    
    // Show results in a more user-friendly way
    const statusMessages = {
      good: 'Kết nối tốt, không có vấn đề phát hiện',
      fair: 'Kết nối ổn định nhưng có vài vấn đề nhỏ',
      poor: 'Phát hiện nhiều vấn đề với kết nối',
      critical: 'Không có kết nối internet',
      unknown: 'Không thể xác định tình trạng'
    };

    messageRenderer.render('SYSTEM_ERROR', {
      error: `Chẩn đoán hoàn tất: ${statusMessages[analysis.overallHealth] || analysis.overallHealth}`
    });

    // Log detailed results for debugging
    console.log('📊 Network Diagnostic Report:');
    console.log(report);
    console.log('📁 Raw Results:', results);
    console.log('🎯 Analysis:', analysis);
    
    // Show popup with detailed info (optional)
    if (analysis.overallHealth !== 'good') {
      setTimeout(() => {
        if (confirm('Muốn xem báo cáo chi tiết về tình trạng mạng?')) {
          alert(report);
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('❗ Error running network diagnostic:', error);
    messageRenderer.render('SYSTEM_ERROR', {
      error: `Lỗi chẩn đoán: ${error.message}`
    });
  } finally {
    // Re-enable button
    const btn = document.getElementById("btnGetOtp");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Lấy OTP";
    }
  }
}