// React Core Rebuild - useState Hook 테스트
import { createElement } from "./jsx/createElement";
import { render } from "./ReactDOM";
import { useState } from "./fiber/hooks/useState";

// JSX 타입 선언 (createElement 함수 사용을 위해)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      h2: any;
      p: any;
      button: any;
      span: any;
    }
  }
}

// React 전역 설정 (JSX 변환을 위해)
(globalThis as any).React = { createElement };

/**
 * Counter 컴포넌트 - useState Hook 테스트
 *
 * 테스트 시나리오:
 * 1. 초기값 0으로 시작
 * 2. +1, -1, +5, -5 버튼으로 상태 변경
 * 3. Reset 버튼으로 0으로 초기화
 * 4. 각 클릭마다 리렌더링 발생 여부 확인
 */
function Counter() {
  console.log("🔄 Counter 컴포넌트 렌더링 중...");

  const [count, setCount] = useState(0);

  console.log(`📊 현재 count 상태: ${count}`);

  return createElement(
    "div",
    { className: "counter" },
    createElement("h2", {}, "🧮 useState Hook 카운터"),

    createElement("div", { className: "count-display" }, count.toString()),

    createElement(
      "p",
      {},
      "버튼을 클릭해서 useState가 정상 동작하는지 확인하세요!"
    ),

    // 증가/감소 버튼들
    createElement(
      "div",
      {},
      createElement(
        "button",
        {
          onclick: () => {
            console.log("➕ +1 버튼 클릭");
            setCount(count + 1);
          },
        },
        "+1"
      ),

      createElement(
        "button",
        {
          onclick: () => {
            console.log("➖ -1 버튼 클릭");
            setCount(count - 1);
          },
        },
        "-1"
      ),

      createElement(
        "button",
        {
          onclick: () => {
            console.log("⬆️ +5 버튼 클릭");
            setCount(count + 5);
          },
        },
        "+5"
      ),

      createElement(
        "button",
        {
          onclick: () => {
            console.log("⬇️ -5 버튼 클릭");
            setCount(count - 5);
          },
        },
        "-5"
      )
    ),

    // 리셋 버튼
    createElement(
      "div",
      {},
      createElement(
        "button",
        {
          className: "reset-btn",
          onclick: () => {
            console.log("🔄 Reset 버튼 클릭");
            setCount(0);
          },
        },
        "Reset"
      )
    ),

    // 함수형 업데이트 테스트
    createElement(
      "div",
      { style: "margin-top: 1rem;" },
      createElement("p", {}, "함수형 업데이트 테스트:"),
      createElement(
        "button",
        {
          onclick: () => {
            console.log("🔢 함수형 업데이트: count => count * 2");
            setCount((prevCount: number) => prevCount * 2);
          },
        },
        "Double (×2)"
      ),

      createElement(
        "button",
        {
          onclick: () => {
            console.log("🔢 함수형 업데이트: count => Math.max(0, count)");
            setCount((prevCount: number) => Math.max(0, prevCount));
          },
        },
        "Max(0, count)"
      )
    )
  );
}

/**
 * 앱 컴포넌트 - 전체 테스트 래퍼
 */
function App() {
  console.log("🚀 App 컴포넌트 렌더링 중...");

  return createElement(
    "div",
    {},
    createElement(
      "div",
      { style: "text-align: center; margin-bottom: 1rem;" },
      createElement(
        "span",
        { style: "font-size: 0.9rem; color: #6b7280;" },
        "개발자 도구 Console을 열어서 렌더링 로그를 확인하세요 📊"
      )
    ),

    createElement(Counter, {})
  );
}

// 렌더링 시작
console.log("🎬 React Core Rebuild 테스트 시작!");
console.log("👀 useState Hook 동작을 확인합니다...");

const rootElement = document.getElementById("root");
if (rootElement) {
  render(createElement(App, {}), rootElement);
  console.log("✅ 초기 렌더링 완료! 이제 버튼을 클릭해보세요.");
} else {
  console.error("❌ root 엘리먼트를 찾을 수 없습니다!");
}
