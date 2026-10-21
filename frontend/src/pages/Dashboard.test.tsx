import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "./Dashboard";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: { get: vi.fn() },
}));

const mockedGet = vi.mocked(api.get);

const DASHBOARD_PAYLOAD = {
  welcome: "Welcome back.",
  shortcuts: [
    {
      key: "cycle-tracking",
      label: "Cycle tracking",
      description: "Log period dates.",
      href: "/cycle-tracking",
      coming_soon: true,
    },
  ],
  recent_activity: [],
  cycle_overview: {
    last_period_start: "2024-01-01",
    last_flow: "medium",
    symptoms: ["cramps"],
    note: "Cycle length estimates require at least two recorded periods.",
  },
  screening_history: [
    {
      id: 1,
      kind: "anemia",
      method: "eye",
      status: "model_unavailable",
      created_at: "2024-01-02 10:00:00",
    },
  ],
  featured_education: [{ id: "anemia-iron-deficiency", href: "/education/anemia-iron-deficiency" }],
  next_steps: ["Log your most recent period start date."],
};

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Dashboard />
    </MemoryRouter>
  );

describe("Dashboard page", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders shortcuts, cycle overview, and screening history from the API", async () => {
    mockedGet.mockResolvedValue(DASHBOARD_PAYLOAD);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Cycle tracking")).toBeInTheDocument();
    });

    expect(screen.getByText("Start here")).toBeInTheDocument();
    expect(screen.getByText("Cycle overview")).toBeInTheDocument();
    expect(screen.getByText("cramps")).toBeInTheDocument();
    expect(screen.getByText("Screening history")).toBeInTheDocument();
    expect(screen.getByText("Anemia")).toBeInTheDocument();
    expect(screen.getByText("model unavailable")).toBeInTheDocument();
  });

  it("shows a recoverable error state when the API fails", async () => {
    mockedGet.mockRejectedValue(new Error("Network error"));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Unable to load dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
