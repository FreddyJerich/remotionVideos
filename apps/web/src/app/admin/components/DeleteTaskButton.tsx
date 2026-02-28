'use client'

import { useState } from 'react'

export function DeleteTaskButton({ taskId }: { taskId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('确定要彻底删除该任务及其生成的视频吗？这是一项不可逆转的操作。')) {
            return
        }

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '删除失败')
            }
            // 删除成功后刷新页面以更新列表
            window.location.reload()
        } catch (error: any) {
            alert(error.message)
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                marginTop: 8,
                padding: '4px 12px',
                fontSize: 11,
                borderRadius: 100,
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isDeleting ? 0.5 : 1
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            }}
        >
            {isDeleting ? '删除中...' : '🗑️ 删除'}
        </button>
    )
}
