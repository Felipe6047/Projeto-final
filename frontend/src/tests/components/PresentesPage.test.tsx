import { render, screen, waitFor } from "@testing-library/react";
import { PresentesPage } from "../../components/pages/PresentesPage";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { axe } from "jest-axe";

// Mocking NotificationsPanel para não fazer requisições não controladas no teste
jest.mock("@/components/notifications/NotificationsPanel", () => ({
  NotificationsPanel: () => <div data-testid="mock-notifications-panel" />,
  useNotificacoesCount: () => 0,
}));

// Mock das chamadas de API
jest.mock("@/lib/api", () => ({
  listarProdutos: jest.fn().mockResolvedValue({ produtos: [], total: 0 }),
  listarPedidosPresente: jest.fn().mockResolvedValue([]),
  getMeusCupons: jest.fn().mockResolvedValue([]),
  getMeusAmigos: jest.fn().mockResolvedValue([]),
  listarMeusEnderecos: jest.fn().mockResolvedValue([]),
  getNotificacoes: jest.fn().mockResolvedValue({ naoLidas: 0 }),
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
    return "/presentes";
  },
}));

describe("PresentesPage Component", () => {
  it("must not have basic accessibility violations", async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PresentesPage />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should render empty state when no products are returned", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PresentesPage />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    // Wait for the mock to resolve and state to update
    await waitFor(() => {
      expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
      expect(screen.getByText(/Não temos produtos disponíveis no momento/i)).toBeInTheDocument();
    });
  });
});
