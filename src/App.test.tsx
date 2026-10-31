import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "./App";
import { api } from "./lib/api";

vi.mock("./lib/api", () => ({
  api: { get: vi.fn() },
}));

const mockedGet = vi.mocked(api.get);

const DASHBOARD_PAYLOAD = {
  welcome: "Welcome back. Here is a gentle overview.",
  shortcuts: [
    {
      key: "cycle-tracking",
      label: "Cycle tracking",
      description: "Log period dates, flow, and symptoms.",
      href: "/cycle-tracking",
      coming_soon: true,
    },
    {
      key: "anemia-screening",
      label: "Anemia screening",
      description: "Image-assisted screening.",
      href: "/screening/anemia",
      coming_soon: true,
    },
    {
      key: "health-education",
      label: "Health education",
      description: "Articles on anemia and more.",
      href: "/education",
      coming_soon: false,
    },
    {
      key: "reports",
      label: "Reports & history",
      description: "Your saved records.",
      href: "/reports",
      coming_soon: true,
    },
  ],
  recent_activity: [],
  cycle_overview: {
    last_period_start: "2024-01-01",
    last_flow: "medium",
    symptoms: ["cramps", "fatigue"],
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
  featured_education: [
    { id: "anemia-iron-deficiency", href: "/education/anemia-iron-deficiency" },
  ],
  next_steps: ["Log your most recent period start date in the cycle tracker."],
};

const renderApp = (path = "/") => {
  // App owns its own BrowserRouter, so point it at the route under test and
  // let the app's internal router resolve it.
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("HerHealth app shell", () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue(DASHBOARD_PAYLOAD);
  });

  afterEach(() => {
    mockedGet.mockReset();
  });

  it("renders the homepage with the hero, sections, and medical-safety copy", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Your body keeps a quiet rhythm/i
    );
    expect(screen.getByText(/Image-assisted anemia screening/i)).toBeInTheDocument();
    expect(screen.getByText(/Menstrual health tracking/i)).toBeInTheDocument();
    expect(
      screen.getByText(/A blood test is the only way to confirm anemia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Real AI analysis is/i)).toBeInTheDocument();
  });

  it("renders the dashboard from the API contract", async () => {
    renderApp("/dashboard");

    const main = await screen.findByRole("main");

    await waitFor(() => {
      expect(within(main).getByText("Start here")).toBeInTheDocument();
    });

    expect(within(main).getByText("Cycle tracking")).toBeInTheDocument();
    expect(within(main).getByText("Anemia screening")).toBeInTheDocument();
    expect(within(main).getByText("Health education")).toBeInTheDocument();
    expect(within(main).getByText("cramps")).toBeInTheDocument();
    expect(within(main).getByText("model unavailable")).toBeInTheDocument();
    expect(
      within(main).getByText(/Log your most recent period start date/i)
    ).toBeInTheDocument();
  });

  it("shows the dashboard error state when the API is unreachable", async () => {
    mockedGet.mockRejectedValue(new Error("Failed to fetch"));
    renderApp("/dashboard");

    await waitFor(() => {
      expect(screen.getByText("Unable to load dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("opens and closes the mobile navigation menu", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const toggle = screen.getByRole("button", { name: /open navigation menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");

    await user.click(toggle);

    const menu = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(within(menu).getByRole("link", { name: /dashboard/i })).toBeInTheDocument();

    const closeToggle = screen.getByRole("button", { name: /close navigation menu/i });
    expect(closeToggle).toHaveAttribute("aria-expanded", "true");

    await user.click(closeToggle);

    expect(
      screen.queryByRole("navigation", { name: /mobile navigation/i })
    ).not.toBeInTheDocument();
  });

  it("renders a coming-soon page for unbuilt routes", () => {
    renderApp("/reports");
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to dashboard/i })
    ).toHaveAttribute("href", "/dashboard");
  });
});
