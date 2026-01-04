"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface BananaProps {
    top: number;
    left: number;
    rotation: number;
    size: number;
    opacity: number;
}

const BananaBackground: React.FC = () => {
    const [bananas, setBananas] = useState<BananaProps[]>([]);
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    // 处理窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // 添加事件监听器
        window.addEventListener('resize', handleResize);

        // 初始调用一次以确保正确的尺寸
        handleResize();

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 生成香蕉元素
    useEffect(() => {
        if (windowSize.width === 0 || windowSize.height === 0) return;

        const bananasArray: BananaProps[] = [];
        const bananaSize = 80; // 香蕉图像的基本大小
        const spacing = 100; // 香蕉之间的间隔

        // 计算需要多少行和列来填充屏幕
        const columns = Math.ceil(windowSize.width / (bananaSize + spacing));
        const rows = Math.ceil(windowSize.height / (bananaSize + spacing));

        // 生成香蕉网格，每个香蕉有随机旋转角度
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                // 添加一些随机偏移，使香蕉分布更自然
                const offsetX = Math.random() * spacing - spacing / 2;
                const offsetY = Math.random() * spacing - spacing / 2;

                // 计算香蕉位置
                const left = col * (bananaSize + spacing) + offsetX;
                const top = row * (bananaSize + spacing) + offsetY;

                // 随机旋转角度 (0-360度)
                const rotation = Math.random() * 360;

                // 随机大小变化 (70%-100%)
                const sizeVariation = 0.7 + Math.random() * 0.3;
                const size = bananaSize * sizeVariation;

                bananasArray.push({
                    top,
                    left,
                    rotation,
                    size,
                    opacity: 0.2, // 固定透明度为0.3
                });
            }
        }

        setBananas(bananasArray);
    }, [windowSize]);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {bananas.map((banana, index) => (
                <div
                    key={index}
                    style={{
                        position: 'fixed',
                        top: `${banana.top + 120}px`,
                        left: `${banana.left}px`,
                        transform: `rotate(${banana.rotation}deg)`,
                        width: `${banana.size}px`,
                        height: `${banana.size}px`,
                        opacity: banana.opacity,
                    }}
                >
                    <img
                        src="/images/logo.png"
                        alt="Banana"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default BananaBackground;