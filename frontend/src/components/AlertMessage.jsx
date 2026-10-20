export default function AlertMessage({
    type = 'error',
    children
    }) {
    const styles = type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-red-200 bg-red-50 text-red-800';

    return (
        <div
        role={type === 'error' ? 'alert' : 'status'}
        className={`rounded-xl border px-4 py-3 text-sm ${styles}`}
        >
        {children}
        </div>
    );
}