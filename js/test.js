// test.js - UKBTI测试逻辑
(function() {
  'use strict';
  
  // 测试状态
  let currentQuestionIndex = 0;
  let answers = [];
  let shuffledQuestions = [];
  
  // DOM元素
  const elements = {
    questionNumber: null,
    questionText: null,
    optionsContainer: null,
    prevBtn: null,
    nextBtn: null,
    progressFill: null,
    currentQuestion: null,
    totalQuestions: null
  };
  
  // 获取DOM元素
  function initElements() {
    elements.questionNumber = document.getElementById('question-number');
    elements.questionText = document.getElementById('question-text');
    elements.optionsContainer = document.getElementById('options-container');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
    elements.progressFill = document.getElementById('progress-fill');
    elements.currentQuestion = document.getElementById('current-question');
    elements.totalQuestions = document.getElementById('total-questions');
  }
  
  // 初始化测试
  function initTest() {
    const data = window.UKBTI_DATA;
    
    if (!data || !data.questions || data.questions.length === 0) {
      showError('题目数据加载失败，请刷新页面重试。');
      return false;
    }
    
    // 设置总题目数
    const totalQuestions = data.questions.length;
    elements.totalQuestions.textContent = totalQuestions;
    
    // 打乱题目顺序
    shuffledQuestions = window.shuffleArray(data.questions);
    answers = new Array(totalQuestions).fill(null);
    
    // 渲染第一题
    renderQuestion();
    
    // 绑定按钮事件
    bindEvents();
    
    return true;
  }
  
  // 绑定事件
  function bindEvents() {
    elements.prevBtn.addEventListener('click', goToPrevQuestion);
    elements.nextBtn.addEventListener('click', goToNextQuestion);
  }
  
  // 渲染题目
  function renderQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    
    // 更新题目信息
    elements.questionNumber.textContent = `第 ${currentQuestionIndex + 1} 题`;
    elements.questionText.textContent = question.text;
    elements.currentQuestion.textContent = currentQuestionIndex + 1;
    
    // 更新进度条
    updateProgress();
    
    // 清空并渲染选项
    elements.optionsContainer.innerHTML = '';
    
    question.options.forEach((optionText, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option animate-slideIn';
      optionEl.style.animationDelay = `${index * 0.05}s`;
      
      if (answers[currentQuestionIndex] === index) {
        optionEl.classList.add('selected');
      }
      
      optionEl.innerHTML = `<span class="option-text">${optionText}</span>`;
      
      optionEl.addEventListener('click', () => selectOption(index));
      elements.optionsContainer.appendChild(optionEl);
    });
    
    // 更新按钮状态
    updateButtons();
  }
  
  // 选择选项
  function selectOption(optionIndex) {
    // 移除所有选项的选中状态
    document.querySelectorAll('.option').forEach(item => {
      item.classList.remove('selected');
    });
    
    // 设置当前选项为选中状态
    const selectedOption = document.querySelectorAll('.option')[optionIndex];
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
    
    // 保存答案
    answers[currentQuestionIndex] = optionIndex;
    
    // 更新按钮状态
    updateButtons();
    
    // 自动保存进度
    saveProgress();
  }
  
  // 更新进度条
  function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
  }
  
  // 更新按钮状态
  function updateButtons() {
    // 上一题按钮
    elements.prevBtn.disabled = currentQuestionIndex === 0;
    
    // 下一题/提交按钮
    const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
    const hasAnswer = answers[currentQuestionIndex] !== null;
    
    if (isLastQuestion) {
      elements.nextBtn.textContent = '提交测试';
      elements.nextBtn.className = 'nav-btn submit';
    } else {
      elements.nextBtn.textContent = '下一题';
      elements.nextBtn.className = 'nav-btn next';
    }
    
    elements.nextBtn.disabled = !hasAnswer;
  }
  
  // 前往上一题
  function goToPrevQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  }
  
  // 前往下一题
  function goToNextQuestion() {
    if (answers[currentQuestionIndex] === null) {
      window.showToast('请选择一个选项后再继续');
      return;
    }
    
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      submitTest();
    }
  }
  
  // 计算DISC得分
  function calculateScores() {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    const data = window.UKBTI_DATA;
    
    shuffledQuestions.forEach((question, index) => {
      const answerIndex = answers[index];
      if (answerIndex !== null && data.optionScores && data.optionScores[question.id]) {
        const scoreArray = data.optionScores[question.id][answerIndex];
        if (scoreArray && scoreArray.length === 4) {
          scores.D += scoreArray[0];
          scores.I += scoreArray[1];
          scores.S += scoreArray[2];
          scores.C += scoreArray[3];
        }
      }
    });
    
    return scores;
  }
  
  // 确定人格类型 - 基于DISC理论的自然分布判定
  function determinePersonality(scores) {
    const { D, I, S, C } = scores;
    const maxPerDimension = 84; // 28题 × 3分
    
    // 计算百分比
    const percentScores = {
      D: (D / maxPerDimension * 100).toFixed(2),
      I: (I / maxPerDimension * 100).toFixed(2),
      S: (S / maxPerDimension * 100).toFixed(2),
      C: (C / maxPerDimension * 100).toFixed(2)
    };
    
    const pD = parseFloat(percentScores.D);
    const pI = parseFloat(percentScores.I);
    const pS = parseFloat(percentScores.S);
    const pC = parseFloat(percentScores.C);
    
    // 排序
    const sorted = [
      { type: 'D', score: pD },
      { type: 'I', score: pI },
      { type: 'S', score: pS },
      { type: 'C', score: pC }
    ].sort((a, b) => b.score - a.score);
    
    const [first, second, third, fourth] = sorted;
    const data = window.UKBTI_DATA || window.UKMBTI_DATA;
    
    // 计算差距
    const gap12 = first.score - second.score;
    const gap23 = second.score - third.score;
    const gap34 = third.score - fourth.score;
    const gap13 = first.score - third.score;
    
    // 计算标准差
    const avg = (pD + pI + pS + pC) / 4;
    const variance = ((pD - avg) ** 2 + (pI - avg) ** 2 + 
                      (pS - avg) ** 2 + (pC - avg) ** 2) / 4;
    const stdDev = Math.sqrt(variance);
    
    console.log(`=== UKBTI 分数分析 ===`);
    console.log(`D:${pD.toFixed(0)}% I:${pI.toFixed(0)}% S:${pS.toFixed(0)}% C:${pC.toFixed(0)}%`);
    console.log(`排序: ${sorted.map(s => `${s.type}:${s.score.toFixed(0)}%`).join(' > ')}`);
    console.log(`差距: 1-2=${gap12.toFixed(0)}% 2-3=${gap23.toFixed(0)}% 3-4=${gap34.toFixed(0)}%`);
    console.log(`标准差: ${stdDev.toFixed(1)}`);
    
    // === 心理学判定：基于自然分布 ===
    
    // 判定逻辑说明：
    // - 随机答题时，gap12 分布约 0-35%
    // - 双重人格（gap12<22）约60-70%
    // - 单一主导（gap12>20 且标准差大）约5-10%
    // - 三重人格（gap13<28 且 gap34>16）约15-25%
    // - 四维均衡（标准差<6）约5-10%
    
    // 1. 三重人格
    // 前三接近，后一明显低
    if (gap13 < 28 && gap34 > 16) {
      const types = [first.type, second.type, third.type].sort();
      const typeKey = types.join('');
      console.log(`判定: ${typeKey}三重人格`);
      
      // 只使用data.js中预定义的人格
      const personality = data.personalities?.[typeKey];
      if (!personality) {
        console.error(`错误: 人格类型 ${typeKey} 未在data.js中定义`);
        return null;
      }
      
      return {
        type: typeKey,
        personality,
        isTriple: true,
        rawScores: { D, I, S, C },
        percentScores
      };
    }
    
    // 2. 双重人格
    // 前两接近
    if (gap12 < 22) {
      const types = [first.type, second.type].sort();
      const typeKey = types.join('');
      console.log(`判定: ${typeKey}双重人格`);
      
      // 只使用data.js中预定义的人格
      const personality = data.personalities?.[typeKey];
      if (!personality) {
        console.error(`错误: 人格类型 ${typeKey} 未在data.js中定义`);
        return null;
      }
      
      return {
        type: typeKey,
        personality,
        isDouble: true,
        rawScores: { D, I, S, C },
        percentScores
      };
    }
    
    // 3. 单一主导
    // 冠军领先较多
    if (gap12 > 20 && stdDev > 15) {
      const typeKey = first.type;
      console.log(`判定: ${typeKey}单一主导`);
      
      // 只使用data.js中预定义的人格
      const personality = data.personalities?.[typeKey];
      if (!personality) {
        console.error(`错误: 人格类型 ${typeKey} 未在data.js中定义`);
        return null;
      }
      
      return {
        type: typeKey,
        personality,
        isSingle: true,
        rawScores: { D, I, S, C },
        percentScores
      };
    }
    
    // 4. 四维均衡
    // 标准差非常小
    if (stdDev < 6) {
      console.log(`判定: DISC四维均衡`);
      
      // 只使用data.js中预定义的人格
      const personality = data.personalities?.DISC;
      if (!personality) {
        console.error(`错误: DISC人格类型未在data.js中定义`);
        return null;
      }
      
      return {
        type: 'DISC',
        personality,
        isQuad: true,
        rawScores: { D, I, S, C },
        percentScores
      };
    }
    
    // 无法判定：分数分布不在任何预定义规则内
    // 这应该是极小概率事件
    console.error(`无法判定人格类型: gap12=${gap12}, gap13=${gap13}, gap34=${gap34}, stdDev=${stdDev}`);
    return null;
  }
  
  // 提交测试
  function submitTest() {
    // 检查是否所有题目都已作答
    const unansweredIndex = answers.findIndex(answer => answer === null);
    if (unansweredIndex !== -1) {
      window.showToast(`第 ${unansweredIndex + 1} 题未作答，请完成所有题目`);
      return;
    }
    
    // 计算分数
    const scores = calculateScores();
    
    // 确定人格类型（包含percentScores）
    const result = determinePersonality(scores);
    
    // 检查人格类型是否有效
    if (!result) {
      window.showToast('判定出错，请重新测试');
      return;
    }
    
    const { type, personality, percentScores } = result;
    
    // 检测彩蛋
    const easterEgg = window.checkEasterEgg(scores);
    
    // 准备测试结果
    const testResult = {
      scores,
      personalityType: type,
      personality,
      isEasterEgg: easterEgg,
      percentScores,
      answers: answers.slice(),
      questionOrder: shuffledQuestions.map(q => q.id),
      testDate: new Date().toISOString()
    };
    
    // 保存结果到localStorage
    window.saveTestResult(testResult);
    
    // 清除进度
    localStorage.removeItem('ukbti_progress');
    
    // 跳转到结果页
    window.location.href = 'result.html';
  }
  
  // 保存进度
  function saveProgress() {
    window.saveProgress({
      currentQuestionIndex,
      answers: answers.slice()
    });
  }
  
  // 加载进度
  function loadProgress() {
    const progress = window.loadProgress();
    if (progress) {
      currentQuestionIndex = progress.currentQuestionIndex;
      answers = progress.answers;
      return true;
    }
    return false;
  }
  
  // 显示错误
  function showError(message) {
    if (elements.questionText) {
      elements.questionText.textContent = message;
      elements.questionText.style.color = '#dc2626';
    }
    console.error(message);
  }
  
  // DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    initElements();
    
    // 尝试加载进度
    if (!loadProgress()) {
      shuffledQuestions = [];
      answers = [];
      currentQuestionIndex = 0;
    }
    
    initTest();
  });
})();
