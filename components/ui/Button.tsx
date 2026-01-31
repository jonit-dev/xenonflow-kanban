import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyles = "relative overflow-hidden uppercase tracking-[0.2em] text-[10px] font-black py-2.5 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-md";

  const variants = {
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:border-cyan-400",
    secondary: "bg-purple-500/10 text-purple-400 border border-purple-500/40 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:border-purple-400",
    danger: "bg-rose-500/10 text-rose-500 border border-rose-500/40 hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:border-rose-400",
    ghost: "bg-transparent text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/5"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Glint effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

      {isLoading && (
        <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
