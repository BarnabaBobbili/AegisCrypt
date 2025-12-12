import React from 'react';
import clsx from 'clsx';

const Card = ({ children, title, className = '', glass = false }) => {
    return (
        <div
            className={clsx(
                'rounded-xl p-6',
                glass
                    ? 'bg-white/80 backdrop-blur border border-gray-200'
                    : 'bg-white border border-gray-200 shadow-sm',
                className
            )}
        >
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            )}
            {children}
        </div>
    );
};

export default Card;
