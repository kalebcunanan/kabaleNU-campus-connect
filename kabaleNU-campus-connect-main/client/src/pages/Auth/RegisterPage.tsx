import { useState } from 'react';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate } from 'react-router-dom';
import defaultAvatar from '../../assets/avatar/default-avatar.png';
import AvatarPicker from '../../components/common/AvatarPicker';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import PasswordInput from '../../components/common/PasswordInput';
import Select from '../../components/common/Select';
import type { SelectOption } from '../../components/common/Select';
import AuthLayout from '../../components/layout/AuthLayout';
import { PROGRAMS_BY_ROLE } from '../../constants/programs';
import { useAuth } from '../../hooks/useAuth';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useWelcomeSubmit } from '../../hooks/useWelcomeSubmit';
import { getErrorMessage } from '../../lib/axios';
import { registerSchema } from '../../schemas/auth';
import type { RegisterFormValues } from '../../schemas/auth';

type RegisterStep = 1 | 2;

const STEPS: RegisterStep[] = [1, 2];
const STEP_ONE_FIELDS: (keyof RegisterFormValues)[] = ['name', 'email', 'password', 'confirmPassword'];

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'bulldog', label: 'Bulldog (College)' },
  { value: 'bullpup', label: 'Bullpup (Senior High)' },
];

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<RegisterStep>(1);
  const { run, isPending, isLeaving } = useWelcomeSubmit('register', '/home');

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  // Program options and the photo preview are derived from form values during render.
  const selectedRole = watch('role');
  const programOptions: SelectOption[] = selectedRole ? PROGRAMS_BY_ROLE[selectedRole] : [];
  const previewUrl = useObjectUrl(watch('profilePicture')?.[0]);

  const goNext = async (): Promise<void> => {
    if (await trigger(STEP_ONE_FIELDS)) setStep(2);
  };

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('role', values.role);
    formData.append('program', values.program);
    if (values.profilePicture && values.profilePicture.length > 0) {
      formData.append('profilePicture', values.profilePicture[0]);
    }

    try {
      await run(() => registerUser(formData));
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  // Pressing Enter on step one moves forward instead of submitting the whole form.
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    if (step === 1) {
      event.preventDefault();
      void goNext();
      return;
    }
    void handleSubmit(onSubmit)(event);
  };

  if (isLoading) return <Loader label="Checking your session..." />;
  if (isAuthenticated && !isPending) return <Navigate to="/home" replace />;

  return (
    <AuthLayout
      isLeaving={isLeaving}
      title="Join the pack"
      subtitle={step === 1 ? 'Create your KabaleNU account in a minute.' : 'Almost there. Tell us who you are.'}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-nu-gold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="mb-5">
        <div className="flex gap-2">
          {STEPS.map((number) => (
            <span
              key={number}
              className={`h-1.5 flex-1 rounded-full transition-colors ${number <= step ? 'bg-nu-gold' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-gray-500">
          Step {step} of 2: {step === 1 ? 'Your account' : 'Your campus profile'}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
        {errors.root?.server && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.root.server.message}
          </p>
        )}

        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="button" variant="primary" onClick={goNext} className="w-full">
            Next
          </Button>
        </div>

        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
          <AvatarPicker previewUrl={previewUrl || defaultAvatar} error={errors.profilePicture?.message} {...register('profilePicture')} />
          <Select
            label="I am a"
            placeholder="Select one"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register('role', { onChange: () => setValue('program', '') })}
          />
          <Select
            label="Academic program"
            placeholder={selectedRole ? 'Select your program' : 'Select your student type first'}
            options={programOptions}
            disabled={!selectedRole}
            error={errors.program?.message}
            {...register('program')}
          />
          <Button type="submit" variant="gold" isLoading={isSubmitting || isPending} className="w-full">
            Create account
          </Button>
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
            Back
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
