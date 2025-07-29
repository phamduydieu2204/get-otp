// 🔍 NETWORK DIAGNOSTICS - Công cụ chẩn đoán mạng chi tiết
// Giúp phân tích và hiển thị thông tin chi tiết về tình trạng kết nối

export class NetworkDiagnostics {
  constructor() {
    this.diagnosticResults = {};
    this.isRunning = false;
  }

  // Chạy full diagnostic suite
  async runFullDiagnostic(messageRenderer) {
    if (this.isRunning) {
      console.log('🔍 Diagnostic đang chạy, bỏ qua yêu cầu mới');
      return this.diagnosticResults;
    }

    this.isRunning = true;
    this.diagnosticResults = {};

    try {
      messageRenderer?.render('WAITING_FOR_OTP', {
        message: 'Đang chẩn đoán kết nối mạng...'
      });

      // Test 1: Kiểm tra trạng thái online cơ bản
      this.diagnosticResults.onlineStatus = this.checkOnlineStatus();

      // Test 2: Ping test đến các server khác nhau
      this.diagnosticResults.pingTests = await this.runPingTests();

      // Test 3: DNS resolution test
      this.diagnosticResults.dnsTest = await this.testDNSResolution();

      // Test 4: Kiểm tra CORS và preflight
      this.diagnosticResults.corsTest = await this.testCORS();

      // Test 5: Bandwidth test đơn giản
      this.diagnosticResults.bandwidthTest = await this.testBandwidth();

      // Test 6: Kiểm tra proxy server health
      this.diagnosticResults.proxyHealth = await this.testProxyHealth();

      console.log('🔍 Network Diagnostic Results:', this.diagnosticResults);
      
      return this.diagnosticResults;

    } catch (error) {
      console.error('❌ Error running diagnostic:', error);
      this.diagnosticResults.error = error.message;
      return this.diagnosticResults;
    } finally {
      this.isRunning = false;
    }
  }

  // Test 1: Trạng thái online
  checkOnlineStatus() {
    const result = {
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: null
    };

    // Thông tin kết nối nếu có
    if ('connection' in navigator) {
      const conn = navigator.connection;
      result.connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }

    return result;
  }

  // Test 2: Ping tests đến nhiều server
  async runPingTests() {
    const testUrls = [
      { name: 'Google', url: 'https://www.google.com/favicon.ico' },
      { name: 'Cloudflare', url: 'https://1.1.1.1/' },
      { name: 'GitHub', url: 'https://github.com/favicon.ico' },
      { name: 'Our Proxy', url: 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/health' }
    ];\n\n    const results = {};\n\n    for (const test of testUrls) {\n      try {\n        const start = Date.now();\n        const response = await fetch(test.url, {\n          method: 'HEAD',\n          cache: 'no-cache',\n          mode: 'no-cors',\n          signal: AbortSignal.timeout(5000)\n        });\n        const latency = Date.now() - start;\n\n        results[test.name] = {\n          success: true,\n          latency,\n          status: response.status || 'no-cors'\n        };\n      } catch (error) {\n        results[test.name] = {\n          success: false,\n          error: error.message,\n          timeout: error.name === 'AbortError'\n        };\n      }\n    }\n\n    return results;\n  }\n\n  // Test 3: DNS Resolution\n  async testDNSResolution() {\n    const domains = [\n      'google.com',\n      'github.com', \n      'sleepy-bastion-81523-f30e287dba50.herokuapp.com'\n    ];\n\n    const results = {};\n\n    for (const domain of domains) {\n      try {\n        const start = Date.now();\n        // Sử dụng fetch để test DNS resolution\n        await fetch(`https://${domain}/favicon.ico`, {\n          method: 'HEAD',\n          cache: 'no-cache',\n          mode: 'no-cors',\n          signal: AbortSignal.timeout(3000)\n        });\n        const dnsTime = Date.now() - start;\n\n        results[domain] = {\n          success: true,\n          dnsTime\n        };\n      } catch (error) {\n        results[domain] = {\n          success: false,\n          error: error.message\n        };\n      }\n    }\n\n    return results;\n  }\n\n  // Test 4: CORS và Preflight\n  async testCORS() {\n    const proxyUrl = 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy';\n    \n    try {\n      // Test OPTIONS request (preflight)\n      const optionsStart = Date.now();\n      const optionsResponse = await fetch(proxyUrl, {\n        method: 'OPTIONS',\n        signal: AbortSignal.timeout(5000)\n      });\n      const optionsTime = Date.now() - optionsStart;\n\n      return {\n        preflight: {\n          success: true,\n          status: optionsResponse.status,\n          time: optionsTime,\n          corsHeaders: {\n            'access-control-allow-origin': optionsResponse.headers.get('access-control-allow-origin'),\n            'access-control-allow-methods': optionsResponse.headers.get('access-control-allow-methods'),\n            'access-control-allow-headers': optionsResponse.headers.get('access-control-allow-headers')\n          }\n        }\n      };\n    } catch (error) {\n      return {\n        preflight: {\n          success: false,\n          error: error.message\n        }\n      };\n    }\n  }\n\n  // Test 5: Bandwidth test đơn giản\n  async testBandwidth() {\n    try {\n      const testUrl = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';\n      const start = Date.now();\n      \n      const response = await fetch(testUrl, {\n        cache: 'no-cache',\n        signal: AbortSignal.timeout(10000)\n      });\n      \n      const data = await response.arrayBuffer();\n      const duration = Date.now() - start;\n      const sizeKB = data.byteLength / 1024;\n      const speedKBps = sizeKB / (duration / 1000);\n\n      return {\n        success: true,\n        sizeKB: Math.round(sizeKB),\n        durationMs: duration,\n        speedKBps: Math.round(speedKBps),\n        speedMbps: Math.round(speedKBps * 8 / 1024 * 100) / 100\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error.message\n      };\n    }\n  }\n\n  // Test 6: Proxy server health\n  async testProxyHealth() {\n    const proxyUrl = 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy';\n    \n    try {\n      const start = Date.now();\n      const response = await fetch(proxyUrl, {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({\n          action: 'healthCheck',\n          timestamp: Date.now()\n        }),\n        signal: AbortSignal.timeout(15000)\n      });\n      \n      const responseTime = Date.now() - start;\n      const responseText = await response.text();\n\n      return {\n        success: response.ok,\n        status: response.status,\n        responseTime,\n        bodySize: responseText.length,\n        headers: Object.fromEntries(response.headers.entries())\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error.message,\n        timeout: error.name === 'AbortError'\n      };\n    }\n  }\n\n  // Phân tích kết quả và đưa ra khuyến nghị\n  analyzeResults() {\n    const analysis = {\n      overallHealth: 'unknown',\n      issues: [],\n      recommendations: [],\n      networkType: 'unknown'\n    };\n\n    // Phân tích online status\n    if (!this.diagnosticResults.onlineStatus?.isOnline) {\n      analysis.issues.push('Không có kết nối internet');\n      analysis.recommendations.push('Kiểm tra kết nối WiFi/4G/5G');\n      analysis.overallHealth = 'critical';\n      return analysis;\n    }\n\n    // Phân tích ping tests\n    const pingResults = this.diagnosticResults.pingTests;\n    if (pingResults) {\n      const failedPings = Object.entries(pingResults)\n        .filter(([_, result]) => !result.success).length;\n      \n      if (failedPings > 2) {\n        analysis.issues.push('Nhiều server không thể kết nối');\n        analysis.recommendations.push('Kiểm tra firewall/proxy công ty');\n      }\n\n      const avgLatency = Object.entries(pingResults)\n        .filter(([_, result]) => result.success)\n        .reduce((sum, [_, result]) => sum + result.latency, 0) / \n        Object.keys(pingResults).length;\n\n      if (avgLatency > 3000) {\n        analysis.issues.push('Độ trễ mạng cao');\n        analysis.recommendations.push('Thử đổi mạng khác (WiFi/4G)');\n        analysis.networkType = 'slow';\n      } else if (avgLatency > 1000) {\n        analysis.networkType = 'medium';\n      } else {\n        analysis.networkType = 'fast';\n      }\n    }\n\n    // Phân tích CORS\n    if (this.diagnosticResults.corsTest?.preflight && \n        !this.diagnosticResults.corsTest.preflight.success) {\n      analysis.issues.push('Lỗi CORS với proxy server');\n      analysis.recommendations.push('Proxy server có thể đang gặp sự cố');\n    }\n\n    // Phân tích proxy health\n    if (this.diagnosticResults.proxyHealth && \n        !this.diagnosticResults.proxyHealth.success) {\n      analysis.issues.push('Proxy server không phản hồi');\n      analysis.recommendations.push('Server có thể đang bảo trì');\n    }\n\n    // Xác định overall health\n    if (analysis.issues.length === 0) {\n      analysis.overallHealth = 'good';\n    } else if (analysis.issues.length <= 2) {\n      analysis.overallHealth = 'fair';\n    } else {\n      analysis.overallHealth = 'poor';\n    }\n\n    return analysis;\n  }\n\n  // Tạo report người dùng có thể đọc được\n  generateUserReport() {\n    const analysis = this.analyzeResults();\n    \n    let report = `🔍 **Báo cáo chẩn đoán mạng**\\n\\n`;\n    \n    // Overall status\n    const statusIcons = {\n      good: '✅',\n      fair: '⚠️', \n      poor: '❌',\n      critical: '🚫',\n      unknown: '❓'\n    };\n    \n    report += `**Tình trạng tổng thể:** ${statusIcons[analysis.overallHealth]} ${analysis.overallHealth.toUpperCase()}\\n\\n`;\n    \n    // Network info\n    if (this.diagnosticResults.onlineStatus?.connection) {\n      const conn = this.diagnosticResults.onlineStatus.connection;\n      report += `**Thông tin mạng:**\\n`;\n      report += `- Loại: ${conn.effectiveType}\\n`;\n      report += `- Tốc độ ước tính: ${conn.downlink} Mbps\\n`;\n      report += `- Độ trễ: ${conn.rtt}ms\\n\\n`;\n    }\n    \n    // Issues\n    if (analysis.issues.length > 0) {\n      report += `**Vấn đề phát hiện:**\\n`;\n      analysis.issues.forEach(issue => {\n        report += `❌ ${issue}\\n`;\n      });\n      report += `\\n`;\n    }\n    \n    // Recommendations\n    if (analysis.recommendations.length > 0) {\n      report += `**Khuyến nghị:**\\n`;\n      analysis.recommendations.forEach(rec => {\n        report += `💡 ${rec}\\n`;\n      });\n    }\n    \n    return report;\n  }\n}\n\n// Singleton instance\nexport const networkDiagnostics = new NetworkDiagnostics();