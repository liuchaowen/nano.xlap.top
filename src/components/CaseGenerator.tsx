"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { editImage } from '../services/api';

interface CaseGeneratorProps {
    title: string;
    prompt: string;
    desc: string;
    originalImage: string;
    onClose: () => void;
}

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

const CaseGenerator: React.FC<CaseGeneratorProps> = ({ title, prompt, desc, originalImage, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const [model, setModel] = useState('nano-banana');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    // 显示toast消息
    const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
        setToastMessage(message);
        setToastVisible(true);
    };

    // 关闭toast
    const closeToast = () => {
        setToastVisible(false);
    };

    // 处理图片上传
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

    // 处理上传按钮点击
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    // 处理拖放
    useEffect(() => {
        const dropArea = dropAreaRef.current;
        if (!dropArea) return;

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('border-yellow-500');
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('border-yellow-500');
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('border-yellow-500');

            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];

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
            }
        };

        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);

        return () => {
            dropArea.removeEventListener('dragover', handleDragOver);
            dropArea.removeEventListener('dragleave', handleDragLeave);
            dropArea.removeEventListener('drop', handleDrop);
        };
    }, []);

    // 处理生成图片
    const handleGenerateImage = async () => {
        if (!uploadedImage) {
            setError('请先上传图片');
            showToast('请先上传图片');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // 使用 UserCase 中的 prompt 和上传的图片调用 API
            const imageUrl = await editImage(prompt, uploadedImage, model);
            setResultImageUrl(imageUrl);
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
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
            <Toast
                message={toastMessage}
                isVisible={toastVisible}
                type="error"
                onClose={closeToast}
            />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* 返回按钮 */}
                <div className="mb-8">
                    <button
                        onClick={onClose}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        返回主页
                    </button>
                </div>

                {/* 案例标题 */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h1>

                {/* 案例说明 */}
                <div className="mb-8 prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                        {desc}
                    </p>
                </div>

                {/* 图片上传与结果显示区域 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 左侧 - 图片上传区域 */}
                    <div className="flex flex-col">
                        <div
                            ref={dropAreaRef}
                            className="w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors bg-gray-50 dark:bg-gray-800"
                            onClick={handleUploadButtonClick}
                        >
                            {uploadedImagePreview ? (
                                <div className="relative w-full h-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={uploadedImagePreview}
                                        alt="上传的图片"
                                        className="w-full h-full object-contain rounded-lg"
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Image
                                        src="/upload-image.svg"
                                        alt="上传图片"
                                        width={48}
                                        height={48}
                                        className="text-gray-400 dark:text-gray-600 mb-4"
                                    />
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            点击或拖放图片到此处
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            支持 JPG, PNG, GIF 等格式
                                        </p>
                                    </div>
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

                        {/* 模型选择和生成按钮 */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">模型:</span>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="px-2 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                >
                                    <option value="nano-banana">nano-banana</option>
                                    <option value="nano-banana-hd">nano-banana-hd</option>
                                </select>
                            </div>
                            <button
                                onClick={handleGenerateImage}
                                disabled={isLoading || !uploadedImage}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg shadow-sm hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                                        </svg>
                                        生成图片
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 右侧 - 结果显示区域 */}
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : resultImageUrl ? (
                            <div className="w-full">
                                <div className="aspect-square w-full rounded-lg overflow-hidden shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={resultImageUrl}
                                        alt="生成的图片"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => window.open(resultImageUrl, '_blank')}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        查看原图
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <Image
                                    src="/upload-image.svg"
                                    alt="上传图片"
                                    width={48}
                                    height={48}
                                    className="text-gray-400 dark:text-gray-600 mb-4"
                                />
                                <p>上传图片后点击生成按钮查看结果</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseGenerator;