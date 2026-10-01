import { useState, type ReactNode } from 'react';
import { Heart } from '@phosphor-icons/react';
import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { Button } from '../components/ui/Button';
import { FieldGroup, FormError, InputRow } from '../components/ui/Fields';
import { missingConfig } from '../services/supabase';
import { signIn, signOut, useAuth, useMe } from '../lib/auth';
import { useLiveSync } from '../lib/realtime';
import { demoMode } from '../dev/flag';

function GateCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="gate">
      <div className="gate__card">
        <span className="gate__mark" aria-hidden>
          <Heart size={24} weight="fill" />
        </span>
        <h1 className="gate__title">{title}</h1>
        {children}
      </div>
    </main>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      if (isAuthRetryableFetchError(err) || !navigator.onLine) setError("Can't reach the server. Check your connection.");
      else if (isAuthApiError(err) && err.code === 'invalid_credentials') setError("That email and password don't match.");
      else setError("Couldn't sign in. Try again in a moment.");
      setBusy(false);
    }
  };

  return (
    <GateCard title="I Love C">
      <p className="gate__sub">C &amp; C</p>
      <form
        className="gate__form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <FieldGroup>
          <InputRow
            label="Email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <InputRow
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldGroup>
        <FormError message={error} />
        <Button type="submit" variant="primary" className="gate__submit" disabled={busy}>
          {busy ? 'Signing in' : 'Sign in'}
        </Button>
      </form>
      <p className="gate__foot">Just for the two of you. There's no sign-up.</p>
    </GateCard>
  );
}

function NotLinked({ onRetry }: { onRetry: () => void }) {
  return (
    <GateCard title="Almost there">
      <p className="gate__text">
        You're signed in, but this account isn't linked as Him or Her yet. Once it's added, try again.
      </p>
      <div className="gate__actions">
        <Button onClick={() => void signOut()}>Sign out</Button>
        <Button variant="primary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </GateCard>
  );
}

function LiveSync() {
  useLiveSync();
  return null;
}

function Member({ children }: { children: ReactNode }) {
  const { person, status, reload } = useMe();
  if (status === 'loading') return <div className="gate" aria-busy="true" />;
  // An error here usually means offline with a saved session: let the app
  // open and show its own offline state rather than locking you out.
  if (status === 'ready' && !person) return <NotLinked onRetry={() => void reload()} />;
  return (
    <>
      <LiveSync />
      {children}
    </>
  );
}

function Session({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status === 'loading') return <div className="gate" aria-busy="true" />;
  if (auth.status === 'signed-out') return <SignIn />;
  return <Member>{children}</Member>;
}

// Everything behind this needs a signed-in, linked account.
export function AuthGate({ children }: { children: ReactNode }) {
  if (demoMode) return <>{children}</>;
  if (missingConfig) {
    return (
      <GateCard title="Not connected">
        <p className="gate__text">
          This build has no database settings. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rebuild.
        </p>
      </GateCard>
    );
  }
  return <Session>{children}</Session>;
}
