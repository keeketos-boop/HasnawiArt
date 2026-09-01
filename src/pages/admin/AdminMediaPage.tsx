import { useState, useEffect, useRef } from 'react';
import { fetchMedia, saveMediaFile, deleteMediaFile, uploadArtworkImage } from '@/lib/api';
import type { MediaFile } from '@/types';
import { Upload, Trash2, Folder, Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const data = await fetchMedia();
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(e.target.files || []);
    if (!uploadFiles.length) return;
    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const url = await uploadArtworkImage(file, folder);
        await saveMediaFile({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url,
          folder,
          bucketPath: `${folder}/${file.name}`,
          dateAdded: new Date().toISOString(),
          size: file.size,
        });
      }
      toast.success(`تم رفع ${uploadFiles.length} ملف ✓`);
      load();
    } catch {
      toast.error('فشل رفع الملفات');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file: MediaFile) => {
    try {
      await deleteMediaFile(file.id, (file as MediaFile & { bucketPath?: string }).bucketPath || '');
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  };

  const folders = ['general', 'artworks', 'services', 'profile', 'categories'];
  const filtered = files.filter(f => !folder || folder === 'all' || f.folder === folder);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">مكتبة الوسائط</h1>
          <p className="text-sm text-gray-400">{files.length} ملف — جميعها محفوظة في Supabase Storage</p>
        </div>
        <div className="flex gap-2">
          <select value={folder} onChange={e => setFolder(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-gray-900 text-sm font-medium disabled:opacity-60">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            رفع صور
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['all', ...folders].map(f => (
          <button key={f} onClick={() => setFolder(f === 'all' ? '' : f)} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 flex-shrink-0 transition-all ${(!folder && f === 'all') || folder === f ? 'bg-amber-600 text-gray-900 font-medium' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'}`}>
            <Folder size={11} />{f === 'all' ? 'الكل' : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-12 text-center">
          <Image size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">لا توجد ملفات في هذا المجلد</p>
          <p className="text-gray-600 text-xs mt-1">ارفع صوراً للبدء</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(file => (
            <div key={file.id} className="relative group rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50">
              <img src={file.url} alt={file.name} className="w-full h-32 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              <div className="p-2">
                <p className="text-xs text-gray-400 truncate">{file.name}</p>
                {file.size && <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(0)} KB</p>}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(file.url); toast.success('تم نسخ الرابط'); }} className="px-2 py-1 rounded-lg bg-amber-600 text-gray-900 text-xs">نسخ</button>
                <button onClick={() => handleDelete(file)} className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
