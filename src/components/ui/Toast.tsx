import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-200 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-indigo-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400',
        },
      }}
    />
  );
};