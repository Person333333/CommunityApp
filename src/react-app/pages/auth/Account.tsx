import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';

export default function AccountPage() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-xl">
          <GlassCard variant="strong" className="text-center py-12">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Please sign in</h1>
            <p className="text-slate-300">You need to sign in to manage your account.</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">Your Account</h1>
          <p className="text-xl text-slate-300">Manage your profile and preferences</p>
        </motion.div>

        <div className="space-y-6">
          <GlassCard variant="teal">
            <div className="flex items-center gap-4">
              <img src={user?.imageUrl || ''} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">{user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}</h2>
                <p className="text-slate-300">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="strong">
            <div className="flex flex-wrap gap-3">
              <GlassButton onClick={() => (window.location.href = '/discover')} variant="secondary">View Resources</GlassButton>
              <GlassButton onClick={() => (window.location.href = '/submit')} variant="secondary">Submit a Resource</GlassButton>
              <GlassButton onClick={() => signOut().then(() => (window.location.href = '/'))} variant="ghost">Sign Out</GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
