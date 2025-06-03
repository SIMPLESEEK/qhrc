import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onLoad?: (aspectRatio: number) => void;
  placeholder?: React.ReactNode;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  onClick,
  onLoad,
  placeholder
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 Intersection Observer 实现懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 处理图片加载完成
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
    setIsLoaded(true);
    setHasError(false);
    
    if (onLoad) {
      onLoad(ratio);
    }
  }, [onLoad]);

  // 处理图片加载错误
  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  // 获取动态样式
  const getImageStyle = useCallback(() => {
    if (!aspectRatio) {
      return "w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity";
    }

    // 竖版图片
    if (aspectRatio < 0.8) {
      return "w-auto h-40 max-w-full mx-auto object-contain rounded cursor-pointer hover:opacity-80 transition-opacity";
    }
    // 方形或横版图片
    else {
      return "w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity";
    }
  }, [aspectRatio]);

  return (
    <div ref={containerRef} className="relative">
      {!isInView && (
        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
          {placeholder || (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          )}
        </div>
      )}
      
      {isInView && !hasError && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            </div>
          )}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${getImageStyle()} ${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onClick={onClick}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </>
      )}
      
      {hasError && (
        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs">图片加载失败</p>
          </div>
        </div>
      )}
    </div>
  );
}
