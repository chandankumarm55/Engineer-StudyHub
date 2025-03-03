import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import MainLayout from "./Layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import JobPortalPage from "./pages/JobPortalPage";
import DeveloperPage from "./pages/DeveloperPage";
import LearningMaterial from "./Components/EngineersLibrary/EngineersLibrary";
import RegisterPage from "./pages/RegistrationPage";
import CareerDashboard from "./Components/JobPortal/CareerDashboard";
import Dashboardpage from "./pages/Dashboardpage";
import ContactUs from "./Components/ContactUs/ContactUs";
import AboutUs from "./Components/AboutUs/AboutUs";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import CompanyProfile from "./Components/CompanyDash/Tabs/CompanyProfile";
import CreateJobPost from "./Components/CompanyDash/Tabs/CreateJobPost";
import CreateEvent from "./Components/CompanyDash/Tabs/Create Event/CreateEvent";
import Notifications from "./Components/CompanyDash/Tabs/Notifications";
import ProfilePage from "./pages/Profile";
import CompanyDetail from "./Components/CompanyDash/Tabs/CompanyDetail";
import DeveloperDetailPage from "./Components/DevelopersHub/DeveloperResources/DeveloperDetailPage";
import CompanyDash from "./Components/CompanyDash/CompanyDashboard"
function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="homePage" element={<HomePage />} />
            <Route path="Dashboard" element={<Dashboardpage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="learning-material" element={<LearningMaterial />} />
            <Route path="DevelopersHub" element={<DeveloperPage />} />
            <Route path="/resources/:key" element={<DeveloperDetailPage />} />
            <Route path="ContactUs" element={<ContactUs />} />
            <Route path="AboutUs" element={<AboutUs />} />
            <Route path="engineerLib" element={<LearningMaterial />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<JobPortalPage />} />

            {/* Nested Routes for CompanyDashboard */}
            <Route path="/company-dashboard" element={<CompanyDash />}>
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="create-company" element={<CareerDashboard />} />
              <Route path="create-job-post" element={<CreateJobPost />} />
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="view-notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
