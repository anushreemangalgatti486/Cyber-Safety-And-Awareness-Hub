import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Input = forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative group w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted group-focus-within:text-cyber-primary transition-colors z-10">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-cyber-panel/50 border border-cyber-primary/20 rounded-md py-2 px-4 text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all",
          Icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
