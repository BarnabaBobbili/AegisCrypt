import React from 'react';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
            <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
            {text && <p className="mt-4 text-slate-400">{text}</p>}
        </div>
    );
};

export default Loading;
