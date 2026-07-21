import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthGuard } from '@/features/auth/AuthGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { FamiliesPage } from '@/features/families/FamiliesPage'
import { MembersPage } from '@/features/members/MembersPage'
import { FuneralCasesPage } from '@/features/funeral-cases/FuneralCasesPage'
import { ExpensesPage } from '@/features/expenses/ExpensesPage'
import { CollectionsPage } from '@/features/collections/CollectionsPage'
import { PaymentsPage } from '@/features/payments/PaymentsPage'
import { AnnouncementsPage } from '@/features/announcements/AnnouncementsPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { DocumentsPage } from '@/features/documents/DocumentsPage'
import { PublicLayout } from '@/features/public/PublicLayout'
import { PublicHomePage } from '@/features/public/PublicHomePage'
import { PublicAnnouncementsPage } from '@/features/public/PublicAnnouncementsPage'
import { PublicFuneralCasesPage } from '@/features/public/PublicFuneralCasesPage'
import { PublicAboutPage } from '@/features/public/PublicAboutPage'
import { PublicMembershipPage } from '@/features/public/PublicMembershipPage'
import { PublicCommitteePage } from '@/features/public/PublicCommitteePage'
import { PublicDonationPage } from '@/features/public/PublicDonationPage'
import { PublicDownloadsPage } from '@/features/public/PublicDownloadsPage'
import { PublicContactPage } from '@/features/public/PublicContactPage'
import { PublicFaqPage } from '@/features/public/PublicFaqPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route index element={<PublicHomePage />} />
            <Route path="announcements" element={<PublicAnnouncementsPage />} />
            <Route path="funeral-cases" element={<PublicFuneralCasesPage />} />
            <Route path="about" element={<PublicAboutPage />} />
            <Route path="membership" element={<PublicMembershipPage />} />
            <Route path="committee" element={<PublicCommitteePage />} />
            <Route path="donate" element={<PublicDonationPage />} />
            <Route path="downloads" element={<PublicDownloadsPage />} />
            <Route path="contact" element={<PublicContactPage />} />
            <Route path="faq" element={<PublicFaqPage />} />
          </Route>

          {/* Admin panel */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="families" element={<FamiliesPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="funeral-cases" element={<FuneralCasesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
