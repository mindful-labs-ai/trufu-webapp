'use client';

import { useFriendStore } from '@/stores/friendStore';
import { useFriendsQuery } from '@/hooks/queries/useFriendsQuery';
import type { Friend } from '@/types/friend';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { selectedFriend, selectFriend } = useFriendStore();
  const { data: availableFriends = [], isLoading } = useFriendsQuery();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-80 h-full bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Trufu</h1>
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                대화 친구들
              </h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              availableFriends.map((friend: Friend) => (
              <div
                key={friend.id}
                onClick={() => selectFriend(friend)}
                className={`
                  p-3 rounded-lg cursor-pointer border transition-all duration-200
                  hover:shadow-sm hover:scale-[1.01]
                  ${
                    selectedFriend?.id === friend.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                    ${
                      selectedFriend?.id === friend.id
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }
                  `}
                  >
                    {friend?.name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-medium text-sm line-clamp-1 ${
                          selectedFriend?.id === friend.id
                            ? 'text-blue-900'
                            : 'text-gray-800'
                        }`}
                      >
                        {friend.name}
                      </h3>
                      {selectedFriend?.id === friend.id && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                          ✓
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 line-clamp-1 ${
                        selectedFriend?.id === friend.id
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {friend.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
