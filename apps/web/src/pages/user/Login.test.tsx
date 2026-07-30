import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "@/pages/user/Login";

// 1. Your mutation hook — this is the main one. Controls isPending/mutate.
vi.mock("@/hooks/userAuthMutation", () => ({
  useLogin: vi.fn()
}));

// 2. Toast/flash messaging — this is what you'll assert on for the rate-limit test
vi.mock("@/lib/flash", () => ({
  flashMessage_Failed: vi.fn(),
}));

// 3. Auth context — component calls setToken/setUser on success, don't need real context
vi.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({ setToken: vi.fn(), setUser: vi.fn() }),
}));

// 4. Cart hooks — irrelevant to what you're testing, just stub them out
vi.mock("@/hooks/useCart", () => ({
  useCart: () => ({ migrateItem: vi.fn() }),
}));
vi.mock("@/hooks/useGuestCartStore", () => ({
  useGuestCartStore: () => ({ items: [] }),
}));

import { useLogin } from "@/hooks/userAuthMutation";
import { flashMessage_Failed } from "@/lib/flash";

// helper — Register uses <Link> and useNavigate, both need Router context
function renderLoginComponent() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<div>Register Page</div>} />
    </Routes>
  </MemoryRouter>
  );
}

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a rate-limit flash message when login is rejected with 429", async () => {
    const mockMutate = vi.fn((_data, { onError }) => {
      onError(new Error("Too many requests, please slow down."));
    });

    (useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const user = userEvent.setup();
    renderLoginComponent();

    // use the app's own demo-fill button instead of guessing LoginForm's field selectors
    await user.click(screen.getByText(/Fill customer demo/i));
    await user.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => {
      expect(flashMessage_Failed).toHaveBeenCalledWith(
        "Too many requests, please slow down."
      );
    });
  });

  it("show register page for dont have an account", async () => {

    const user = userEvent.setup();
    renderLoginComponent();

    // use the app's own demo-fill button instead of guessing LoginForm's field selectors
    await user.click(screen.getByText(/Don't have an account?/i));

    expect(screen.getByText(/Register Page/i)).toBeInTheDocument();
  });



  it("disables the button and shows loading text while pending", async ()=>{
     (useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
       //mutate: mockMutate,
       isPending: true,
     });
  
     renderLoginComponent();

     const loginButton = screen.getByRole("button", { name: /Logging in\.\.\./i });
     expect(loginButton).toBeDisabled();
  });
});