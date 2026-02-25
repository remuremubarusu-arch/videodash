import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Calendar, Clock, DollarSign, Tag, Type, X, Trash2 } from 'lucide-react';

export function ProjectForm({ onSuccess, onCancel, initialDeliveryDate, initialData = null, isModal = false }) {
    const { projects, addProject, editProject, deleteProject } = useProjects();
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState(
        initialData || {
            title: '',
            category: '編集',
            price: '',
            hours: '',
            deliveryDate: initialDeliveryDate || new Date().toISOString().split('T')[0],
            status: '制作中'
        }
    );

    // Sync if prop changes (e.g., calendar selection changes)
    useEffect(() => {
        if (!isEditMode && initialDeliveryDate) {
            setFormData(prev => ({ ...prev, deliveryDate: initialDeliveryDate }));
        }
    }, [initialDeliveryDate, isEditMode]);

    // ユニークな直近の案件名を抽出（オートコンプリート用）
    const recentProjectNames = useMemo(() => {
        const names = projects.map(p => p.title);
        return [...new Set(names)].slice(0, 5); // 最新のユニークな5件
    }, [projects]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.price || !formData.hours) return;

        if (isEditMode) {
            editProject(formData.id, formData);
        } else {
            addProject(formData);
        }

        if (!isModal) {
            setFormData({
                title: '',
                category: '編集',
                price: '',
                hours: '',
                deliveryDate: new Date().toISOString().split('T')[0],
                status: '制作中'
            });
        }

        if (onSuccess) onSuccess();
    };

    const handleDelete = () => {
        if (window.confirm(`「${formData.title}」を削除してもよろしいですか？`)) {
            deleteProject(formData.id);
            if (onSuccess) onSuccess();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={`space-y-6 ${!isModal ? "animate-in fade-in duration-500 slide-in-from-bottom-4 max-w-3xl mx-auto" : ""}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`${isModal ? "text-2xl" : "text-3xl"} font-bold tracking-tight`}>
                        {isEditMode ? '案件の編集' : '新規案件登録'}
                    </h1>
                    <p className="text-foreground/60 mt-1">
                        {isEditMode ? '内容を修正して保存してください' : '新しい案件の詳細情報を入力して追加してください'}
                    </p>
                </div>
                {isModal && onCancel && (
                    <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/50 hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className={`${!isModal ? "rounded-2xl border border-border shadow-sm" : ""} bg-card overflow-hidden`}>
                <form onSubmit={handleSubmit} className={`${isModal ? "py-4 space-y-6" : "p-6 md:p-8 space-y-8"}`}>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-foreground">案件名</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Type className="h-5 w-5 text-foreground/40" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                list="project-names"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="例: 株式会社◯◯ PR動画制作"
                                className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            />
                            {/* サジェスト（オートコンプリート）用のデータリスト */}
                            <datalist id="project-names">
                                {recentProjectNames.map((name, i) => (
                                    <option key={i} value={name} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">カテゴリ</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none appearance-none"
                                >
                                    <option value="編集">編集</option>
                                    <option value="撮影">撮影</option>
                                    <option value="ディレクション">ディレクション</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">進捗ステータス</label>
                            <div className="relative">
                                {/* ステータス表示ドット */}
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm ${formData.status === '制作中' ? 'bg-blue-500' :
                                        formData.status === 'チェック待ち' ? 'bg-orange-500' : 'bg-green-500'
                                    }`}></div>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none appearance-none font-medium"
                                >
                                    <option value="制作中">制作中</option>
                                    <option value="チェック待ち">チェック待ち</option>
                                    <option value="完遂">完遂</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">納品予定日</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    name="deliveryDate"
                                    required
                                    value={formData.deliveryDate}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">単価 (円)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">想定作業時間 (h)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    name="hours"
                                    min="0"
                                    step="0.5"
                                    required
                                    value={formData.hours}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                        {isEditMode ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full sm:w-auto flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-500/10 font-medium py-3 px-6 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                案件を削除
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="w-full sm:w-auto flex gap-3">
                            {isModal && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full sm:w-auto px-6 py-3 border border-border rounded-xl hover:bg-muted font-medium transition-colors"
                                >
                                    キャンセル
                                </button>
                            )}
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                {isEditMode ? '変更を保存' : '案件を登録'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
