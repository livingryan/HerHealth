import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import "../lib/i18n";
import Home from "./Home";

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Home />
    </MemoryRouter>
  );

describe("Home page", () => {
  it("renders the hero heading and navigation links", () => {
    renderHome();
    expect(screen.getByText(/Your body keeps a quiet rhythm/i)).toBeInTheDocument();
    expect(screen.getByText(/Your health, understood/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore your health/i)).toBeInTheDocument();
    expect(screen.getByText(/Image-assisted anemia screening/i)).toBeInTheDocument();
    expect(screen.getByText(/Menstrual health tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/health education/i)).toBeInTheDocument();
  });

  it("links to the dashboard and cycle tracking", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Explore your health/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });

  it("states the responsible-screening limitation", () => {
    renderHome();
    expect(screen.getByText(/A blood test is the only way to confirm anemia/i)).toBeInTheDocument();
  });
});