'use client';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return '오늘';
    } else if (isYesterday) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex-1 border-t border-gray-200"></div>
      <span className="px-4 text-sm text-gray-500 bg-gray-50 rounded-full border border-gray-200">
        {formatDate(date)}
      </span>
      <div className="flex-1 border-t border-gray-200"></div>
    </div>
  );
};
