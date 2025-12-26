import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatButtonProps {
    userId: number;
    userName?: string;
    variant?: 'icon' | 'full';
    className?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
    userId,
    userName = '用户',
    variant = 'icon',
    className = ''
}) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/chat/${userId}`);
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleClick}
                className={`flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors ${className}`}
            >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">私信</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`text-gray-400 hover:text-primary-500 transition-colors p-1.5 rounded-full hover:bg-primary-50 ${className}`}
            title={`私信 ${userName}`}
        >
            <MessageSquare size={20} />
        </button>
    );
};
