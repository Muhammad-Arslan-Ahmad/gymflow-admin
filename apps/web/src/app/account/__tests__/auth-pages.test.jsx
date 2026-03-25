import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi } from "vitest";

// Mock useAuth
vi.mock("@/utils/useAuth", () => ({
  default: () => ({
    signInWithCredentials: vi.fn(),
    signUpWithCredentials: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import SignInPage from "../signin/page";
import SignUpPage from "../signup/page";
import LogoutPage from "../logout/page";

function renderWithRouter(component, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>,
  );
}

describe("Sign In Page", () => {
  it("renders the page heading", () => {
    renderWithRouter(<SignInPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    renderWithRouter(<SignInPage />);
    expect(screen.getByPlaceholderText("admin@gym.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithRouter(<SignInPage />);
    expect(
      screen.getByRole("button", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("does not render Google sign-in button", () => {
    renderWithRouter(<SignInPage />);
    expect(
      screen.queryByRole("button", { name: /continue with google/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render signup link", () => {
    renderWithRouter(<SignInPage />);
    expect(screen.queryByText("Create account")).not.toBeInTheDocument();
  });

  it("shows contact admin message instead of signup", () => {
    renderWithRouter(<SignInPage />);
    expect(
      screen.getByText(/contact your administrator/i),
    ).toBeInTheDocument();
  });

  it("shows error when submitting empty form", async () => {
    renderWithRouter(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(
      await screen.findByText("Please fill in all fields"),
    ).toBeInTheDocument();
  });

  it("has password visibility toggle", () => {
    renderWithRouter(<SignInPage />);
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("tabindex") === "-1");
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it("renders GymFlow branding", () => {
    renderWithRouter(<SignInPage />);
    expect(screen.getAllByText("GymFlow").length).toBeGreaterThan(0);
  });
});

describe("Sign Up Page (Restricted)", () => {
  it("shows access restricted message", () => {
    renderWithRouter(<SignUpPage />);
    expect(screen.getByText("Access Restricted")).toBeInTheDocument();
  });

  it("shows contact administrator message", () => {
    renderWithRouter(<SignUpPage />);
    expect(
      screen.getByText(/contact your administrator/i),
    ).toBeInTheDocument();
  });

  it("has a link back to sign in", () => {
    renderWithRouter(<SignUpPage />);
    const link = screen.getByText("Back to Sign In");
    expect(link.closest("a")).toHaveAttribute("href", "/account/signin");
  });

  it("does not render any form fields", () => {
    renderWithRouter(<SignUpPage />);
    expect(screen.queryByPlaceholderText("admin@gym.com")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("John Doe")).not.toBeInTheDocument();
  });
});

describe("Logout Page", () => {
  it("renders loading state with branding", () => {
    renderWithRouter(<LogoutPage />);
    expect(screen.getByText("Signing you out")).toBeInTheDocument();
    expect(
      screen.getByText("You'll be redirected shortly"),
    ).toBeInTheDocument();
  });

  it("renders GymFlow branding", () => {
    renderWithRouter(<LogoutPage />);
    expect(screen.getByText("GymFlow")).toBeInTheDocument();
  });
});
