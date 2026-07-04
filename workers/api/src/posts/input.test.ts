import { describe, expect, it } from "vitest";

import { HttpError } from "../http";
import {
  formBoolean,
  formInteger,
  formString,
  getStringArray,
  isMultipart,
} from "./input";

describe("post input helpers", () => {
  it("detects multipart requests by content type", () => {
    expect(
      isMultipart(
        new Request("https://api.example.com/posts", {
          headers: { "Content-Type": "multipart/form-data; boundary=x" },
        }),
      ),
    ).toBe(true);
    expect(isMultipart(new Request("https://api.example.com/posts"))).toBe(
      false,
    );
  });

  it("reads optional string form values", () => {
    const formData = new FormData();
    formData.set("content", "hello");
    formData.set("empty", "");

    expect(formString(formData, "content")).toBe("hello");
    expect(formString(formData, "empty")).toBeUndefined();
    expect(formString(formData, "missing")).toBeUndefined();
  });

  it("reads boolean and integer form values", () => {
    const formData = new FormData();
    formData.set("truthy", "true");
    formData.set("falsy", "false");
    formData.set("number", "12");
    formData.set("decimal", "12.5");

    expect(formBoolean(formData, "truthy")).toBe(true);
    expect(formBoolean(formData, "falsy")).toBe(false);
    expect(formBoolean(formData, "missing")).toBeUndefined();
    expect(formInteger(formData, "number")).toBe(12);
    expect(formInteger(formData, "decimal")).toBeUndefined();
    expect(formInteger(formData, "missing")).toBeUndefined();
  });

  it("reads optional string arrays from JSON request bodies", () => {
    expect(getStringArray(undefined)).toEqual([]);
    expect(getStringArray(["a.jpg", "b.jpg"])).toEqual(["a.jpg", "b.jpg"]);
  });

  it("rejects non-array image values and non-string image items", () => {
    expect(() => getStringArray("a.jpg")).toThrow(HttpError);
    expect(() => getStringArray(["a.jpg", 1])).toThrow(HttpError);
  });
});
