export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center" role="status">
      <div
        className={`${sizes[size]} rounded-full border-teal-200 border-t-teal-600 animate-spin`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
