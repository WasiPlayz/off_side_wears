import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              {toast.type === 'success' && <span className="toast-icon">✓</span>}
              {toast.type === 'error' && <span className="toast-icon">!</span>}
              <span className="toast-message">{toast.message}</span>
            </div>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          pointer-events: none;
        }

        .toast {
          pointer-events: auto;
          min-width: 300px;
          max-width: 450px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          color: #fff;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-family: var(--font-display, 'Montserrat', sans-serif);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          background: var(--accent-color);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .toast-error .toast-icon {
          background: #ef4444;
        }

        .toast-success {
          border-left: 4px solid var(--accent-color);
        }

        .toast-error {
          border-left: 4px solid #ef4444;
        }

        .toast-message {
          text-transform: uppercase;
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 100%;
          background: var(--accent-color);
          opacity: 0.3;
          animation: progress 4s linear forwards;
        }

        .toast-error .toast-progress {
          background: #ef4444;
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        @media (max-width: 480px) {
          .toast-container {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
          }
          .toast {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
