import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleSelection from "./pages/auth/RoleSelection";
import KycUpload from "./pages/auth/KycUpload";
import VerificationStatus from "./pages/auth/VerificationStatus";

import HomeFeed from "./pages/consumer/HomeFeed";
import GroupDetails from "./pages/consumer/GroupDetails";
import MyGroups from "./pages/consumer/MyGroups";

import OrganizerDashboard from "./pages/organizer/Dashboard";
import CreateGroup from "./pages/organizer/CreateGroup";
import GroupManagement from "./pages/organizer/GroupManagement";

import ChatList from "./pages/chat/ChatList";
import ChatRoom from "./pages/chat/ChatRoom";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" dir="rtl" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/kyc" element={<KycUpload />} />
            <Route path="/verification-status" element={<VerificationStatus />} />

            {/* App routes (with layout) */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomeFeed />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route
                path="/my-groups"
                element={
                  <ProtectedRoute>
                    <MyGroups />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireRole="organizer" requireKyc>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create"
                element={
                  <ProtectedRoute requireRole="organizer" requireKyc>
                    <CreateGroup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/group/:id"
                element={
                  <ProtectedRoute requireRole="organizer" requireKyc>
                    <GroupManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chats"
                element={
                  <ProtectedRoute>
                    <ChatList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats/:id"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />

              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
