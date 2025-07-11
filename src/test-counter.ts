import { createElement } from "./jsx/createElement";
import { render } from "./ReactDOM";
import { useState } from "./fiber/hooks/useState";
import { useEffect, useLayoutEffect } from "./fiber/hooks/useEffect";

// 컴포넌트 생성 -> 훅 호출 + createElement로 생성한 ReactElement 반환
function ComplexCounter() {
  const [count, setCount] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // useEffect: count 변경 시 비동기적으로 DOM 업데이트 및 로깅
  useEffect(() => {
    console.log(`✨ useEffect 발동: count가 ${count}으로 변경됨`);
    const effectDisplay = document.getElementById("effect-display");
    if (effectDisplay) {
      effectDisplay.textContent = `Effect: Count is now ${count}`;
    }
    // 클린업 함수
    return () => {
      console.log(`🧹 useEffect 클린업: count ${count}에 대한 효과 정리`);
    };
  }, [count]);

  // useLayoutEffect: textInput 길이 변경 시 동기적으로 DOM 스타일 변경
  useLayoutEffect(() => {
    console.log(`🎨 useLayoutEffect 발동: textInput이 ${textInput}으로 변경됨`);
    const layoutDisplay = document.getElementById("layout-effect-display");
    if (layoutDisplay) {
      layoutDisplay.style.backgroundColor =
        textInput.length > 5 ? "lightblue" : "white";
    }
    // 클린업 함수
    return () => {
      console.log(
        `🧹 useLayoutEffect 클린업: textInput ${textInput}에 대한 효과 정리`
      );
    };
  }, [textInput]);

  return createElement(
    "div",
    { className: "complex-counter-container" },
    createElement("h2", {}, "🧪 복합 useState & Effect 테스트"),

    // Count 섹션
    createElement(
      "div",
      { style: "margin-bottom: 1rem;" },
      createElement("p", {}, `카운트: ${count}`),
      createElement("button", { onclick: () => setCount(count + 1) }, "+1"),
      createElement("button", { onclick: () => setCount(count - 1) }, "-1"),
      createElement("button", { onclick: () => setCount(0) }, "Reset Count")
    ),

    // Text Input 섹션
    createElement(
      "div",
      { style: "margin-bottom: 1rem;" },
      createElement("p", {}, `입력 텍스트: ${textInput}`),
      createElement("input", {
        type: "text",
        value: textInput,
        oninput: (e: Event) =>
          setTextInput((e.target as HTMLInputElement).value),
        placeholder: "여기에 입력하세요",
        style: "width: 200px; padding: 5px;",
      })
    ),

    // Visibility Toggle 섹션
    createElement(
      "div",
      { style: "margin-bottom: 1rem;" },
      createElement(
        "button",
        { onclick: () => setIsVisible(!isVisible) },
        isVisible ? "숨기기" : "보이기"
      ),
      isVisible &&
        createElement(
          "div",
          {
            style: "padding: 10px; border: 1px solid gray; margin-top: 10px;",
          },
          "이 div는 보였다 숨겨졌다 합니다."
        )
    ),

    // Effect 결과 표시 섹션
    createElement(
      "div",
      { style: "margin-top: 2rem;" },
      createElement("h3", {}, "Effect 결과:"),
      createElement(
        "p",
        { id: "effect-display", style: "color: blue;" },
        "Effect: 초기 상태"
      ),
      createElement(
        "p",
        { id: "layout-effect-display", style: "padding: 5px;" },
        "Layout Effect: 초기 상태"
      )
    )
  );
}

// 래퍼 컴포넌트 생성
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
        "개발자 도구 Console을 열어서 렌더링 및 Effect 로그를 확인하세요 📊"
      )
    ),

    createElement(ComplexCounter, {})
  );
}

// 렌더링 시작
console.log("🎬 React Core Rebuild 테스트 시작!");
console.log(
  "👀 복합적인 useState, useEffect, useLayoutEffect 동작을 확인합니다..."
);

// Root HTML 생성
const rootElement = document.getElementById("root");

// render의 인자로 Root 컴포넌트와 Root HTML 전달
if (rootElement) {
  render(createElement(App, {}), rootElement);
  console.log("✅ 초기 렌더링 완료! 이제 버튼과 입력 필드를 조작해보세요.");
} else {
  console.error("❌ root 엘리먼트를 찾을 수 없습니다!");
}
