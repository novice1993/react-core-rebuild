/**
 * @vitest-environment jsdom
 */

import { describe, test, expect } from "vitest";
import { renderToDOM } from "@/dom/renderToDOM";
import { createElement } from "@/jsx/createElement";

describe("renderToDOM", () => {
  test("virtualNode를 실제 DOM에 렌더링한다", () => {
    const virtualNode = createElement(
      "div",
      {
        id: "container",
      },
      createElement("p", null, "test"),
      "text"
    );

    const root = document.createElement("div");
    renderToDOM(virtualNode, root);

    expect(root.innerHTML).toBe(`<div id="container"><p>test</p>text</div>`);
  });
});
