import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Algo deu errado</h2>
          <p style={{ color: "#666" }}>
            Ocorreu um erro inesperado. Recarregue a página para continuar.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
