import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MemoryRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { createElement } from "react";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
  };
});

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should navigate to /property/new on Cmd+N", () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockNavigate).toHaveBeenCalledWith("/property/new");
  });

  it("should navigate to /property/new on Ctrl+N (Windows)", () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockNavigate).toHaveBeenCalledWith("/property/new");
  });

  it("should not trigger Cmd+N when typing in input", () => {
    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      bubbles: true,
    });

    input.dispatchEvent(event);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not trigger Cmd+N when typing in textarea", () => {
    renderHook(() => useKeyboardShortcuts());

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      bubbles: true,
    });

    textarea.dispatchEvent(event);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not trigger Cmd+N when typing in contenteditable", () => {
    renderHook(() => useKeyboardShortcuts());

    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.appendChild(div);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      bubbles: true,
    });

    div.dispatchEvent(event);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not trigger without meta or ctrl key", () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent("keydown", {
      key: "n",
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not trigger Cmd+Shift+N", () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should click generate button on Cmd+Enter on generation page", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/property/123/listing" } as any);

    renderHook(() => useKeyboardShortcuts());

    const button = document.createElement("button");
    button.className = "bg-blue-600";
    button.disabled = false;
    const clickSpy = vi.fn();
    button.addEventListener("click", clickSpy);
    document.body.appendChild(button);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should work on social generation page", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/property/123/social" } as any);

    renderHook(() => useKeyboardShortcuts());

    const button = document.createElement("button");
    button.className = "bg-blue-600";
    const clickSpy = vi.fn();
    button.addEventListener("click", clickSpy);
    document.body.appendChild(button);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should work on email generation page", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/property/123/email" } as any);

    renderHook(() => useKeyboardShortcuts());

    const button = document.createElement("button");
    button.className = "bg-blue-600";
    const clickSpy = vi.fn();
    button.addEventListener("click", clickSpy);
    document.body.appendChild(button);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should not click generate button on non-generation pages", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/dashboard" } as any);

    renderHook(() => useKeyboardShortcuts());

    const button = document.createElement("button");
    button.className = "bg-blue-600";
    const clickSpy = vi.fn();
    button.addEventListener("click", clickSpy);
    document.body.appendChild(button);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("should not click disabled buttons", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/property/123/listing" } as any);

    renderHook(() => useKeyboardShortcuts());

    const button = document.createElement("button");
    button.className = "bg-blue-600";
    button.disabled = true;
    const clickSpy = vi.fn();
    button.addEventListener("click", clickSpy);
    document.body.appendChild(button);

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(clickSpy).not.toHaveBeenCalled();
  });
});
