import { BrowserRouter } from "react-router-dom";
import { useAuth } from "@/app/providers/auth/useAuth";
import { AppRoutes } from "@/app/routes/AppRoutes";

function App() {
  const authData = useAuth();
  const isDebug = import.meta.env.VITE_DEBUG === "true";

  
  if (!authData) {
   
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="p-8 bg-card rounded-lg shadow-md text-center border border-destructive/30">
          <h1 className="text-2xl font-bold text-destructive mb-2">Ошибка конфигурации</h1>
          <p className="text-muted-foreground">
            Контекст аутентификации не найден. Убедитесь, что ваше приложение обернуто в <code>&lt;AuthProvider&gt;</code>.
          </p>
        </div>
      </div>
    );
  }

  const {
    isUserLoading,
    isRestoringSession,
    csrfWarning,
    dismissCsrfWarning
  } = authData;

  if (isRestoringSession) {
    return <FullScreenLoader label={isDebug ? "Загрузка сессии..." : undefined} />;
  }

  if (isUserLoading) {
    return <FullScreenLoader label={isDebug ? "Загрузка пользователя..." : undefined} />;
  }

  return (
    <BrowserRouter>
      {isDebug ? (
        <CsrfWarningBanner message={csrfWarning} onDismiss={dismissCsrfWarning} />
      ) : null}
      <AppRoutes />
    </BrowserRouter>
  );
}

const CsrfWarningBanner = ({
  message,
  onDismiss
}: {
  message: string | null;
  onDismiss: () => void;
}) => {
  if (!message) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <span className="text-sm sm:text-base">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-amber-500/30 bg-background px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-200"
        >
          Скрыть
        </button>
      </div>
    </div>
  );
};

const FullScreenLoader = ({ label }: { label?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="h-10 w-10 rounded-full border-4 border-muted border-t-foreground animate-spin" />
      {label ? <p className="text-lg text-muted-foreground">{label}</p> : null}
    </div>
  );
};

const styles = `
.input { @apply px-3 py-2 border rounded-2xl outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition; }
.btn { @apply inline-flex items-center justify-center px-3 py-2 rounded-2xl border text-sm font-medium transition active:translate-y-[1px]; }
.btn.primary { @apply border-sky-700 bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/20; }
.btn.secondary { @apply border-slate-300 bg-white hover:bg-slate-50; }

/* Анимации для страницы аутентификации */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
.animate-float { animation: float 6s ease-in-out infinite; }
.backdrop-blur-lg { backdrop-filter: blur(16px); }
`;

const StyleInjector = () => <style dangerouslySetInnerHTML={{ __html: styles }} />;

export default function WrappedApp() {
  return (
    <>
      <StyleInjector />
      <App />
    </>
  );
}
