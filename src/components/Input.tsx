interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
