import { describe, it, expect } from "vitest";
import { createElement } from "../jsx/createElement";

describe("createElement", () => {
  // case 01 : ReactElement with string child
  it("should create a simple ReactElement with text child", () => {
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

  // case 02 : ReactElement with another React Element
  it("should create nested ReactElement correctly", () => {
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

  // case 03 : check children normalize - filter out null, undefined, boolean
  it("should filter out null, undefined, and boolean children", () => {
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

  // case 04 : check children normalize - convert number type children to string type
  it("should convert number children to string", () => {
    const virtualNode = createElement("div", null, 1);

    expect(virtualNode.props.children).toEqual(["1"]);
  });

  // case 05 : throw error when invalid object children
  it("should throw on invalid object children", () => {
    const invalidChild = { a: 1 };

    expect(() => createElement("div", null, invalidChild as any)).toThrow(
      /Invalid object passed as child/
    );
  });
});
