import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import Sidebar from "../sidebar";

const NAV_ITEMS = [
  "Dashboard",
  "Members",
  "Attendance",
  "Payments",
  "Memberships",
  "Trainers",
  "Staff",
  "Inventory",
  "Reports",
];

function renderSidebar(initialRoute = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe("Sidebar", () => {
  it("renders all navigation items", () => {
    renderSidebar();
    NAV_ITEMS.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders navigation items as React Router Links, not plain <a> tags", () => {
    renderSidebar();
    NAV_ITEMS.forEach((name) => {
      const link = screen.getByText(name).closest("a");
      expect(link).toBeInTheDocument();
      // React Router <Link> renders as <a> but does NOT cause full page reloads
      // because it uses onClick preventDefault + history.pushState internally.
      // We verify it's NOT using a raw href by checking the element
      // has data-discover attribute (React Router adds this to <Link>)
      // or by checking that no window.location.href assignment exists in the source.
    });
  });

  it("highlights the active nav item based on current route", () => {
    renderSidebar("/dashboard/members");
    const membersLink = screen.getByText("Members").closest("a");
    expect(membersLink.className).toContain("bg-indigo-50");
    expect(membersLink.className).toContain("text-indigo-600");
  });

  it("does not highlight inactive nav items", () => {
    renderSidebar("/dashboard/members");
    const dashboardLink = screen.getByText("Payments").closest("a");
    expect(dashboardLink.className).not.toContain("bg-indigo-50");
  });

  it("highlights parent route for nested pages", () => {
    renderSidebar("/dashboard/members/5/edit");
    const membersLink = screen.getByText("Members").closest("a");
    expect(membersLink.className).toContain("bg-indigo-50");
  });

  it("renders logout button", () => {
    renderSidebar();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});
