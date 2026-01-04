"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
    const [showQRCode, setShowQRCode] = useState(false); // 控制二维码显示
    const contactRef = useRef<HTMLSpanElement>(null); // 联系我元素的引用
    return (
        <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 flex items-center">
                        <div className="relative">© 2025 Nano Banana X. 如有疑问请
                            <span
                                ref={contactRef}
                                className="ml-1 cursor-pointer hover:text-white hover:underline"
                                onMouseEnter={() => setShowQRCode(true)}
                                onMouseLeave={() => setShowQRCode(false)}
                            >
                                [联系我]
                            </span>

                            {/* 二维码弹出层 */}
                            {showQRCode && (
                                <div
                                    className="absolute bg-white p-3 rounded-lg shadow-lg z-50"
                                    style={{
                                        bottom: '100%',
                                        right: '0',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <Image
                                        src="/images/qrcode.png"
                                        alt="联系二维码"
                                        width={150}
                                        height={150}
                                        className="rounded"
                                    />
                                    <div className="absolute right-4 bottom-0 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-6">
                        <a
                            target="_blank"
                            href="https://aitools.uno"
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="AI工具集导航"
                        >
                            AI TOOLS
                        </a>
                        <a
                            target="_blank"
                            href="https://aiseo.one"
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="使用条款"
                        >
                            AI SEO
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;