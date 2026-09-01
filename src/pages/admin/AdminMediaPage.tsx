import { useState, useRef } from 'react';
import { getMedia, saveMedia, deleteMedia } from '@/lib/storage';
import { MediaFile } from '@/types';
import { Upload, Trash2, Search, FolderOpen, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_FOLDERS = ['عام', 'أعمال', 'خدمات', 'ملف شخصي'];

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaFile[]>(getMedia());
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('الكل');
  const [newFolder, setNewFolder] = useState('');
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setMedia(getMedia());

  const filtered = media.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchFolder = folder === 'الكل' || m.folder === folder;
    return matchSearch && matchFolder;
  });

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const mf: MediaFile = {
        id: `media-${Date.now()}-${Math.random()}`,
        name: file.name,
        url,
        folder: folder === 'الكل' ? 'عام' : folder,
        dateAdded: new Date().toISOString(),
        size: file.size,
      };
      saveMedia(mf);
    });
    refresh();
    toast.success(`تم رفع ${files.length} ملف`);
  };

  const handleDelete = (id: string) => {
    deleteMedia(id);
    refresh();
    if (selected?.id === id) setSelected(null);
    toast.success('تم الحذف');
  };

  const addFolder = () => {
    if (!newFolder.trim() || folders.includes(newFolder.trim())) return;
    setFolders(f => [...f, newFolder.trim()]);
    setNewFolder('');
    toast.success('تم إنشاء المجلد');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">مكتبة الوسائط</h1>
          <p className="text-sm text-gray-400">{media.length} ملف</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleUpload(e.target.files)} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium">
            <Upload size={16} /> رفع صور
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 space-y-1">
          <button onClick={() => setFolder('الكل')} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${folder === 'الكل' ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
            الكل ({media.length})
          </button>
          {folders.map(f => (
            <button key={f} onClick={() => setFolder(f)} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${folder === f ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
              <FolderOpen size={14} />
              <span className="truncate">{f}</span>
            </button>
          ))}
          <div className="flex gap-1 mt-2">
            <input value={newFolder} onChange={e => setNewFolder(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFolder()} placeholder="مجلد جديد..." className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-200 text-xs focus:outline-none" />
            <button onClick={addFolder} className="px-2 py-1.5 rounded-lg bg-gray-700 text-gray-400 hover:text-gray-200 text-xs">+</button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-8 pl-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/60" />
          </div>

          {/* Drag Drop Zone */}
          <div
            className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-amber-500/40 transition-colors cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className="text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">اسحب وأفلت الصور هنا أو انقر للاختيار</p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">لا توجد ملفات</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(file => (
                <div
                  key={file.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-amber-500/40 cursor-pointer transition-colors"
                  onClick={() => setSelected(file)}
                >
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={e => { e.stopPropagation(); copyUrl(file.url); }} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><Copy size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(file.id); }} className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-800 rounded-2xl p-5 max-w-sm w-full border border-gray-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-100 font-medium text-sm truncate">{selected.name}</h3>
              <button onClick={() => setSelected(null)}><X size={16} className="text-gray-400" /></button>
            </div>
            <img src={selected.url} alt={selected.name} className="w-full max-h-48 object-contain rounded-xl bg-gray-900" />
            <div className="space-y-1 text-xs">
              <div className="flex gap-2"><span className="text-gray-500">المجلد:</span><span className="text-gray-300">{selected.folder}</span></div>
              {selected.size && <div className="flex gap-2"><span className="text-gray-500">الحجم:</span><span className="text-gray-300">{formatSize(selected.size)}</span></div>}
              <div className="flex gap-2"><span className="text-gray-500">التاريخ:</span><span className="text-gray-300">{new Date(selected.dateAdded).toLocaleDateString('ar-LY')}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { copyUrl(selected.url); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-700 text-gray-300 text-xs hover:text-gray-100"><Copy size={12} /> نسخ الرابط</button>
              <button onClick={() => handleDelete(selected.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-900/40 text-red-400 text-xs hover:bg-red-900/60"><Trash2 size={12} /> حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
