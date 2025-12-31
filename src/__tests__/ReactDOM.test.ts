/**
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach } from "vitest";
import { createElement } from "@/jsx/createElement";
import { render } from "@/ReactDOM";

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
    const firstContainer = document.createElement("div");
    const secondContaienr = document.createElement("div");

    // 첫 번째 render
    render(createElement("h1", null, "First"), firstContainer);
    const firstFiberRoot = (firstContainer as any)._renderRootContainer;
    const firstCurrent = firstFiberRoot?.current;

    // 두 번째 render
    render(createElement("h1", null, "Second"), secondContaienr);
    const secondFiberRoot = (secondContaienr as any)._renderRootContainer;
    const secondCurrent = secondFiberRoot?.current;

    // 검증
    expect(firstCurrent).not.toBe(secondCurrent);
    expect(firstContainer.innerHTML).toBe("<h1>First</h1>");
    expect(secondContaienr.innerHTML).toBe("<h1>Second</h1>");
  });
});
