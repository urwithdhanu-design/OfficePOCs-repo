import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";

// Mock console.error to track 404 logging
const originalConsoleError = console.error;

const renderNotFound = (path: string = "/unknown") => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotFound />
    </MemoryRouter>
  );
};

describe("NotFound", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders the 404 heading", () => {
    renderNotFound();
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("renders the error message", () => {
    renderNotFound();
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
  });

  it("renders a link to return home", () => {
    renderNotFound();
    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("logs 404 error to console", () => {
    renderNotFound("/some-invalid-path");
    expect(console.error).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      expect.any(String)
    );
  });

  it("has proper styling classes", () => {
    const { container } = renderNotFound();
    expect(container.firstChild).toHaveClass("flex", "min-h-screen", "items-center", "justify-center");
  });

  it("renders with proper text styling", () => {
    renderNotFound();
    const heading = screen.getByRole("heading", { name: "404" });
    expect(heading).toHaveClass("text-4xl", "font-bold");
  });
});
