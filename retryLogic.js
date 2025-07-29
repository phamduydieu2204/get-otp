// 🔄 RETRY LOGIC WITH EXPONENTIAL BACKOFF
// Triển khai logic retry thông minh cho các yêu cầu network

export class RetryManager {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 giây
    this.maxDelay = 30000; // 30 giây
    this.retryableErrors = [
      'NETWORK_ERROR', 
      'TIMEOUT_ERROR', 
      'SERVER_OVERLOAD',
      'AbortError',
      'NetworkError'
    ];
  }

  // Kiểm tra xem lỗi có thể retry không
  isRetryableError(error, errorCode) {
    // Kiểm tra error code trước
    if (errorCode && this.retryableErrors.includes(errorCode)) {
      return true;
    }
    
    // Kiểm tra error object
    if (error) {
      if (this.retryableErrors.includes(error.name)) {
        return true;
      }
      
      if (error.message && 
          (error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError') ||
           error.message.includes('timeout'))) {
        return true;
      }
    }
    
    return false;
  }

  // Tính delay cho lần retry tiếp theo (exponential backoff)
  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(2, attempt - 1);
    // Thêm jitter để tránh thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.min(delay + jitter, this.maxDelay);
  }

  // Thực hiện retry với exponential backoff
  async executeWithRetry(asyncFunction, context = {}) {
    let lastError = null;
    let lastErrorCode = null;
    
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        // Ghi log attempt (nếu không phải lần đầu)
        if (attempt > 1) {
          console.log(`🔄 Retry attempt ${attempt - 1}/${this.maxRetries}`, context);
        }
        
        // Thực hiện function
        const result = await asyncFunction();
        
        // Nếu thành công, ghi log và trả về kết quả
        if (attempt > 1) {
          console.log(`✅ Retry successful after ${attempt - 1} attempts`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        lastErrorCode = context.errorAnalyzer ? context.errorAnalyzer(error) : null;
        
        console.log(`❌ Attempt ${attempt} failed:`, error.message, 'Code:', lastErrorCode);
        
        // Nếu là lần cuối hoặc lỗi không thể retry
        if (attempt > this.maxRetries || !this.isRetryableError(error, lastErrorCode)) {
          break;
        }
        
        // Tính delay và đợi
        const delay = this.calculateDelay(attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        
        // Hiển thị countdown cho user (nếu có callback)
        if (context.onRetryWait) {
          await this.waitWithCountdown(delay, context.onRetryWait);
        } else {
          await this.sleep(delay);
        }
      }
    }
    
    // Nếu đã hết retry, throw lỗi cuối cùng
    console.log(`🚫 All ${this.maxRetries} retries failed`);
    throw { 
      originalError: lastError, 
      errorCode: lastErrorCode,
      attempts: this.maxRetries + 1
    };
  }

  // Sleep helper
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Đợi với countdown hiển thị cho user
  async waitWithCountdown(totalMs, onUpdate) {
    const intervalMs = 100; // Update mỗi 100ms
    let remaining = totalMs;
    
    while (remaining > 0) {
      const secondsLeft = Math.ceil(remaining / 1000);
      onUpdate(secondsLeft);
      
      await this.sleep(Math.min(intervalMs, remaining));
      remaining -= intervalMs;
    }
    
    onUpdate(0);
  }
}

// 🎯 SMART RETRY STRATEGIES
export class SmartRetryStrategies {
  
  // Strategy cho kiểm tra OTP availability
  static createCheckStrategy(messageRenderer) {
    return {
      maxRetries: 2, // Ít retry hơn vì check nhanh
      baseDelay: 2000, // 2 giây
      
      errorAnalyzer: (error) => {
        if (!navigator.onLine) return 'NETWORK_OFFLINE';
        if (error.name === 'AbortError') return 'TIMEOUT_ERROR';
        if (error.message?.includes('Failed to fetch')) return 'NETWORK_ERROR';
        return 'SYSTEM_ERROR';
      },
      
      onRetryWait: (secondsLeft) => {
        if (secondsLeft > 0) {
          messageRenderer.render('WAITING_FOR_OTP', {
            message: `Đang thử lại... ${secondsLeft}s`
          });
        }
      }
    };
  }

  // Strategy cho lấy OTP từ server
  static createOtpStrategy(messageRenderer) {
    return {
      maxRetries: 3, // Nhiều retry hơn vì OTP quan trọng
      baseDelay: 3000, // 3 giây
      
      errorAnalyzer: (error) => {
        if (!navigator.onLine) return 'NETWORK_OFFLINE';
        if (error.name === 'AbortError') return 'TIMEOUT_ERROR';
        if (error.message?.includes('Failed to fetch')) return 'NETWORK_ERROR';
        if (error.message?.includes('quota')) return 'QUOTA_EXCEEDED';
        if (error.message?.includes('overload')) return 'SERVER_OVERLOAD';
        return 'SYSTEM_ERROR';
      },
      
      onRetryWait: (secondsLeft) => {
        if (secondsLeft > 0) {
          messageRenderer.render('WAITING_FOR_OTP', {
            message: `Đang thử lại lấy OTP... ${secondsLeft}s`
          });
        }
      }
    };
  }
}

// 📊 RETRY STATISTICS
export class RetryStats {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      totalRetries: 0,
      errorTypes: {}
    };
  }

  recordRequest() {
    this.stats.totalRequests++;
  }

  recordSuccess(retriedCount = 0) {
    this.stats.successfulRequests++;
    if (retriedCount > 0) {
      this.stats.retriedRequests++;
      this.stats.totalRetries += retriedCount;
    }
  }

  recordFailure(errorCode) {
    this.stats.failedRequests++;
    if (errorCode) {
      this.stats.errorTypes[errorCode] = (this.stats.errorTypes[errorCode] || 0) + 1;
    }
  }

  getSuccessRate() {
    if (this.stats.totalRequests === 0) return 0;
    return (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2);
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.getSuccessRate() + '%',
      averageRetriesPerRequest: this.stats.totalRequests > 0 
        ? (this.stats.totalRetries / this.stats.totalRequests).toFixed(2) 
        : 0
    };
  }

  // Log stats ra console để debug
  logStats() {
    console.table(this.getStats());
  }
}

// Global instance để track stats
export const globalRetryStats = new RetryStats();