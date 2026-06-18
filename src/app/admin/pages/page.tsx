'use client';

import { useState, useEffect, useCallback } from 'react';

interface ContentBlock {
  id: string;
  type: string;
  title: string | null;
  config: any;
  position: number;
  isActive: boolean;
}

const BLOCK_TYPES = [
  { value: 'banner', label: 'Banner' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'category_grid', label: 'Category Grid' },
  { value: 'text_block', label: 'Text Block' },
  { value: 'deal_section', label: 'Deal Section' },
];

export default function AdminPagesBuilder() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('banner');
  const [newTitle, setNewTitle] = useState('');
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

  const fetchBlocks = useCallback(async () => {
    const res = await fetch('/api/content-blocks');
    const data = await res.json();
    setBlocks(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const addBlock = async () => {
    const config: any = {};
    if (newType === 'banner') {
      config.imageUrl = '';
      config.linkUrl = '';
      config.altText = newTitle || 'Banner';
    }
    await fetch('/api/content-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newType, title: newTitle || null, config }),
    });
    setNewTitle('');
    fetchBlocks();
  };

  const toggleBlock = async (block: ContentBlock) => {
    await fetch('/api/content-blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: block.id, isActive: !block.isActive }),
    });
    fetchBlocks();
  };

  const deleteBlock = async (id: string) => {
    await fetch(`/api/content-blocks?id=${id}`, { method: 'DELETE' });
    fetchBlocks();
  };

  const moveBlock = async (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= newBlocks.length) return;
    const items = newBlocks.map((b, i) => ({
      id: b.id,
      position: i === index ? newBlocks[swap].position : i === swap ? newBlocks[index].position : b.position,
    }));
    await fetch('/api/content-blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: true, items }),
    });
    fetchBlocks();
  };

  const saveConfig = async () => {
    if (!editingBlock) return;
    await fetch('/api/content-blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingBlock.id, config: editingBlock.config, title: editingBlock.title }),
    });
    setEditingBlock(null);
    fetchBlocks();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Page Builder - Content Blocks</h1>

      {/* Add Block */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={newType} onChange={e => setNewType(e.target.value)} className="border rounded px-3 py-2">
            {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Optional title" />
        </div>
        <button onClick={addBlock} className="bg-amazon-orange text-white px-4 py-2 rounded hover:bg-orange-500">Add Block</button>
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={block.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${block.isActive ? 'border-green-500' : 'border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveBlock(i, 'up')} className="text-xs hover:text-blue-600" disabled={i === 0}>▲</button>
                  <button onClick={() => moveBlock(i, 'down')} className="text-xs hover:text-blue-600" disabled={i === blocks.length - 1}>▼</button>
                </div>
                <div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{block.type}</span>
                  <span className="ml-2 font-medium">{block.title || '(untitled)'}</span>
                  <span className="ml-2 text-xs text-gray-400">#{block.position}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingBlock({ ...block })} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => toggleBlock(block)} className={`text-sm ${block.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {block.isActive ? '● Active' : '○ Inactive'}
                </button>
                <button onClick={() => deleteBlock(block.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Edit Block: {editingBlock.type}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={editingBlock.title || ''} onChange={e => setEditingBlock({ ...editingBlock, title: e.target.value })} className="border rounded px-3 py-2 w-full" />
              </div>
              {editingBlock.type === 'banner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input value={editingBlock.config.imageUrl || ''} onChange={e => setEditingBlock({ ...editingBlock, config: { ...editingBlock.config, imageUrl: e.target.value } })} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input value={editingBlock.config.linkUrl || ''} onChange={e => setEditingBlock({ ...editingBlock, config: { ...editingBlock.config, linkUrl: e.target.value } })} className="border rounded px-3 py-2 w-full" />
                  </div>
                </>
              )}
              {editingBlock.type === 'text_block' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea value={editingBlock.config.content || ''} onChange={e => setEditingBlock({ ...editingBlock, config: { ...editingBlock.config, content: e.target.value } })} className="border rounded px-3 py-2 w-full h-32" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Raw Config (JSON)</label>
                <textarea value={JSON.stringify(editingBlock.config, null, 2)} onChange={e => { try { setEditingBlock({ ...editingBlock, config: JSON.parse(e.target.value) }); } catch {} }} className="border rounded px-3 py-2 w-full h-24 font-mono text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingBlock(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={saveConfig} className="px-4 py-2 bg-amazon-orange text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
