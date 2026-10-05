import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/axios';
import { loginSchema } from '../../schemas/auth';
import type { LoginFormValues } from '../../schemas/auth';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from ?? '/home';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      await login(values);
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <AuthLayout
      title="Welcome back, Bulldog"
      subtitle="Log in to continue to Campus Connect."
      footer={
        <>
          New to KabeleNU?{' '}
          <Link to="/register" className="font-semibold text-nu-gold hover:underline">
            Create an account
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
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
