/**
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach } from "vitest";
import { createElement } from "@/jsx/createElement";
import { createFiberTree } from "@/fiber/core/createFiberTree";
import { beginWork } from "@/fiber/core/beginWork";
import { completeWork } from "@/fiber/core/completeWork";
import { commitWork } from "@/fiber/core/commitWork";

describe("Fiber 렌더링 사이클 (Vanilla ReactCore) - DOM commit 테스트", () => {
  beforeEach(() => {
    // 테스트 전마다 DOM 초기화
    document.body.innerHTML = "";
  });

  test("createElement → commitWork까지 전체 흐름에서 DOM이 정상 생성된다", () => {
    // 1. JSX 기반 구조 정의
    const vnode = createElement(
      "div",
      null,
      createElement("span", null),
      createElement("button", null)
    );

    // 2. Fiber 트리 생성
    const root = createFiberTree(vnode, null);

    // 3. Render Phase 실행
    beginWork(root);
    completeWork(root);

    // 4. Commit Phase 실행
    commitWork(root);

    // 5. DOM 검증
    const div = document.body.querySelector("div");
    const span = div?.querySelector("span");
    const button = div?.querySelector("button");

    expect(document.body.innerHTML).toBe(
      "<div><span></span><button></button></div>"
    );
    expect(div).not.toBeNull();
    expect(span).not.toBeNull();
    expect(button).not.toBeNull();
  });
});
