"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { generateImage, editImage, setApiKey } from '../services/api';
import UserCase from './UserCase';
import useCaseData from '../../public/data/usecase.json';

// 本地存储的key
const STORAGE_KEY = 'nano_banana_x_key';

// Toast 组件
interface ToastProps {
    message: string;
    isVisible: boolean;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'error', onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // 3秒后自动关闭
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const bgColor = type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
            'bg-blue-500';

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`}>
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

import BananaBackground from './BananaBackground';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('4:3'); // 默认选中第一个选项
    const [model, setModel] = useState('nano-banana'); // 默认选择nano-banana模型
    const [xKey, setXKey] = useState('');
    const [isValidKey, setIsValidKey] = useState(false);
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ossHost = "https://xlaptop.oss-cn-hongkong.aliyuncs.com/nano-banana/"

    // 显示toast消息
    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
    };

    // 关闭toast
    const closeToast = () => {
        setToastVisible(false);
    };

    // 验证X key格式
    const validateXKey = (key: string) => {
        const isValid = key.startsWith('sk-') && key.length === 51;
        setIsValidKey(isValid);
        return isValid;
    };

    // 从本地存储加载X key
    useEffect(() => {
        const savedKey = localStorage.getItem(STORAGE_KEY);
        if (savedKey) {
            setXKey(savedKey);
            if (validateXKey(savedKey)) {
                // 如果有有效的X key，设置到API中
                setApiKey(savedKey);
            }
        }
    }, []);

    // 当X key变化时验证
    useEffect(() => {
        if (xKey) {
            validateXKey(xKey);
        } else {
            setIsValidKey(false);
        }
    }, [xKey]);

    // 保存有效的X key到本地存储
    const saveXKeyToStorage = (key: string) => {
        if (validateXKey(key)) {
            localStorage.setItem(STORAGE_KEY, key);
            setApiKey(key);
        }
    };

    // 检查并保存X key
    const checkAndSaveXKey = () => {
        // 检查X key是否有效
        if (xKey && !isValidKey) {
            setError('X key格式不正确，请检查');
            showToast('X key格式不正确，请检查');
            return false;
        }

        // 如果有有效的X key，设置到API中并保存到本地存储
        if (xKey && isValidKey) {
            saveXKeyToStorage(xKey);
            return true;
        }

        return true;
    };

    // 清除X key
    const clearXKey = () => {
        setXKey('');
        setIsValidKey(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            setError('请上传图片文件');
            showToast('请上传图片文件');
            return;
        }

        setUploadedImage(file);

        // 创建预览URL
        const previewUrl = URL.createObjectURL(file);
        setUploadedImagePreview(previewUrl);

        // 清除任何之前的错误
        setError('');
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!xKey.trim()) {
            setError('请输入X Key');
            showToast('请输入X Key');
            return;
        }

        // 使用抽离出来的函数检查X key
        if (!checkAndSaveXKey()) {
            return;
        }

        if (!prompt.trim()) {
            setError('请输入提示词');
            showToast('请输入提示词');
            return;
        }
        try {
            setIsLoading(true);
            setError('');

            let imageUrl;
            if (uploadedImage) {
                // 如果上传了图片，使用图生图接口
                imageUrl = await editImage(prompt, uploadedImage, model);
            } else {
                // 否则使用文生图接口
                imageUrl = await generateImage(prompt, aspectRatio, model);
            }
            setImageUrl(imageUrl);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '生成图片失败，请稍后再试';
            setError(errorMessage);
            showToast(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* 添加香蕉背景组件 */}
            <BananaBackground />

            <Toast
                message={toastMessage}
                isVisible={toastVisible}
                type="error"
                onClose={closeToast}
            />
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Nano Banana X 纳米香蕉
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                    第三方AI中转站 <a target="_blank" href="https://api.xlap.top"><b>X API</b></a>，便宜实惠，<b>￥0.12</b><small>/次</small>，HD模型<b>￥0.18</b><small>/次</small>。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-4">
                    {/* 图片上传区域 - 调整尺寸使其与右侧输入框等高 */}
                    <div
                        className="w-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors"
                        onClick={handleUploadButtonClick}
                    >
                        {uploadedImagePreview ? (
                            <div className="relative w-full h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={uploadedImagePreview}
                                    alt="上传的图片"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUploadedImage(null);
                                            setUploadedImagePreview(null);
                                        }}
                                        className="text-white p-2 rounded-full hover:bg-gray-800"
                                    >
                                        <Image
                                            src="/upload-image.svg"
                                            alt="移除图片"
                                            width={24}
                                            height={24}
                                            className="text-yellow-500 hover:border-yellow-500 dark:hover:border-yellow-500"
                                        />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Image
                                    src="/upload-image.svg"
                                    alt="上传图片"
                                    width={24}
                                    height={24}
                                    className="bg-transparent dark:bg-gray-500 mb-2 hover:bg-yellow-500 dark:hover:bg-yellow-500"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 text-center hover:text-yellow-500 dark:hover:text-yellow-500">添加参考图片</span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {/* 提示词输入区域 */}
                    <div className="flex-grow relative flex flex-col">
                        {/* X key输入框 */}
                        <div className="relative w-full mb-2 flex items-center">
                            <input
                                type="text"
                                value={xKey}
                                onChange={(e) => setXKey(e.target.value)}
                                onBlur={checkAndSaveXKey}
                                placeholder="输入第三方的X Key (以sk-开头)"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <div className="absolute right-3 flex items-center space-x-2">
                                {xKey && (
                                    <button
                                        type="button"
                                        onClick={clearXKey}
                                        className="text-gray-500 hover:text-red-500"
                                        title="清除X Key"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                                {xKey ? (
                                    isValidKey ? (
                                        <div className="text-green-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center space-x-1">
                                        <a
                                            href="https://api.xlap.top"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            获取
                                        </a>
                                        <div className="relative">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-help text-gray-400 hover:text-gray-600 hover:border-gray-600"
                                                onMouseEnter={() => setShowHelpTooltip(true)}
                                                onMouseLeave={() => setShowHelpTooltip(false)}
                                            >
                                                <span className="text-xs font-bold">?</span>
                                            </div>
                                            {showHelpTooltip && (
                                                <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                                                    <div className="whitespace-pre-line">
                                                        1、注册登录X API平台{'\n'}2、添加令牌，自定义名称，default分组{'\n'}3、充值余额，复制key至左侧
                                                    </div>
                                                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative w-full">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="输入提示词，例如：一只可爱的猫咪在阳光下玩耍"
                                className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full shadow-sm hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                aria-label="生成图片"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Image
                                        src="/send-plane.svg"
                                        alt="发送"
                                        width={20}
                                        height={20}
                                        className="text-white"
                                    />
                                )}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 justify-between">
                            {/* 尺寸比例选择 - 仅在未上传图片时显示 */}
                            {!uploadedImage && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 self-center">尺寸比例:</span>
                                    {["4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "1:1", "1:2"].map((ratio) => (
                                        <button
                                            key={ratio}
                                            type="button"
                                            onClick={() => setAspectRatio(ratio)}
                                            className={`px-2 py-1 text-xs rounded-md ${aspectRatio === ratio
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* 模型选择 - 始终显示 */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">模型:</span>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                >
                                    <option value="nano-banana">nano-banana</option>
                                    <option value="nano-banana-hd">nano-banana-hd</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div className="mt-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                ) : imageUrl ? (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="生成的图片"
                                className="w-full"
                            />
                        </div>
                        <button
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            查看原图
                        </button>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <section id="case" className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Go Banana!</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="mb-4">
                        准备好了吗？选择一个案例效果开始你的魔法吧。
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                    {useCaseData.cases.map((caseItem, index) => (
                        <UserCase
                            key={index}
                            image={ossHost + caseItem.image}
                            originalImage={ossHost + caseItem.originalImage}
                            title={caseItem.title}
                            desc={caseItem.desc}
                            prompt={caseItem.prompt}
                        />
                    ))}
                </div>
                <div className="mt-8">
                    <p className="mb-2 text-center">
                        <a target="_blank" href="https://github.com/PicoTrex/Awesome-Nano-Banana-images">[更多玩法]</a>
                    </p>
                </div>
            </section>
            <section id="pricing" className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">价格说明</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">nano-banana</h3>
                        <div className="text-3xl font-bold text-yellow-500 mb-4">￥0.12 <span className="text-sm text-gray-500 dark:text-gray-400">每次</span></div>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                标准图像质量
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                适合一般用途
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                经济实惠
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 transform rotate-0 origin-top-right">
                            高清版
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">nano-banana-hd</h3>
                        <div className="text-3xl font-bold text-yellow-500 mb-4">￥0.18 <span className="text-sm text-gray-500 dark:text-gray-400">每次</span></div>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                4K高清大图
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                更高的细节和清晰度
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                适合专业用途和打印
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section id="stament" className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">使用说明</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="mb-4">
                        使用nano-banana-hd，由于高清图片比较大，8-10MB，生成时会有点慢，请耐心等待生成图片的显示，也可点击[查看原图]直接获取图片地址。
                    </p>
                </div>
            </section>

        </div>
    );
};

export default ImageGenerator;