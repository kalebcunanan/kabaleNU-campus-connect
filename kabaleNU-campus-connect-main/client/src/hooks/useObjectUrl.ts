import { useEffect, useState } from 'react';

// Creates a preview URL for a picked file and revokes it when the file changes or unmounts.
export function useObjectUrl(file: File | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return url;
}
