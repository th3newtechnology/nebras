import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  decorated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, decorated = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 relative overflow-hidden transition-all duration-200',
          decorated && 'border-t-4 border-t-islamic-700',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
