import { Navigate, Route, Routes } from "react-router-dom";
import { LeadsProvider } from "./context/LeadsContext";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LeadsListPage } from "./pages/LeadsListPage";
import { LeadFormPage } from "./pages/LeadFormPage";
import { FollowupsPage } from "./pages/FollowupsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { KanbanPage } from "./pages/KanbanPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <LeadsProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsListPage />} />
          <Route path="leads/kanban" element={<KanbanPage />} />
          <Route path="leads/new" element={<LeadFormPage />} />
          <Route path="followups" element={<FollowupsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </LeadsProvider>
  );
}

export default App;
