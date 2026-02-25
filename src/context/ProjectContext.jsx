import { createContext, useContext, useState, useEffect } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { supabase } from '../lib/supabase';

const ProjectContext = createContext();

const generateMockProjects = () => {
    const today = new Date();
    return [
        { id: '1', title: 'YouTubeチャンネルOP制作', category: '編集', price: 25000, hours: 12, deliveryDate: format(today, 'yyyy-MM-dd'), status: '完遂', month: format(today, 'yyyy-MM') },
        { id: '2', title: '企業PR動画撮影', category: '撮影', price: 150000, hours: 8, deliveryDate: format(today, 'yyyy-MM-dd'), status: 'チェック待ち', month: format(today, 'yyyy-MM') },
        { id: '3', title: 'ウェディングムービー編集', category: '編集', price: 60000, hours: 20, deliveryDate: format(subDays(today, -5), 'yyyy-MM-dd'), status: '制作中', month: format(today, 'yyyy-MM') },
    ];
};

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            if (supabase) {
                // Fetch from Supabase
                try {
                    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
                    if (error) throw error;
                    // Transform snake_case from DB to camelCase for UI
                    const formattedData = data.map(item => ({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        price: item.price,
                        hours: item.hours,
                        deliveryDate: item.delivery_date,
                        status: item.status,
                        month: item.delivery_date ? item.delivery_date.substring(0, 7) : format(new Date(), 'yyyy-MM')
                    }));
                    setProjects(formattedData);
                } catch (error) {
                    console.error('Error fetching from Supabase:', error);
                }
            } else {
                // Fallback to localStorage
                const saved = localStorage.getItem('videodash_projects');
                if (saved) {
                    try {
                        setProjects(JSON.parse(saved));
                    } catch (e) {
                        setProjects(generateMockProjects());
                    }
                } else {
                    setProjects(generateMockProjects());
                }
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Effect for local storage sync (only if not using Supabase)
    useEffect(() => {
        if (!supabase && !isLoading) {
            localStorage.setItem('videodash_projects', JSON.stringify(projects));
        }
    }, [projects, isLoading]);

    const addProject = async (project) => {
        const isCloudSync = !!supabase;
        const generatedId = Math.random().toString(36).substr(2, 9); // For local only
        const month = project.deliveryDate ? project.deliveryDate.substring(0, 7) : format(new Date(), 'yyyy-MM');

        let newProject = { ...project, id: generatedId, month };

        // Optimistic UI update
        setProjects((prev) => [newProject, ...prev]);

        if (isCloudSync) {
            try {
                // Insert to Supabase (match column names)
                const { data, error } = await supabase.from('projects').insert([{
                    title: project.title,
                    category: project.category,
                    price: project.price,
                    hours: project.hours,
                    delivery_date: project.deliveryDate,
                    status: project.status
                }]).select('*').single();

                if (error) throw error;

                // Replace optimistic ID with real DB ID
                setProjects((prev) => prev.map(p => p.id === generatedId ? {
                    ...p,
                    id: data.id,
                    month: data.delivery_date.substring(0, 7)
                } : p));
            } catch (error) {
                console.error('Error inserting to Supabase:', error);
                // Rollback optimistic update
                setProjects((prev) => prev.filter(p => p.id !== generatedId));
                alert('通信エラーが発生しました。案件を追加できませんでした。');
            }
        }
    };

    const updateProjectStatus = async (id, newStatus) => {
        // Optimistic UI update
        const previousProjects = [...projects];
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));

        if (supabase) {
            try {
                const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error('Error updating Supabase:', error);
                // Rollback
                setProjects(previousProjects);
            }
        }
    };

    const deleteProject = async (id) => {
        // Optimistic UI update
        const previousProjects = [...projects];
        setProjects((prev) => prev.filter((p) => p.id !== id));

        if (supabase) {
            try {
                const { error } = await supabase.from('projects').delete().eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error('Error deleting from Supabase:', error);
                // Rollback
                setProjects(previousProjects);
            }
        }
    };

    const editProject = async (id, updatedData) => {
        // Prepare data for DB and State
        const month = updatedData.deliveryDate ? updatedData.deliveryDate.substring(0, 7) : format(new Date(), 'yyyy-MM');
        const updatedProject = { ...updatedData, id, month };

        // Optimistic UI update
        const previousProjects = [...projects];
        setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));

        if (supabase) {
            try {
                const { error } = await supabase.from('projects').update({
                    title: updatedData.title,
                    category: updatedData.category,
                    price: updatedData.price,
                    hours: updatedData.hours,
                    delivery_date: updatedData.deliveryDate,
                    status: updatedData.status
                }).eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error('Error updating project in Supabase:', error);
                // Rollback
                setProjects(previousProjects);
                alert('通信エラーが発生しました。案件を更新できませんでした。');
            }
        }
    };

    return (
        <ProjectContext.Provider value={{ projects, addProject, editProject, updateProjectStatus, deleteProject, isLoading }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => useContext(ProjectContext);
