// Redirect to public marketing page
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/(public)');
}
