import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CountdownPage } from "./pages/CountdownPage";
import { LoginPage } from "./pages/LoginPage";
import { CountdownPageViewer } from "./pages/CountdownViewPage";
import { getRole } from "./services/authService";

const ProtectedRoute = ({ children }: any) => {
  const role = getRole();
  if (!role) return <Navigate to="/login" />;
  return children;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/countdownView" element={<CountdownPageViewer />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/countdown"
          element={
            <ProtectedRoute>
              <CountdownPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
