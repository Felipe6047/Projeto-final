import { render, screen } from "@testing-library/react";
import { TopHeader } from "../../components/layout/TopHeader";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { axe } from "jest-axe";

// Mocking useNotificacoesCount to return 0 so fetch isn't called on mount
jest.mock("@/components/notifications/NotificationsPanel", () => ({
  NotificationsPanel: () => <div data-testid="mock-notifications-panel" />,
  useNotificacoesCount: () => 0,
}));

jest.mock("@/lib/api", () => ({
  getPerfil: jest.fn().mockResolvedValue({ pontos: 1000 }),
  getToken: jest.fn().mockReturnValue("fake-token"),
  login: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
}));

describe("TopHeader Component", () => {
  it("must not have basic accessibility violations", async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TopHeader />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should render a search input", () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TopHeader />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText(/buscar recompensas ou missões/i);
    expect(searchInput).toBeInTheDocument();
  });
});
