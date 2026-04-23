import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import InviteUser from "./pages/InviteUser";
import OrganizationChange from "./pages/OrganizationChange";
import GlobalSettings from "./pages/GlobalSettings";
import Signup from "./pages/signup";
import UserManagementPage from "./pages/UserManagementPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inviteuser" element={<InviteUser />} />

        {/* FIXED */}
        <Route
          path="/organizationchange/:teamId"
          element={<OrganizationChange />}
        />

        <Route path="/settings" element={<GlobalSettings />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/usermangement/:teamId" element={<UserManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;