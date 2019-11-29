import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");
import loading from 'app-loading';
const { website, dev, theme } = __config__;

// 判读是否手机环境
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// 插入图片
export function insertImg(file) {
  return dev.publicPath + 'static/img/' + file;
}

// 委托点击事件
const eventMap = new Map;
document.body.addEventListener('click', e => {
  Array.from(eventMap.keys()).some(key => {
    if (e.target.classList.contains(key)) {
      eventMap.get(key)(e);
      return true;
    }
  });
});

export function click(selector, callback) {
  eventMap.set(selector, callback);
}

// 获取url参数
export function getURLParameters() {
  var url = window.location.href;
  return (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(function(a, v) {
    return (a[v.slice(0, v.indexOf("="))] = v.slice(v.indexOf("=") + 1)), a;
  }, {});
}

// 对象转url参数
export function queryStringify(query) {
  const queryString = Object.keys(query)
    .map(key => `${key}=${encodeURIComponent(query[key] || "")}`)
    .join("&");
  return queryString;
}

// 延迟执行
export function debounce(fn, delay) {
  let timer = null;
  return function() {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

// 无限加载
export function infiniteScroll(callback) {
  function getDocumentHeight() {
    const body = document.body;
    const html = document.documentElement;
    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }

  function getScrollTop() {
    return window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body)
          .scrollTop;
  }

  const debounceCallback = debounce(callback, 500);
  const scrollEvent = e => {
    if (getScrollTop() < getDocumentHeight() - window.innerHeight - 100) return;
    debounceCallback();
  };

  window.addEventListener("scroll", scrollEvent);
  return () => {
    window.removeEventListener("scroll", scrollEvent);
  };
}

// 设置标题
export function setTitle(subTitle) {
  window.document.title = `${subTitle} - ${website.seo.title}`;
}

// 滚动固定
export function scrollFixed(selector, distance = 0, cb) {
  const el = document.querySelector(selector);
  const elTop =
    el.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
  function callback() {
    if (document.documentElement.scrollTop > elTop - distance) {
      cb(true);
    } else {
      cb(false);
    }
  }
  callback();
  window.addEventListener("scroll", callback);
  return () => {
    window.removeEventListener("scroll", callback);
  };
}

// 主题路径
export function themePath(url) {
  url = url.charAt(0) === "/" ? url : "/" + url;
  return `src/theme/${theme}${url}`;
}

// 判断滚动方向
export function scrollDirection(callback) {
  const debounceCallback = debounce(callback, 50);
  let scrollPos = 0;
  window.addEventListener("scroll", function() {
    if (document.body.getBoundingClientRect().top > scrollPos) {
      debounceCallback("up");
    } else {
      debounceCallback("down");
    }
    scrollPos = document.body.getBoundingClientRect().top;
  });
}

// 相对时间
export function relative(time) {
  return dayjs(time).fromNow();
}

// 字符串溢出
export function truncateString(str, num) {
  return str.length > num ? str.slice(0, num > 3 ? num - 3 : num) + "..." : str;
}

// 滚动到元素
export function smoothScroll(element, distance = 0) {
  window.scroll({
    behavior: "smooth",
    left: 0,
    top: element.getBoundingClientRect().top + window.scrollY + distance
  });
}

// fetch请求
export function request(method, url, body, header) {
  loading.setColor(website.plugins.loading).start();
  method = method.toUpperCase();
  body = body && JSON.stringify(body);
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (header) {
    headers = Object.assign({}, headers, header);
  }

  return fetch(url, {
    method,
    headers,
    body
  }).then(res => {
    loading.stop();
    if (res.status === 404) {
      return Promise.reject("Unauthorized.");
    } else {
      return res.json();
    }
  });
}
