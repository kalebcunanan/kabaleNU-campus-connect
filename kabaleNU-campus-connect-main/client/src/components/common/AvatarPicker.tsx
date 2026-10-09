import type { ComponentPropsWithRef } from 'react';
import icon from '../../assets/logo/kabalenu-icon.png';

interface AvatarPickerProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  previewUrl: string | null;
  error?: string;
}

export default function AvatarPicker({ previewUrl, error, ...rest }: AvatarPickerProps) {
  return (
  <div className="flex flex-col items-center">
    <label
      htmlFor="profilePicture"
      className="relative cursor-pointer rounded-full focus-within:ring-4 focus-within:ring-nu-gold/60"
    >
      <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-nu-gold bg-nu-blue/10">
        <img
          src={previewUrl ?? icon}
          alt=""
          className={previewUrl ? 'h-full w-full object-cover' : 'h-20 w-20'}
        />
      </span>
      <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-nu-gold text-nu-blue shadow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <input id="profilePicture" type="file" accept="image/*" className="sr-only" {...rest} />
    </label>
    <p className="mt-2 text-sm text-gray-600">
      {previewUrl ? 'Tap to change your photo' : 'Add a profile picture (optional)'}
    </p>
    {error && (
      <p role="alert" className="mt-1 text-sm text-red-700">
        {error}
      </p>
    )}
  </div>
  );
}
