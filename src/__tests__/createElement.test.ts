import { describe, test, expect } from "vitest";
import { createElement } from "@/jsx/createElement";

describe("createElement", () => {
  // case 01 : 문자열 자식을 가지는 ReactElement 생성
  test("문자열 자식을 가지는 ReactElement를 생성한다", () => {
    const virtualNode = createElement(
      "div",
      { id: "main", key: "test" },
      "hello"
    );

    expect(virtualNode).toEqual({
      type: "div",
      key: "test",
      props: { id: "main", children: ["hello"] },
    });
  });

  // case 02 : 중첩된 ReactElement 생성
  test("ReactElement 내부에 다른 ReactElement를 중첩 생성한다", () => {
    const virtualNode = createElement(
      "ul",
      null,
      createElement("li", { key: 1 }, "item01"),
      createElement("li", { key: 2 }, "item02")
    );

    expect(virtualNode.type).equal("ul");
    expect(Array.isArray(virtualNode.props.children)).toBe(true);
    expect(virtualNode.props.children).toHaveLength(2);
    expect((virtualNode.props.children[0] as any).type).toBe("li");
  });

  // case 03 : null, undefined, boolean 자식 제거
  test("null, undefined, boolean 타입 자식 노드를 필터링한다", () => {
    const virtualNode = createElement(
      "div",
      null,
      null,
      "test",
      false,
      undefined
    );

    expect(virtualNode.props.children).toEqual(["test"]);
  });

  // case 04 : 숫자 타입 자식을 문자열로 변환
  test("숫자 타입 자식을 문자열로 변환한다", () => {
    const virtualNode = createElement("div", null, 1);

    expect(virtualNode.props.children).toEqual(["1"]);
  });

  // case 05 : 유효하지 않은 객체 자식이 들어올 경우 예외 발생
  test("유효하지 않은 객체 자식이 들어올 경우 예외를 발생시킨다", () => {
    const invalidChild = { a: 1 };

    expect(() => createElement("div", null, invalidChild as any)).toThrow(
      /Invalid object passed as child/
    );
  });
});
