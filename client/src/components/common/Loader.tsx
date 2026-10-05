interface LoaderProps {
  label?: string;
}

export default function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-nu-blue">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-nu-blue/20 border-t-nu-gold" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
