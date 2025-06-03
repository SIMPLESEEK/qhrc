'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface HolidayLegendProps {
  className?: string;
}

export default function HolidayLegend({ className = '' }: HolidayLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = [
    {
      type: 'mainland',
      color: 'bg-red-50 border-red-200 text-red-600',
      label: '中国节假日',
      examples: '春节、国庆节、劳动节、元宵节、七夕节等'
    },
    {
      type: 'international',
      color: 'bg-purple-50 border-purple-200 text-purple-600',
      label: '国际节假日',
      examples: '香港回归日、佛诞、圣诞节、复活节等'
    },
    {
      type: 'custom',
      color: 'bg-orange-50 border-orange-200 text-orange-600',
      label: '自定义节假日',
      examples: '校庆日、机构纪念日等'
    },
    {
      type: 'workday',
      color: 'bg-green-50 border-green-200 text-green-600',
      label: '调休工作日',
      examples: '节假日调休的工作日'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        title="节假日图例"
      >
        <InformationCircleIcon className="h-4 w-4" />
        <span>节假日图例</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-3">节假日类型说明</h3>

          <div className="space-y-3">
            {legendItems.map((item) => (
              <div key={item.type} className="flex items-start space-x-3">
                <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.examples}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="mb-1">
                <strong>说明：</strong>
              </p>
              <ul className="space-y-1 ml-2">
                <li>• 日期格子会根据节假日类型显示不同的背景色</li>
                <li>• 节假日名称显示在日期下方</li>
                <li>• 调休工作日显示为&ldquo;班&rdquo;字</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
