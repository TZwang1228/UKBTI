// result.js - UKBTI测试结果页面逻辑
(function() {
  'use strict';
  
  let radarChart = null;
  
  // DOM元素
  const elements = {
    retakeBtn: null,
    copyTextBtn: null,
    copyLinkBtn: null,
    typeCode: null,
    typeName: null,
    typeQuote: null,
    characterImage: null,
    easterEggContainer: null,
    descContent: null,
    radarChart: null
  };
  
  // 分享链接
  const SHARE_LINK = 'https://ukbti.vercel.app/';
  
  // 初始化元素
  function initElements() {
    elements.retakeBtn = document.getElementById('retake-btn');
    elements.copyTextBtn = document.getElementById('copy-text-btn');
    elements.copyLinkBtn = document.getElementById('copy-link-btn');
    elements.typeCode = document.getElementById('type-code');
    elements.typeName = document.getElementById('type-name');
    elements.typeQuote = document.getElementById('type-quote');
    elements.characterImage = document.getElementById('character-image');
    elements.easterEggContainer = document.getElementById('easter-egg-container');
    elements.descContent = document.getElementById('desc-content');
    elements.radarChart = document.getElementById('radar-chart');
  }
  
  // 初始化页面
  function initPage() {
    initElements();
    
    // 从localStorage获取测试结果
    const result = window.loadTestResult();
    
    if (!result) {
      // 如果没有测试结果，跳转到首页
      window.location.href = 'index.html';
      return;
    }
    
    // 渲染结果
    renderResult(result);
    
    // 绑定事件
    bindEvents();
  }
  
  // 渲染结果
  function renderResult(result) {
    const { scores, personalityType, personality, isEasterEgg, percentScores } = result;
    const data = window.UKBTI_DATA;
    
    // 1. 渲染人格类型信息（不显示字母代码）
    elements.typeCode.textContent = '';
    elements.typeName.textContent = personality.name;
    elements.typeQuote.textContent = `"${personality.quote}"`;
    
    // 2. 渲染人格图片
    const imagePath = window.getCharacterImage(personalityType);
    elements.characterImage.src = imagePath;
    elements.characterImage.alt = personality.name;
    
    // 3. 渲染彩蛋信息
    renderEasterEgg(isEasterEgg, personalityType, personality, data);
    
    // 4. 渲染详细描述
    renderDescription(personality);
    
    // 5. 渲染雷达图（使用百分比分数）
    setTimeout(() => {
      initRadarChart(percentScores);
    }, 100);
  }
  
  // 渲染彩蛋
  function renderEasterEgg(isEasterEgg, personalityType, personality, data) {
    if (!isEasterEgg) {
      elements.easterEggContainer.innerHTML = '';
      return;
    }
    
    // 直接使用isEasterEgg（完整彩蛋类型如BALANCED/EXTREME_D）从data.js获取信息
    const easterEggInfo = data.easterEggs?.[isEasterEgg];
    
    if (!easterEggInfo) {
      elements.easterEggContainer.innerHTML = '';
      return;
    }
    
    elements.easterEggContainer.innerHTML = `
      <div class="easter-egg animate-fadeIn">
        <div class="easter-egg-title">${easterEggInfo.title || '彩蛋发现'}</div>
        <div class="easter-egg-desc">${easterEggInfo.desc}</div>
        ${easterEggInfo.badge ? `<div style="margin-top: 12px;"><span style="background: #c8102e; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${easterEggInfo.badge}</span></div>` : ''}
      </div>
    `;
  }
  
  // 渲染详细描述
  function renderDescription(personality) {
    elements.descContent.innerHTML = `
      <div class="desc-item animate-fadeIn" style="animation-delay: 0.1s;">
        <div class="desc-label">人格画像</div>
        <div class="desc-text">${personality.desc}</div>
      </div>
      <div class="desc-item animate-fadeIn" style="animation-delay: 0.2s;">
        <div class="desc-label">你的优势</div>
        <div class="desc-text">${personality.advantage}</div>
      </div>
      <div class="desc-item animate-fadeIn" style="animation-delay: 0.3s;">
        <div class="desc-label">潜在挑战</div>
        <div class="desc-text">${personality.minefield}</div>
      </div>
      <div class="desc-item animate-fadeIn" style="animation-delay: 0.4s;">
        <div class="desc-label">发展建议</div>
        <div class="desc-text">${personality.suggest}</div>
      </div>
      <div class="desc-item animate-fadeIn" style="animation-delay: 0.5s;">
        <div class="desc-label">推荐城市</div>
        <div class="desc-text">${personality.city}</div>
      </div>
    `;
  }
  
  // 初始化雷达图 - 使用百分比分数
  function initRadarChart(percentScores) {
    const ctx = elements.radarChart.getContext('2d');
    
    // 销毁已有图表
    if (radarChart) {
      radarChart.destroy();
    }
    
    // 获取维度信息
    const data = window.UKBTI_DATA;
    const dimensions = data.dimensions;
    
    // 解析百分比字符串
    const percentages = {
      D: Math.round(parseFloat(percentScores.D)),
      I: Math.round(parseFloat(percentScores.I)),
      S: Math.round(parseFloat(percentScores.S)),
      C: Math.round(parseFloat(percentScores.C))
    };
    
    // 渐变色配置
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(26, 54, 93, 0.4)');
    gradient.addColorStop(1, 'rgba(26, 54, 93, 0.1)');
    
    // 创建雷达图 - 大厂UI风格
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          dimensions.D.name,
          dimensions.I.name,
          dimensions.S.name,
          dimensions.C.name
        ],
        datasets: [{
          data: [percentages.D, percentages.I, percentages.S, percentages.C],
          backgroundColor: gradient,
          borderColor: '#1a365d',
          borderWidth: 2.5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#1a365d',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#1a365d',
          pointHoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: 0,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 54, 93, 0.95)',
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Helvetica Neue', Arial, sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Helvetica Neue', Arial, sans-serif"
            },
            padding: 14,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              title: function(context) {
                const labels = [dimensions.D.name, dimensions.I.name, dimensions.S.name, dimensions.C.name];
                return labels[context[0].dataIndex];
              },
              label: function(context) {
                return `${context.raw}%`;
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            min: 0,
            ticks: {
              display: false,
              stepSize: 25
            },
            grid: {
              color: 'rgba(26, 54, 93, 0.08)',
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(26, 54, 93, 0.08)',
              lineWidth: 1
            },
            pointLabels: {
              font: {
                size: 13,
                weight: '600',
                family: "'Helvetica Neue', Arial, sans-serif"
              },
              color: '#1a365d',
              padding: 15
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
    
    // 添加维度说明
    renderDimensionLegend(percentScores);
  }
  
  // 渲染维度说明
  function renderDimensionLegend(percentScores) {
    const container = document.getElementById('dimension-legend');
    if (!container) return;
    
    const data = window.UKBTI_DATA;
    const dimensions = data.dimensions;
    
    const legends = [
      { key: 'D', ...dimensions.D },
      { key: 'I', ...dimensions.I },
      { key: 'S', ...dimensions.S },
      { key: 'C', ...dimensions.C }
    ];
    
    container.innerHTML = legends.map((dim, index) => {
      const percentage = percentScores[dim.key];
      return `
        <div class="dimension-item" style="animation-delay: ${index * 0.1}s;">
          <div class="dimension-badge" style="background: ${dim.color};">
            ${dim.shortName}
          </div>
          <div class="dimension-info">
            <div class="dimension-name">${dim.name}</div>
            <div class="dimension-desc">${dim.desc}</div>
          </div>
          <div class="dimension-percentage">${percentage}%</div>
        </div>
      `;
    }).join('');
  }
  
  // 绑定事件
  function bindEvents() {
    // 重新测试按钮
    elements.retakeBtn.addEventListener('click', function() {
      window.clearTestResult();
      window.location.href = 'test.html';
    });
    
    // 复制链接按钮
    elements.copyLinkBtn.addEventListener('click', async function() {
      const result = window.loadTestResult();
      if (!result) return;
      
      // 构建带人格类型的分享链接
      const shareUrl = `${SHARE_LINK}?type=${result.personalityType}`;
      const success = await window.copyToClipboard(shareUrl);
      
      if (success) {
        window.showToast('链接已复制到剪贴板！');
      } else {
        window.showToast('复制失败，请手动复制');
      }
    });
    
    // 复制文案按钮
    elements.copyTextBtn.addEventListener('click', async function() {
      const result = window.loadTestResult();
      if (!result) return;
      
      const shareText = window.generateShareText(result);
      const success = await window.copyToClipboard(shareText);
      
      if (success) {
        window.showToast('分享文案已复制到剪贴板！');
      } else {
        window.showToast('复制失败，请手动复制');
      }
    });
  }
  
  // DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', initPage);
})();
