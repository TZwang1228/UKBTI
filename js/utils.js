// utils.js - UKBTI工具函数
window.UKBTI_STORAGE_KEY = "ukbti_test_result";

// 保存测试结果
window.saveTestResult = function(result) {
  try {
    localStorage.setItem(window.UKBTI_STORAGE_KEY, JSON.stringify(result));
    return true;
  } catch (e) {
    console.error('保存结果失败:', e);
    return false;
  }
};

// 加载测试结果
window.loadTestResult = function() {
  try {
    const data = localStorage.getItem(window.UKBTI_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('加载结果失败:', e);
    return null;
  }
};

// 清空测试结果
window.clearTestResult = function() {
  try {
    localStorage.removeItem(window.UKBTI_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('清空结果失败:', e);
    return false;
  }
};

// 保存测试进度
window.saveProgress = function(data) {
  try {
    localStorage.setItem('ukbti_progress', JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
};

// 加载测试进度
window.loadProgress = function() {
  try {
    const data = localStorage.getItem('ukbti_progress');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

// 数组随机排序
window.shuffleArray = function(arr) {
  const newArray = [...arr];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 计算维度倾向
window.calculateDimensions = function(scores) {
  return {
    D: scores.D || 0,
    I: scores.I || 0,
    S: scores.S || 0,
    C: scores.C || 0
  };
};

// 获取维度百分比（用于雷达图）
window.getDimensionPercentages = function(scores) {
  const total = (scores.D + scores.I + scores.S + scores.C) || 1;
  return {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100)
  };
};

// 复制文案到剪贴板
window.copyToClipboard = function(text) {
  return navigator.clipboard.writeText(text).then(() => {
    return true;
  }).catch(() => {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  });
};

// 生成分享文案
window.generateShareText = function(result) {
  const { personalityType, personality, isEasterEgg } = result;
  let shareText = `🎯 我的UKBTI人格类型是：${personalityType} - ${personality.name}\n\n`;
  shareText += `💬 "${personality.quote}"\n\n`;
  shareText += `📊 四维分析：D-${result.scores.D} I-${result.scores.I} S-${result.scores.S} C-${result.scores.C}\n\n`;
  shareText += '✨ 测测你是哪种UKBTI人格？';
  return shareText;
};

// 生成雷达图数据
window.getRadarChartData = function(scores) {
  return {
    labels: ['支配型 (D)', '影响型 (I)', '稳健型 (S)', '谨慎型 (C)'],
    datasets: [{
      label: '你的四维分布',
      data: [scores.D, scores.I, scores.S, scores.C],
      backgroundColor: 'rgba(26, 54, 93, 0.2)',
      borderColor: '#1a365d',
      borderWidth: 2,
      pointBackgroundColor: '#c8102e',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#c8102e',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };
};

// 获取人格图片路径
window.getCharacterImage = function(type) {
  const data = window.UKBTI_DATA;
  if (data && data.characterImages && data.characterImages[type]) {
    return data.characterImages[type];
  }
  return data.characterImages.BALANCED;
};

// 检测彩蛋 - 返回完整彩蛋类型
window.checkEasterEgg = function(scores) {
  const { D, I, S, C } = scores;
  
  // 彩蛋1：完美平衡者
  if (D === I && I === S && S === C && D > 0) {
    return 'BALANCED';
  }
  
  // 彩蛋2：极端专注者 - 判断是哪个维度极端
  const maxScore = Math.max(D, I, S, C);
  const minScore = Math.min(D, I, S, C);
  if (maxScore >= 6 && (maxScore - minScore) >= 3) {
    // 判断哪个维度最高
    if (D === maxScore) return 'EXTREME_D';
    if (I === maxScore) return 'EXTREME_I';
    if (S === maxScore) return 'EXTREME_S';
    if (C === maxScore) return 'EXTREME_C';
  }
  
  return null;
};

// 显示提示消息
window.showToast = function(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a365d;
    color: white;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};

// 添加fadeOut动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(-50%); }
    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);
