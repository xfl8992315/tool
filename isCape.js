(function () {
    const CLOAK_PAGE_URL = CLOAK_PAGE_URL||'/pages/home2?isPreview=1';  // 斗篷页地址，请替换
    const SIG_SESSION_KEY = '__cloak_sig__';
    const BEHAVIOR_RESULT_KEY = '__behavior_judge_result__';
    const WAIT_BEHAVIOR_TIMEOUT = 3000;
  
    // 存入 sig
    const urlParams = new URLSearchParams(window.location.search);
    const sig = urlParams.get('sig');
    if (sig) sessionStorage.setItem(SIG_SESSION_KEY, sig);
    const sessionSig = sessionStorage.getItem(SIG_SESSION_KEY);
  
    // UA 判定
    function isBotUA(ua) {
      return /bot|spider|crawler|adsbot|google|bing|facebook|twitterbot|slurp|headlesschrome/.test(ua);
    }
  
    function baseIsHuman() {
      const ua = navigator.userAgent.toLowerCase();
      return !isBotUA(ua)
        && !navigator.webdriver
        && navigator.languages.length > 0
        && window.top === window.self;
    }
  
    // 如果 UA 不正常，直接跳斗篷
    if (!baseIsHuman()) {
      location.replace(CLOAK_PAGE_URL);
      return;
    }
  
    // 如果之前行为模块已经判断过，直接用缓存结果
    const cachedResult = sessionStorage.getItem(BEHAVIOR_RESULT_KEY);
    if (cachedResult === 'false') {
      location.replace(CLOAK_PAGE_URL);
      return;
    } else if (cachedResult === 'true') {
      return; // 行为已判断为正常，放行
    }
  
    // 等待行为模块挂载并判断
    function waitForBehaviorAndDecide() {
      let elapsed = 0;
      const interval = 50;
  
      const timer = setInterval(() => {
        elapsed += interval;
  
        if (window.behaviorJudge && typeof window.behaviorJudge.isHuman === 'function') {
          clearInterval(timer);
  
          const result = window.behaviorJudge.isHuman();
          sessionStorage.setItem(BEHAVIOR_RESULT_KEY, result ? 'true' : 'false');
  
          if (!result) {
            location.replace(CLOAK_PAGE_URL);
          }
  
          return;
        }
  
        if (elapsed >= WAIT_BEHAVIOR_TIMEOUT) {
          clearInterval(timer);
          // 行为模块加载失败，默认视为不正常
          sessionStorage.setItem(BEHAVIOR_RESULT_KEY, 'false');
          location.replace(CLOAK_PAGE_URL);
        }
      }, interval);
    }
  
    // UA 正常、sig 有无都统一走行为判断
    waitForBehaviorAndDecide();
  })();
