import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import type { SelectOption } from '../../components/common/Select';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/axios';
import { registerSchema } from '../../schemas/auth';
import type { RegisterFormValues } from '../../schemas/auth';

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'bulldog', label: 'Bulldog (College)' },
  { value: 'bullpup', label: 'Bullpup (Senior High)' },
];

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  if (isAuthenticated) return <Navigate to="/home" replace />;

  return (
    <AuthLayout
      title="Join Campus Connect"
      subtitle="Create your KabeleNU account in a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-nu-gold hover:underline">
            Log in
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
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Select
          label="I am a"
          placeholder="Select one"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="gold" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
