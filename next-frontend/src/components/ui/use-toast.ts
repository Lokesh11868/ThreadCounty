import { toast as sonnerToast } from 'sonner';

export const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
  if (variant === 'destructive') {
    sonnerToast.error(title || 'Error', { description });
  } else {
    sonnerToast.success(title || 'Success', { description });
  }
};

export function useToast() {
  return {
    toast
  };
}
