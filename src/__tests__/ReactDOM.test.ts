/**
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach } from "vitest";
import { createElement } from "@/jsx/createElement";
import { render } from "@/ReactDOM";
import { getGlobalFiberRoot } from "@/fiber/core/fiberRootContext";

describe("ReactDOM.render", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("container에 element를 렌더링한다", () => {
    // 1. Container 생성
    const container = document.createElement("div");
    container.id = "root";
    document.body.appendChild(container);

    // 2. Element 생성
    const element = createElement("h1", null, "Hello ReactDOM!");

    // 3. render 호출
    render(element, container);

    // 4. 결과 확인
    console.log("Container innerHTML:", container.innerHTML);

    // 4-1. container 내부에 h1이 있는지 확인
    const h1Element = container.querySelector("h1");
    expect(h1Element).not.toBeNull();

    // 4-2. 해당 h1의 textContent 확인
    expect(h1Element!.textContent).toBe("Hello ReactDOM!");
  });

  test("두 번째 render 호출 시 이중버퍼링이 동작한다", () => {
    const container = document.createElement("div");

    // 첫 번째 render
    render(createElement("h1", null, "First"), container);
    const firstFiberRoot = getGlobalFiberRoot();
    const firstCurrent = firstFiberRoot?.current;

    // 두 번째 render
    render(createElement("h1", null, "Second"), container);
    const secondFiberRoot = getGlobalFiberRoot();
    const secondCurrent = secondFiberRoot?.current;

    // 검증
    expect(firstFiberRoot).toBe(secondFiberRoot); // 같은 FiberRoot
    expect(firstCurrent).not.toBe(secondCurrent); // current는 교체됨
    expect(container.innerHTML).toBe("<h1>Second</h1>");
  });
});
