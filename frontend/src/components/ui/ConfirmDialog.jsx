import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useBackButtonClose from '../../hooks/useBackButtonClose';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  icon = 'alert'
}) {
  const [render, setRender] = useState(isOpen);

  useBackButtonClose(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
    } else {
      const timer = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!render) return null;

  const IconComponent = icon === 'logout' ? LogOut : icon === 'trash' ? Trash2 : AlertTriangle;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-j-ink/40 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* Dialog Box */}
      <div 
        className={`relative w-full max-w-[320px] bg-j-surface border border-j-border rounded-xl shadow-[0_16px_32px_-12px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${isDestructive ? 'bg-j-negative-dim text-j-negative' : 'bg-j-accent-dim text-j-accent'}`}>
            <IconComponent size={24} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-j-ink tracking-tight mb-2">{title}</h2>
          <p className="text-sm text-j-ink-3 leading-relaxed">{message}</p>
        </div>
        
        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-j-surface border border-j-border text-j-ink-3 text-sm font-semibold rounded-md hover:bg-j-surface-raised transition-colors duration-fast active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-md transition-colors duration-fast active:scale-[0.98] ${
              isDestructive 
                ? 'bg-j-negative text-white hover:bg-j-negative-dim' 
                : 'bg-j-ink text-j-bg hover:bg-j-ink-2'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
