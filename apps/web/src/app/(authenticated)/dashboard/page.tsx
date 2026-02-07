import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to DataForge as the main dashboard
  redirect('/dataforge')
}
