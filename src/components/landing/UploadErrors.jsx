import { AlertCircle } from 'lucide-react';

export default function UploadErrors({ onSample }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-md px-5 text-center sm:px-8">
      <AlertCircle className="mx-auto h-8 w-8 text-[#ff6b6b]" />
      <h2 className="mt-3 text-2xl font-bold text-white">Couldn&apos;t read that file</h2>
      <button
        type="button"
        onClick={onSample}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:brightness-105"
      >
        Try the sample instead
      </button>
    </div>
  );
}