import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import { Project, ProjectFormData, ProjectType, User } from './types';
import { ProjectCard } from './components/ProjectCard';
import { Modal } from './components/Modal';
import { ProjectForm } from './components/ProjectForm';
import { Button } from './components/Button';
import { Plus, Search, Archive, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { ProjectDetail } from './components/ProjectDetail';
import { Login } from './components/Login';
import { Logo } from './components/Logo';

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

// User Dropdown Component
const UserMenu: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
      >
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium overflow-hidden ring-2 ring-white">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs text-slate-500">登录账号</p>
            <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
          </div>
          <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
            <UserIcon className="mr-2 h-4 w-4 text-slate-400" /> 个人资料
          </a>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" /> 退出登录
          </button>
        </div>
      )}
    </div>
  );
};

// Layout Component
interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100 group-hover:bg-primary-100 transition-colors">
              <Logo className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Tracer</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <UserMenu user={user} onLogout={onLogout} />
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
  const [user, setUser] = useState<User | null>(() => {
    // Changed key to tracer_user for rebranding
    const savedUser = localStorage.getItem('tracer_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Initialize data
  useEffect(() => {
    // Changed key to tracer_projects for rebranding
    const saved = localStorage.getItem('tracer_projects');
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
      // Fallback: Try to load old BlueSpace data to migrate
      const oldData = localStorage.getItem('bluespace_projects');
      if (oldData) {
        try {
           const parsed = JSON.parse(oldData);
           const migrated = parsed.map((p: Project) => ({
            ...p,
            dataSources: p.dataSources || [],
            documents: p.documents || []
          }));
          setProjects(migrated);
        } catch(e) {
          setProjects(MOCK_PROJECTS);
        }
      } else {
        setProjects(MOCK_PROJECTS);
      }
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('tracer_projects', JSON.stringify(projects));
  }, [projects]);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('tracer_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tracer_user');
  };

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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
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