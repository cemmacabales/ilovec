import { Link } from 'react-router-dom';
import { HeartBreak } from '@phosphor-icons/react';
import { EmptyState } from '../components/ui/Feedback';

export default function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState
        icon={<HeartBreak size={28} />}
        title="This page doesn't exist"
        action={
          <Link to="/" className="btn btn--primary">
            <span>Back home</span>
          </Link>
        }
      >
        The link might be old, or something got mistyped.
      </EmptyState>
    </div>
  );
}
