
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#020617] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] border-t border-white/10",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    outline: "border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
    danger: "bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest",
    md: "px-6 py-3 text-xs uppercase tracking-widest",
    lg: "px-8 py-4 text-sm uppercase tracking-widest"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2.5">{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
