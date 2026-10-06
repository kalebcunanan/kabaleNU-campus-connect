import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import PasswordInput from '../../components/common/PasswordInput';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useWelcomeSubmit } from '../../hooks/useWelcomeSubmit';
import { getErrorMessage } from '../../lib/axios';
import { loginSchema } from '../../schemas/auth';
import type { LoginFormValues } from '../../schemas/auth';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? '/home';

  const { run, isPending, isLeaving } = useWelcomeSubmit('login', redirectTo);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      await run(() => login(values));
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  if (isLoading) return <Loader label="Checking your session..." />;
  if (isAuthenticated && !isPending) return <Navigate to={redirectTo} replace />;

  return (
    <AuthLayout
      isLeaving={isLeaving}
      title="Welcome back, Bulldog!"
      subtitle="Anong chika sa campus? Log in to catch up."
      footer={
        <>
          New to KabaleNU?{' '}
          <Link to="/register" className="font-semibold text-nu-gold hover:underline">
            Join the pack
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.server && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.root.server.message}
          </p>
        )}
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" isLoading={isSubmitting || isPending} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
