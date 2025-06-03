import React, { memo, useCallback } from 'react';
import { TrashIcon, PencilIcon, LinkIcon } from '@heroicons/react/24/outline';
import { UserRole, ActivityLink } from '@/types';
import { hasManagementAccess, hasSuperAdminAccess } from '@/lib/permissions';

interface LinkItemProps {
  link: ActivityLink;
  userRole: UserRole;
  onEdit: (link: ActivityLink) => void;
  onDelete: (linkId: string) => void;
}

const LinkItem = memo(({
  link,
  userRole,
  onEdit,
  onDelete
}: LinkItemProps) => {
  const handleEdit = useCallback(() => {
    onEdit(link);
  }, [link, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(link.id);
  }, [link.id, onDelete]);

  const handleLinkClick = useCallback(() => {
    // 在新标签页中打开链接
    window.open(link.url, '_blank', 'noopener,noreferrer');
  }, [link.url]);

  return (
    <div className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between p-3">
        <div
          className="flex items-center space-x-3 flex-grow min-w-0 cursor-pointer hover:bg-blue-50 rounded p-2 -m-2 transition-colors"
          onClick={handleLinkClick}
        >
          <LinkIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-blue-600 truncate hover:text-blue-800">
              {link.title}
            </p>
            {link.description && (
              <p className="text-xs text-gray-500 truncate">
                {link.description}
              </p>
            )}
            <p className="text-xs text-gray-400 truncate">
              {link.url}
            </p>
          </div>
        </div>

        {hasManagementAccess(userRole) && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="编辑链接"
              type="button"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {hasSuperAdminAccess(userRole) && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="删除链接"
                type="button"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

LinkItem.displayName = 'LinkItem';

export default LinkItem;
