'use client';

import type { Friend } from '@/types/friend';

interface FriendSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFriend: (friend: Friend) => void;
  availableFriends: Friend[];
  selectedFriend?: Friend | null;
}

export const FriendSelectionModal = ({
  isOpen,
  onClose,
  onSelectFriend,
  availableFriends,
  selectedFriend,
}: FriendSelectionModalProps) => {
  if (!isOpen) return null;

  const handleSelectFriend = (friend: Friend) => {
    onSelectFriend(friend);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h2 className="text-xl font-semibold">
            🤖 대화할 친구를 선택해주세요
          </h2>
          <p className="text-blue-100 text-sm mt-1">누구와 대화하고 싶나요?</p>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {availableFriends.map(friend => (
              <div
                key={friend.id}
                onClick={() => handleSelectFriend(friend)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  hover:shadow-md hover:scale-[1.02]
                  ${
                    selectedFriend?.id === friend.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {friend.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {friend.name}
                      </h3>
                      {selectedFriend?.id === friend.id && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          선택됨
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {friend.description}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Bot ID: {friend.id}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedFriend?.id === friend.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }
                  `}
                  >
                    {selectedFriend?.id === friend.id && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedFriend
                ? `${selectedFriend.name}와 대화하기`
                : '친구를 선택해주세요'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
