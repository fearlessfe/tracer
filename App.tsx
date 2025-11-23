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
    name: '智能座舱 HMI 系统研发',
    description: '下一代电动汽车智能座舱人机交互系统，集成 AR-HUD 导航与 ADAS 告警可视化。',
    type: ProjectType.Project,
    members: [{ id: 'm1', name: '张三' }, { id: 'm2', name: '李四' }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dataSources: [
      {
        id: 'ds-mock-1',
        name: '产品需求库',
        type: 'file',
        config: '2 个文件',
        details: { fileNames: ['HMI_Navigation_Spec_v3.0.docx', 'ADAS_Alert_System_Arch.pdf'] },
        status: 'synced',
        lastSync: Date.now()
      }
    ],
    documents: [
      {
        id: 'doc-mock-1',
        title: '01_HMI_导航交互规范_v3.0.docx',
        sourceId: 'ds-mock-1',
        fileType: 'docx',
        updatedAt: Date.now(),
        path: 'HMI_Navigation_Spec_v3.0.docx',
        enabled: true,
        parsingStatus: 'completed',
        parsingVerificationStatus: 'unverified', // 状态：待校验，展示解析视图
        semanticType: '需求规格说明书',
        // 模拟解析内容：包含图片、表格，供用户在解析视图中检查和修改描述
        parsedContent: [
          {
            type: 'text',
            content: '# HMI 导航系统需求规格说明书 v3.0\n\n## 1. 概述\n本模块定义了智能座舱仪表盘（IC）与抬头显示（HUD）的导航信息显示规范。系统应在车辆行驶过程中提供实时、准确的路径引导。\n\n## 2. 仪表盘导航卡片显示逻辑\n当驾驶员开启导航模式时，仪表盘中央区域应切换为导航卡片模式。'
          },
          {
            type: 'image',
            content: {
               url: 'https://placehold.co/800x450/1e293b/94a3b8?text=Cluster+Navigation+UI',
               caption: '【AI 自动生成描述】这是一张汽车全液晶仪表盘的 UI 原型图。\n1. 布局结构：屏幕分为左、中、右三栏。左侧显示车辆状态（胎压、车门），右侧显示多媒体信息。\n2. 核心区域（中央）：显示 3D 导航地图。当前车速“80 km/h”以大号字体悬浮显示在地图下方居中位置。\n3. 导航引导：地图上方有一个蓝色的转向箭头图标，指示“前方 500米 右转进入 世纪大道”。\n4. ADAS 状态：底部状态栏显示车道保持辅助（LKA）图标为绿色，表示功能已激活。'
            }
          },
          {
            type: 'text',
            content: '## 3. 性能需求 (Non-functional Requirements)\n- **冷启动时间**：从点火信号（IGN_ON）发出到导航界面完全加载，时间不得超过 2.5 秒。\n- **帧率要求**：地图渲染帧率在任何工况下不得低于 60 FPS。'
          },
          {
            type: 'table',
            content: {
                headers: ['告警等级', '触发条件', '显示策略', 'UI 示例 (AI 识别)'],
                rows: [
                    ['Level 1 (提示)', '剩余电量 < 20%', '状态栏电池图标闪烁黄色', '![黄色电池图标](https://placehold.co/100x40/fef08a/854d0e?text=Low+Battery)'],
                    ['Level 2 (警告)', '车道偏离 (LDW)', '仪表盘显示红色车道线', '![红色车道线](https://placehold.co/100x60/fecaca/991b1b?text=LDW+Alert)'],
                    ['Level 3 (紧急)', '前向碰撞预警 (FCW)', '全屏弹窗覆盖导航', '![前向碰撞图标](https://placehold.co/100x60/fee2e2/991b1b?text=FCW+Warning) 高频警报 + 座椅震动']
                ]
            }
          }
        ]
      },
      {
        id: 'doc-mock-2',
        title: '02_ADAS_告警系统架构说明书.pdf',
        sourceId: 'ds-mock-1',
        fileType: 'pdf',
        updatedAt: Date.now(),
        path: 'ADAS_Alert_System_Arch.pdf',
        enabled: true,
        parsingStatus: 'completed',
        parsingVerificationStatus: 'verified', // 状态：已校验
        normalizationStatus: 'completed',      // 状态：已规范化，展示分屏视图
        semanticType: '架构设计文档',
        // 左侧：规范化结果
        normalizedItems: [
            {
                id: 'norm-1',
                category: '系统架构',
                content: 'ADAS 告警系统采用分层架构设计，分为感知层、决策层和执行层。感知层负责雷达与摄像头数据融合。',
                originalText: '系统架构设计... 采用分层架构... 感知层...',
                sourceIndices: [1, 2, 4] // 关联到右侧的标题(1), 正文(2), 图片(4)
            },
            {
                id: 'norm-2',
                category: '数据流转',
                content: '传感器数据通过 CAN-FD 总线传输至域控制器，延迟需控制在 10ms 以内。',
                originalText: '数据传输链路... CAN-FD 总线... 延迟 < 10ms',
                sourceIndices: [3, 7] // 关联到右侧的正文(3) 和 表格(7)
            }
        ],
        // 右侧：解析内容（细粒度拆分，标题和内容分开，方便单独选择）
        parsedContent: [
          {
             type: 'text',
             content: '# ADAS 告警系统架构设计'
          },
          {
             type: 'text', // Index 1: Title
             content: '## 1. 系统架构概述'
          },
          {
             type: 'text', // Index 2: Content
             content: 'ADAS 告警系统采用经典的分层架构设计模式，主要由三个核心层级组成：感知层（Perception）、决策层（Decision）和执行层（Action）。'
          },
          {
             type: 'text', // Index 3: Content
             content: '各层级之间通过车载以太网与 CAN-FD 总线进行高带宽、低延迟的数据交换。'
          },
          {
             type: 'image', // Index 4: Image
             content: {
                url: 'https://placehold.co/600x400/e2e8f0/475569?text=Architecture+Diagram',
                caption: '图 1-1：ADAS 系统逻辑架构图。图中展示了 Radar、Camera 输入流向 Domain Controller，处理后输出至 HMI 和 Brake System。'
             }
          },
          {
             type: 'text', // Index 5
             content: '## 2. 感知层定义'
          },
          {
             type: 'text', // Index 6
             content: '感知层主要负责环境数据的采集与预处理。主要传感器包含：\n1. 前向毫米波雷达 (77GHz)\n2. 前视多功能摄像头 (MPC)'
          },
           {
             type: 'text', // Index 7: Table for interfaces
             content: '## 3. 接口规范'
          },
          {
             type: 'table', // Index 8
             content: {
                 headers: ['接口ID', '源', '目标', '协议'],
                 rows: [
                     ['IF_001', 'Radar', 'Domain Ctrl', 'CAN-FD'],
                     ['IF_002', 'Camera', 'Domain Ctrl', 'LVDS']
                 ]
             }
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '自动驾驶算法规范库',
    description: 'L3 级自动驾驶感知、决策与控制算法接口定义文档。',
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
       // Reset to MOCK_PROJECTS if nothing is found (or old BlueSpace data is ignored for clean slate)
       setProjects(MOCK_PROJECTS);
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