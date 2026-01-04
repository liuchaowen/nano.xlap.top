import React, { useState } from 'react';
import Image from 'next/image';
import CaseGenerator from './CaseGenerator';

interface UserCaseProps {
    image: string;        // 效果图URL
    originalImage: string; // 原图URL
    title: string;        // 案例标题
    prompt: string;       // 提示词
    desc: string;         // 描述文本
}

const UserCase: React.FC<UserCaseProps> = ({ image, originalImage, title, prompt, desc }) => {
    const [showCaseGenerator, setShowCaseGenerator] = useState(false);

    const handleClick = () => {
        setShowCaseGenerator(true);
    };

    const handleClose = () => {
        setShowCaseGenerator(false);
    };

    return (
        <>
            <div
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={handleClick}
            >
                {/* 效果图 - 正方形圆角图片 */}
                <div className="aspect-square w-full overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 底层浮层 - 在图片底部显示 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center">
                        {/* 浮层左侧 - 小正方形（原图） */}
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-white/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={originalImage}
                                alt={`${title} 原图`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 浮层右侧 - 案例标题 */}
                        <div className="ml-3 text-white flex items-center">
                            <h3 className="font-medium text-sm md:text-base truncate">{title}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 案例生成器弹出层 */}
            {showCaseGenerator && (
                <CaseGenerator
                    title={title}
                    prompt={prompt}
                    desc={desc}
                    originalImage={originalImage}
                    onClose={handleClose}
                />
            )}
        </>
    );
};

export default UserCase;