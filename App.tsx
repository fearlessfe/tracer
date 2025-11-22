import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import { Project, ProjectFormData, ProjectType } from './types';
import { ProjectCard } from './components/ProjectCard';
import { Modal } from './components/Modal';
import { ProjectForm } from './components/ProjectForm';
import { Button } from './components/Button';
import { LayoutGrid, Plus, Search, Archive } from 'lucide-react';
import { ProjectDetail } from './components/ProjectDetail';

// Dummy data for initial load if storage is empty
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: '网站重构计划',
    description: '将旧版门户网站迁移至 Next.js 框架，提升性能与 SEO 表现。',
    type: ProjectType.Project,
    members: [{ id: 'm1', name: '张三' }, { id: 'm2', name: '李四' }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dataSources: [],
    documents: []
  },
  {
    id: '2',
    name: '设计规范文档',
    description: '统一公司内部 UI 组件库的设计语言与交互规范。',
    type: ProjectType.KnowledgeBase,
    members: [{ id: 'm3', name: '王五' }],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 50000,
    dataSources: [],
    documents: []
  },
];

// Layout Component
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">BlueSpace</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-medium">
              U
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

// Dashboard Component
interface DashboardProps {
  projects: Project[];
  onCreateClick: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateClick, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | ProjectType>('all');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTab === 'all' || p.type === activeTab;
    return matchesSearch && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">工作台</h2>
            <p className="mt-1 text-sm text-slate-500">管理您的所有项目和知识库。</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                 <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input
                 type="text"
                 placeholder="搜索项目..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="block w-full rounded-lg border-0 bg-white py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 shadow-sm"
               />
             </div>
             
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
              {(['all', ProjectType.Project, ProjectType.KnowledgeBase] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? '全部' : tab}
                </button>
              ))}
            </div>

            <Button onClick={onCreateClick} icon={<Plus className="w-4 h-4" />}>
              新建项目
            </Button>
          </div>
        </div>

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={(p) => navigate(`/project/${p.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-20 text-center bg-slate-50/50">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <Archive className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">没有找到项目</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
              {searchTerm ? '尝试更换搜索关键词，或者' : '开始创建您的第一个项目，'} 点击下方按钮。
            </p>
            <div className="mt-6">
              <Button onClick={onCreateClick} icon={<Plus className="w-4 h-4" />}>
                新建项目
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Initialize data
  useEffect(() => {
    const saved = localStorage.getItem('bluespace_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist on old data
        const migrated = parsed.map((p: Project) => ({
          ...p,
          dataSources: p.dataSources || [],
          documents: p.documents || []
        }));
        setProjects(migrated);
      } catch (e) {
        setProjects(MOCK_PROJECTS);
      }
    } else {
      setProjects(MOCK_PROJECTS);
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('bluespace_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreate = (data: ProjectFormData) => {
    const newProject: Project = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dataSources: [],
      documents: []
    };
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  const handleUpdate = (data: ProjectFormData) => {
    if (!editingProject) return;
    const updatedProjects = projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...data, updatedAt: Date.now() } 
        : p
    );
    setProjects(updatedProjects);
    setIsModalOpen(false);
    setEditingProject(null);
  };
  
  // Handle update for a full project object (used by ProjectDetail)
  const handleProjectChange = (updatedProject: Project) => {
    const newProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(newProjects);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Dashboard 
              projects={projects} 
              onCreateClick={openCreateModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          } />
          <Route path="project/:id" element={
            <ProjectDetail 
              projects={projects} 
              onProjectUpdate={handleProjectChange} 
            />
          } />
        </Route>
      </Routes>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? "编辑项目" : "新建项目"}
      >
        <ProjectForm
          initialData={editingProject || undefined}
          onSubmit={editingProject ? handleUpdate : handleCreate}
          onCancel={closeModal}
        />
      </Modal>
    </Router>
  );
};

export default App;