import { createBrowserRouter } from "react-router-dom"

import { PublicLayout } from "@/layouts/PublicLayout"
import { ProtectedRoute } from "@/guards/ProtectedRoute"
import { RoleRoute } from "@/guards/RoleRoute"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { LandingPage } from "@/pages/public/LandingPage"
import { ConnectPage } from "@/pages/public/ConnectPage"
import { NotFoundPage } from "@/pages/errors/NotFoundPage"
import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage"
import { ParticipantsPage } from "@/pages/admin/ParticipantsPage"
import { DocumentsPage } from "@/pages/documents/DocumentsPage"
import { DocumentDetailPage } from "@/pages/documents/DocumentDetailPage"
import { ShareDocumentPage } from "@/pages/permissions/ShareDocumentPage"
import { PermissionsPage } from "@/pages/permissions/PermissionsPage"
import { PermissionDetailPage } from "@/pages/permissions/PermissionDetailPage"
import { AuthorizedDocumentsPage } from "@/pages/authorized-documents/AuthorizedDocumentsPage"
import { AuthorizedDocumentDetailPage } from "@/pages/authorized-documents/AuthorizedDocumentDetailPage"
import { ActivityPage } from "@/pages/activity/ActivityPage"
import { TransactionsPage } from "@/pages/transactions/TransactionsPage"
import { ProfilePage } from "@/pages/profile/ProfilePage"
import { SettingsPage } from "@/pages/settings/SettingsPage"
import { AppNotFoundPage } from "@/pages/errors/AppNotFoundPage"
import { Navigate } from "react-router-dom"

export const appRouter = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "connect",
        element: <ConnectPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardHomePage />,
          },
          {
            element: <RoleRoute allowedRoles={["ADMIN"]} />,
            children: [
              {
                path: "participants",
                element: <ParticipantsPage />,
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["PATIENT"]} />,
            children: [
              {
                path: "documents",
                element: <DocumentsPage />,
              },
              {
                path: "documents/:documentId",
                element: <DocumentDetailPage />,
              },
              {
                path: "documents/:documentId/share",
                element: <ShareDocumentPage />,
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["PATIENT", "DOCTOR", "CLINIC", "INSURANCE"]} />,
            children: [
              {
                path: "permissions",
                element: <PermissionsPage />,
              },
              {
                path: "permissions/:permissionId",
                element: <PermissionDetailPage />,
              },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["DOCTOR", "CLINIC", "INSURANCE"]} />,
            children: [
              {
                path: "authorized-documents",
                element: <AuthorizedDocumentsPage />,
              },
              {
                path: "authorized-documents/:documentId",
                element: <AuthorizedDocumentDetailPage />,
              },
            ],
          },
          {
            path: "activity",
            element: <ActivityPage />,
          },
          {
            path: "transactions",
            element: <TransactionsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "*",
            element: <AppNotFoundPage />,
          },
        ],
      },
    ],
  },
])