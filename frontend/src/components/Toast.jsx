import { useApp } from '../context/AppContext';

const Toast = () => {
    const { toasts } = useApp();

    const typeStyles = {
        success: 'bg-emerald-600 text-white',
        info: 'bg-blue-600 text-white',
        warning: 'bg-amber-500 text-white',
        danger: 'bg-rose-600 text-white',
    };

    const typeIcons = {
        success: 'check_circle',
        info: 'info',
        warning: 'warning',
        danger: 'error',
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-8 z-[100] space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl pointer-events-auto animate-slide-in ${typeStyles[toast.type] || typeStyles.success}`}
                    style={{ animation: 'slideIn 0.3s ease-out, fadeOut 0.5s ease-in 3.5s forwards' }}
                >
                    <span className="material-icons text-lg">{typeIcons[toast.type] || 'check_circle'}</span>
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default Toast;
