import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function NotFoundPage(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="text-6xl font-extrabold text-nu-blue">404</p>
      <div className="my-4 h-1 w-16 rounded-full bg-nu-gold" />
      <h1 className="text-2xl font-bold text-nu-blue">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist or may have been moved.</p>
      <Button className="mt-6" onClick={() => navigate(user ? '/home' : '/')}>
        {user ? 'Back to the feed' : 'Back to the home page'}
      </Button>
    </div>
  );
}
