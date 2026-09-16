import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function ProtectedRoute({ children, role }: { children: any; role?: string }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // startLogin(); // Disabled for local development
    }
  }, [loading, user]);

  // if (loading) {
  //   return (
  //     <main className="app-shell internal-shell">
  //       <div className="internal-state">
  //         <div className="spinner" />
  //         <span>Verificando credenciais...</span>
  //       </div>
  //     </main>
  //   );
  // }

  // if (!user) return null;

  // if (role && user.role !== role) {
  //   return (
  //     <main className="app-shell internal-shell">
  //       <div className="internal-state auth-state">
  //         <h1>Acesso Restrito</h1>
  //         <p>Você não possui as permissões necessárias para acessar esta área.</p>
  //         <button className="secondary-btn" onClick={() => setLocation("/")}>
  //           Voltar para o Início
  //         </button>
  //       </div>
  //     </main>
  //   );
  // }

  return children;
}
