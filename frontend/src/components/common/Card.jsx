import React from 'react';
import clsx from 'clsx';

const Card = ({ children, title, className = '', glass = false }) => {
    return (
        <div
            className={clsx(
                'rounded-xl p-6',
                glass ? 'glass' : 'bg-slate-800 border border-slate-700',
                className
            )}
        >
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}
            {children}
        </div>
    );
};

export default Card;
