"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
    return (
        <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-15 h-15 rounded-lg overflow-hidden">
                        <Image
                            src="/images/logo.png"
                            alt="Nano Banana Logo"
                            width={60}
                            height={60}
                            className="object-cover"
                            unoptimized={true}
                        />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        Nano Banana X
                    </span>
                </Link>
                <nav className="hidden md:flex space-x-8">
                    <Link href="https://ghibli.xlap.top" target='_blank' className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                        GhibliX
                    </Link>
                    <Link href="https://sora.xlap.top" target='_blank' className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                        SoraX
                    </Link>
                    <Link href="https://api.xlap.top" target='_blank' className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                        X API
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;