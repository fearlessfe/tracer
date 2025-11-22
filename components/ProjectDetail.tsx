
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, ProjectType, DataSource, DataSourceType, Document, NormalizedItem, NormalizationStatus, ParsingStatus, ParsedContentItem, ParsedTable, ParsedImage, ChatMessage, Citation, ChatSession } from '../types';
import { Database, FileText, ArrowLeft, Folder, Book, Github, UploadCloud, Trello, Plus, CheckCircle, File, Trash2, RefreshCw, Upload, Key, Globe, Link as LinkIcon, CheckSquare, Search, FileCode, ChevronRight, ChevronDown, X, LayoutList, User, Lock, Settings, Sparkles, ScanSearch, Split, Columns, Loader2, FileJson, Table as TableIcon, ImageIcon, AlignLeft, Eye, BrainCircuit, GitGraph, Network, Share2, ArrowDown, ArrowRight, Layers, FileSearch, ListTree, Link2, Grid3X3, LayoutDashboard, Clock, Save, MoreHorizontal, PlayCircle, Filter, Lightbulb, MessageSquare, Send, Bot, User as UserIcon, Quote, PanelLeftClose, PanelLeftOpen, History, GitMerge, Library, GraduationCap } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ProjectDetailProps {
  projects: Project[];
  onProjectUpdate: (project: Project) => void;
}

// --- Mock Data & Constants ---

// Mock Jira Projects for selection step
const MOCK_JIRA_PROJECTS = [
  { id: 'PROJ', name: '核心平台开发 (PROJ)', key: 'PROJ' },
  { id: 'WEB', name: '前端门户 (WEB)', key: 'WEB' },
  { id: 'OPS', name: '运维支持 (OPS)', key: 'OPS' },
  { id: 'DES', name: 'UI/UX 设计 (DES)', key: 'DES' },
];

// Mock Files for Git Repo View
const MOCK_REPO_FILES = [
  'README.md',
  'package.json',
  'tsconfig.json',
  'public/index.html',
  'public/manifest.json',
  'public/robots.txt',
  'src/index.tsx',
  'src/App.tsx',
  'src/types.ts',
  'src/vite-env.d.ts',
  'src/utils/api.ts',
  'src/utils/helpers.ts',
  'src/components/Button.tsx',
  'src/components/Modal.tsx',
  'src/components/Layout.tsx',
  'src/components/Header.tsx',
  'src/styles/globals.css',
  'src/hooks/useAuth.ts'
];

// Mock Historical Sessions
const MOCK_SESSIONS: ChatSession[] = [
  { id: 'sess-1', title: '关于需求变更的讨论', lastMessageAt: Date.now() - 3600000 },
  { id: 'sess-2', title: '系统架构设计审查', lastMessageAt: Date.now() - 86400000 },
  { id: 'sess-3', title: '测试覆盖率分析', lastMessageAt: Date.now() - 172800000 },
];

// Mock Messages for History
const MOCK_SESSION_DATA: Record<string, ChatMessage[]> = {
  'sess-1': [
    { id: 'm1-1', role: 'user', content: '这次迭代的需求变更有哪些？', createdAt: Date.now() - 3600000 },
    { id: 'm1-2', role: 'ai', content: '根据 [需求规格说明书.docx] 的最新版本，主要变更为：\n1. 增加了 OAuth2 第三方登录支持。\n2. 修改了仪表盘的刷新频率限制。', createdAt: Date.now() - 3590000, citations: [{ id: 'c1', docId: 'doc-1', title: '需求规格说明书.docx', snippet: '版本 1.2 变更记录：新增 OAuth2 模块...', sourceName: 'Local Upload' }] }
  ],
  'sess-2': [
    { id: 'm2-1', role: 'user', content: '当前的架构图在哪里？', createdAt: Date.now() - 86400000 },
    { id: 'm2-2', role: 'ai', content: '架构设计详见 [系统架构设计说明书.pdf]。', createdAt: Date.now() - 86300000, citations: [{ id: 'c2', docId: 'doc-arch', title: '系统架构设计说明书.pdf', snippet: '第 3 章：系统逻辑架构图...', sourceName: 'Git Repo' }] }
  ],
  'sess-3': [
    { id: 'm3-1', role: 'user', content: '测试用例覆盖率如何？', createdAt: Date.now() - 172800000 },
    { id: 'm3-2', role: 'ai', content: '目前 [系统测试方案.docx] 规划了 120 个用例，覆盖了 95% 的核心功能点。', createdAt: Date.now() - 172700000, citations: [{ id: 'c3', docId: 'doc-test', title: '系统测试方案.docx', snippet: '测试覆盖率统计：核心功能 95%...', sourceName: 'Local Upload' }] }
  ]
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'ai',
  content: '您好！我是您的智能助手。我已学习了知识库中的所有内容。您可以问我任何相关问题。',
  createdAt: Date.now(),
  citations: []
};

// --- Mock Content Generators ---
const getMockCodeContent = (fileName: string) => {
  if (fileName.endsWith('tsx')) {
    return `import React from 'react';\nimport { Button } from './Button';\n\nexport const ${fileName.split('/').pop()?.split('.')[0]} = () => {\n  return (\n    <div className="p-4">\n      <h1>Hello World</h1>\n      <Button>Click Me</Button>\n    </div>\n  );\n};`;
  }
  if (fileName.endsWith('json')) return `{\n  "name": "bluespace-project",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "lucide-react": "^0.200.0"\n  }\n}`;
  if (fileName.endsWith('md')) return `# ${fileName.split('/').pop()}\n\nThis is a documentation file for the project.\n\n## Features\n- Modern UI Design\n- React + TypeScript\n- Component Based Architecture\n\n## Getting Started\nRun \`npm install\` to install dependencies.`;
  if (fileName.endsWith('css')) return `.root {\n  background-color: #f8fafc;\n  min-height: 100vh;\n}\n\n.card {\n  border-radius: 0.5rem;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}`;
  return `// Content for ${fileName}\n// Loading source code...\nconsole.log("File loaded: ${fileName}");`;
};

const getMockJiraContent = (key: string, title: string, type: string) => {
  return `Project: ${key.split('-')[0]}\nKey: ${key}\nType: ${type.toUpperCase()}\nSummary: ${title}\n\nStatus: In Progress\nPriority: High\nAssignee: Zhang San\nCreated: ${new Date().toLocaleDateString()}\n\nDescription:\nThis is a ${type} imported from Jira.\nIt represents a unit of work to be tracked and completed.\n\nAcceptance Criteria:\n1. Functionality works as expected.\n2. Tests are passed.\n3. Code is reviewed.`;
};

const generateMockParsedContent = (docTitle: string): ParsedContentItem[] => {
  return [
    {
      type: 'text',
      content: `这是对文档 "${docTitle}" 的智能解析结果。系统已自动识别出文档中的关键段落、数据表格以及相关图像信息。`
    },
    {
      type: 'text',
      content: '以下表格列出了从文档中提取的核心功能需求及其优先级状态：'
    },
    {
      type: 'table',
      content: {
        headers: ['需求编号', '功能描述', '优先级', '状态'],
        rows: [
          ['REQ-001', '用户通过 OAuth2 登录', 'High', '已完成'],
          ['REQ-002', '仪表盘数据实时可视化', 'Medium', '开发中'],
          ['REQ-003', '支持 PDF 格式导出', 'Low', '待规划'],
          ['REQ-004', '多语言国际化支持', 'Medium', '测试中']
        ]
      } as ParsedTable
    },
    {
      type: 'text',
      content: '系统架构设计图如下所示，描述了前端、后端服务以及数据库之间的交互流程。'
    },
    {
      type: 'image',
      content: {
        url: 'https://placehold.co/600x300/eff6ff/1d4ed8?text=Architecture+Diagram',
        caption: '图 1: 系统架构与数据流向图'
      } as ParsedImage
    },
    {
      type: 'text',
      content: '解析模块还发现了以下非功能性需求：系统响应时间需小于 200ms，且支持 99.9% 的可用性。'
    }
  ];
};

// Helper to simulate AI inferring V-Model document type
const getVModelType = (filename: string, fileType: string): string => {
  const lower = filename.toLowerCase();
  
  if (fileType === 'epic') return '用户需求说明书';
  if (fileType === 'story') return '软件需求规格说明书';
  if (fileType === 'bug') return '缺陷报告';
  if (fileType === 'task') return '开发任务书';

  if (lower.includes('req') || lower.includes('需求') || lower.includes('spec')) return '需求规格说明书';
  if (lower.includes('arch') || lower.includes('架构') || lower.includes('system') || lower.includes('系统')) return '系统架构设计说明书';
  if (lower.includes('detail') || lower.includes('详细') || lower.includes('design')) return '详细设计说明书';
  if (lower.includes('test') || lower.includes('测试') || lower.includes('case')) return '系统测试报告';
  if (lower.includes('plan') || lower.includes('计划')) return '项目管理计划';
  if (lower.includes('api') || lower.includes('interface')) return '接口文档';
  if (lower.includes('readme')) return '项目自述文件';
  
  return '通用文档';
};

// --- Traceability Types & Mock Data ---

interface TraceNode {
  id: string;
  label: string;
  type: 'req' | 'tc' | 'arch' | 'dd';
  x: number;
  y: number;
}

interface TraceEdge {
  source: string;
  target: string;
}

interface TraceabilityRecord {
  id: string;
  name: string;
  status: 'processing' | 'success';
  createTime: number;
  sourceDocs: {id: string, title: string}[];
  targetDocs: {id: string, title: string}[];
  // The resulting graph data for this specific relation
  nodes: TraceNode[];
  edges: TraceEdge[];
}

const generateMockNodesForDoc = (doc: Document, type: TraceNode['type']): TraceNode[] => {
  const count = 10; // Simulate 10 items per doc
  const nodes: TraceNode[] = [];
  for (let i = 1; i <= count; i++) {
    nodes.push({
      id: `${doc.id}-item-${i}`,
      label: `${type.toUpperCase()}-${i}`, // Simple label
      type,
      x: 0, y: 0 // Layout handled dynamically
    });
  }
  return nodes;
};

const generateDashboardData = () => {
  const nodes: TraceNode[] = [];
  const edges: TraceEdge[] = [];
  
  // Counts: 35 Req, 123 TC, 10 Arch, 25 DD
  const REQ_COUNT = 35;
  const TC_COUNT = 123;
  const ARCH_COUNT = 10;
  const DD_COUNT = 25;

  // Layout Configuration
  const width = 1200;
  const height = 1000;
  
  const createNodes = (count: number, prefix: string, type: TraceNode['type'], xPosPct: number) => {
     for (let i = 1; i <= count; i++) {
       nodes.push({
         id: `${prefix}-${i}`,
         label: `${prefix}-${i}`,
         type,
         x: width * xPosPct,
         y: (height / (count + 1)) * i
       });
     }
  };

  createNodes(TC_COUNT, 'TC', 'tc', 0.1);     
  createNodes(REQ_COUNT, 'REQ', 'req', 0.35); 
  createNodes(ARCH_COUNT, 'ARCH', 'arch', 0.65); 
  createNodes(DD_COUNT, 'DD', 'dd', 0.9);     

  for (let i = 1; i <= REQ_COUNT; i++) {
    const reqId = `REQ-${i}`;
    const startTc = Math.floor(((i - 1) / REQ_COUNT) * TC_COUNT) + 1;
    const endTc = Math.floor((i / REQ_COUNT) * TC_COUNT);
    for (let j = startTc; j <= Math.max(startTc, endTc); j++) {
       if (j <= TC_COUNT) edges.push({ source: reqId, target: `TC-${j}` });
    }
  }
  for (let i = 1; i <= REQ_COUNT; i++) {
     const reqId = `REQ-${i}`;
     const archIdx = (i % ARCH_COUNT) + 1;
     edges.push({ source: reqId, target: `ARCH-${archIdx}` });
  }
  for (let i = 1; i <= ARCH_COUNT; i++) {
     const archId = `ARCH-${i}`;
     const startDd = Math.floor(((i - 1) / ARCH_COUNT) * DD_COUNT) + 1;
     const endDd = Math.floor((i / ARCH_COUNT) * DD_COUNT);
     for (let j = startDd; j <= Math.max(startDd, endDd); j++) {
        if (j <= DD_COUNT) edges.push({ source: archId, target: `DD-${j}` });
     }
  }

  return { nodes, edges };
};

// --- Components ---

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  id?: string; // document id if file
  children?: Record<string, TreeNode>;
}

const buildFileTree = (docs: Document[]) => {
  const root: Record<string, TreeNode> = {};

  docs.forEach(doc => {
    const parts = (doc.path || doc.title).split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        const isFile = index === parts.length - 1;
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          id: isFile ? doc.id : undefined, // For Git Repo view, this ID will be the file path
          children: isFile ? undefined : {}
        };
      }
      if (index < parts.length - 1) {
        current = current[part].children!;
      }
    });
  });

  return root;
};

const FileTreeNode: React.FC<{ 
  node: TreeNode; 
  depth: number; 
  selectedId?: string; 
  onSelect: (id: string) => void 
}> = ({ node, depth, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = node.id === selectedId;

  if (node.type === 'file') {
    return (
      <div 
        onClick={() => node.id && onSelect(node.id)}
        className={`flex items-center py-1.5 px-2 cursor-pointer text-sm transition-colors rounded-md ${
          isSelected ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileCode className="w-4 h-4 mr-2 shrink-0 opacity-70" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center py-1.5 px-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-50 select-none rounded-md"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isOpen ? <ChevronDown className="w-3 h-3 mr-2 shrink-0 text-slate-400" /> : <ChevronRight className="w-3 h-3 mr-2 shrink-0 text-slate-400" />}
        <Folder className="w-4 h-4 mr-2 shrink-0 text-blue-300" fill="currentColor" />
        <span className="truncate font-medium">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {(Object.values(node.children) as TreeNode[])
            .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
            .map(child => (
            <FileTreeNode 
              key={child.path} 
              node={child} 
              depth={depth + 1} 
              selectedId={selectedId} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BuildRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onBuild: (sourceId: string, targetIds: string[]) => void;
  existingRelations: {sourceId: string, targetId: string}[];
}

const BuildRelationModal: React.FC<BuildRelationModalProps> = ({ isOpen, onClose, documents, onBuild, existingRelations }) => {
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSourceId(null);
      setSelectedTargets([]);
      setShowSuggestedOnly(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedTargets([]);
  }, [sourceId]);

  if (!isOpen) return null;

  const isLinked = (id1: string, id2: string) => {
    return existingRelations.some(r => (r.sourceId === id1 && r.targetId === id2) || (r.sourceId === id2 && r.targetId === id1));
  };

  // --- Smart Filter Logic ---
  type DocCategory = 'req' | 'arch' | 'design' | 'test' | 'bug' | 'task' | 'repo' | 'other';

  const getDocCategory = (doc: Document): DocCategory => {
    const typeStr = (doc.semanticType || doc.fileType || '').toLowerCase();
    const title = doc.title.toLowerCase();
    
    if (typeStr.includes('需求') || typeStr.includes('req') || typeStr.includes('spec') || typeStr === 'epic' || typeStr === 'story') return 'req';
    if (typeStr.includes('架构') || typeStr.includes('arch') || title.includes('system')) return 'arch';
    if (typeStr.includes('设计') || typeStr.includes('design') || title.includes('detail')) return 'design';
    if (typeStr.includes('测试') || typeStr.includes('test') || typeStr.includes('case')) return 'test';
    if (typeStr.includes('缺陷') || typeStr.includes('bug')) return 'bug';
    if (typeStr.includes('任务') || typeStr.includes('task')) return 'task';
    if (typeStr === 'git-repo') return 'repo';
    return 'other';
  };

  const isRecommendedTarget = (source: Document, target: Document): boolean => {
     const sType = getDocCategory(source);
     const tType = getDocCategory(target);

     if (sType === 'other' || tType === 'other') return false; // Don't restrict unknown types excessively, but don't "recommend" them strongly

     switch (sType) {
       case 'req':
         return ['test', 'arch', 'design', 'task'].includes(tType);
       case 'arch':
         return ['design', 'test', 'req'].includes(tType);
       case 'design':
         return ['test', 'repo', 'arch'].includes(tType);
       case 'test':
         return ['req', 'bug', 'arch'].includes(tType);
       case 'bug':
         return ['test', 'task', 'req'].includes(tType);
       case 'repo':
         return ['design', 'task'].includes(tType);
       case 'task':
         return ['req', 'bug', 'repo'].includes(tType);
       default:
         return false;
     }
  };

  const sourceDoc = documents.find(d => d.id === sourceId);
  
  const filteredTargets = documents.filter(doc => {
     if (!sourceId) return false;
     if (doc.id === sourceId) return false;
     if (showSuggestedOnly && sourceDoc) {
        // If filter is ON, only show recommended OR currently selected items (so they don't disappear)
        return isRecommendedTarget(sourceDoc, doc) || selectedTargets.includes(doc.id);
     }
     return true;
  });

  const handleTargetToggle = (id: string) => {
    if (selectedTargets.includes(id)) {
      setSelectedTargets(selectedTargets.filter(t => t !== id));
    } else {
      setSelectedTargets([...selectedTargets, id]);
    }
  };

  const handleSubmit = () => {
    if (sourceId && selectedTargets.length > 0) {
      onBuild(sourceId, selectedTargets);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="构建追溯关系">
       <div className="flex h-[450px] border border-slate-200 rounded-lg overflow-hidden">
         {/* Left Panel: Source */}
         <div className="w-5/12 border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-3 bg-white border-b border-slate-200 font-medium text-sm text-slate-700">
              1. 选择源文档
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {documents.map(doc => (
                <label 
                  key={doc.id} 
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                    sourceId === doc.id 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                    : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="sourceDoc" 
                    className="sr-only"
                    checked={sourceId === doc.id}
                    onChange={() => setSourceId(doc.id)}
                  />
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${sourceId === doc.id ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <div className="flex flex-col truncate min-w-0">
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 truncate">{doc.semanticType || doc.fileType}</span>
                  </div>
                </label>
              ))}
            </div>
         </div>

         {/* Right Panel: Targets */}
         <div className="w-7/12 flex flex-col bg-white">
           <div className="p-3 border-b border-slate-200 flex flex-col gap-2 bg-white z-10">
              <div className="flex justify-between items-center">
                 <span className="font-medium text-sm text-slate-700">2. 选择关联目标</span>
                 {sourceId && <span className="text-xs text-slate-400 font-normal">已选 {selectedTargets.length}</span>}
              </div>
              {/* Smart Filter Toggle */}
              <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-md">
                 <div className="flex items-center gap-2 text-xs text-indigo-700">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">智能筛选</span>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={showSuggestedOnly}
                      onChange={(e) => setShowSuggestedOnly(e.target.checked)}
                      disabled={!sourceId}
                    />
                    <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 text-xs text-slate-600">{showSuggestedOnly ? '仅显示推荐' : '显示全部'}</span>
                 </label>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-2 space-y-1 relative">
              {!sourceId ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                  <ArrowLeft className="w-8 h-8 mb-2 opacity-20" />
                  请先在左侧选择一个源文档
                </div>
              ) : (
                <>
                  {filteredTargets.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                        <Filter className="w-8 h-8 mb-2 opacity-20" />
                        <p>未找到推荐的关联文档</p>
                        <button onClick={() => setShowSuggestedOnly(false)} className="text-primary-600 hover:underline mt-1">
                           显示所有文档
                        </button>
                     </div>
                  )}
                  {filteredTargets.map(doc => {
                    const linked = isLinked(sourceId, doc.id);
                    const recommended = sourceDoc && isRecommendedTarget(sourceDoc, doc);
                    
                    return (
                      <label 
                        key={doc.id} 
                        className={`flex items-start p-2 rounded-md transition-colors group ${
                          linked ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'
                        } ${selectedTargets.includes(doc.id) ? 'bg-blue-50/50 ring-1 ring-blue-100' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          disabled={linked}
                          checked={selectedTargets.includes(doc.id)}
                          onChange={() => handleTargetToggle(doc.id)}
                          className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-3 disabled:opacity-50"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                             <span className={`text-sm font-medium truncate ${linked ? 'text-slate-400' : 'text-slate-700'}`}>{doc.title}</span>
                             {recommended && !linked && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 flex-shrink-0">
                                  推荐
                                </span>
                             )}
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] text-slate-400 truncate">{doc.semanticType || doc.fileType}</span>
                             {linked && <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">已关联</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </>
              )}
           </div>
         </div>
       </div>
       <div className="mt-4 flex justify-between items-center">
         <div className="text-xs text-slate-400 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1 text-amber-400" />
            <span className="hidden sm:inline">系统根据 V-Model 模型自动推荐合理的追溯路径。</span>
         </div>
         <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>取消</Button>
            <Button onClick={handleSubmit} disabled={!sourceId || selectedTargets.length === 0}>
              开始构建
            </Button>
         </div>
       </div>
    </Modal>
  );
};

// --- Traceability View Component ---

interface TraceabilityViewProps {
  isDashboard?: boolean;
  dashboardGraph?: {nodes: TraceNode[], edges: TraceEdge[]};
  documents?: Document[];
  records: TraceabilityRecord[];
  onAddRecord: (sourceId: string, targetIds: string[]) => void;
  onUpdateRecord: (updatedRecord: TraceabilityRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSearchQuery?: (query: string) => void;
}

const TraceabilityView: React.FC<TraceabilityViewProps> = ({ 
  isDashboard = false,
  dashboardGraph,
  documents = [],
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onSearchQuery
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View State for Traceability Tab
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [matrixTab, setMatrixTab] = useState<string>('default');
  const [editedEdges, setEditedEdges] = useState<TraceEdge[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate existing relations for modal to disable
  const existingRelations = useMemo(() => {
     const rels: {sourceId: string, targetId: string}[] = [];
     records.forEach(rec => {
        rec.sourceDocs.forEach(s => {
           rec.targetDocs.forEach(t => {
              rels.push({ sourceId: s.id, targetId: t.id });
           });
        });
     });
     return rels;
  }, [records]);

  // Helper for dashboard highlights
  const getConnected = (nodeId: string | null) => {
    if (!nodeId || !dashboardGraph) return { nodes: new Set(), edges: new Set() };
    const connectedNodes = new Set<string>([nodeId]);
    const connectedEdges = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      dashboardGraph.edges.forEach((edge) => {
         const edgeId = `${edge.source}-${edge.target}`;
         if (connectedEdges.has(edgeId)) return;
         if (connectedNodes.has(edge.source) || connectedNodes.has(edge.target)) {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
            connectedEdges.add(edgeId);
            changed = true;
         }
      });
    }
    return { nodes: connectedNodes, edges: connectedEdges };
  };

  const dashboardHighlights = useMemo(() => getConnected(hoveredNode || selectedNode), [hoveredNode, selectedNode, dashboardGraph]);

  const getNodeColor = (type: TraceNode['type']) => {
    switch(type) {
      case 'req': return '#3b82f6'; // blue
      case 'tc': return '#10b981'; // green
      case 'arch': return '#8b5cf6'; // purple
      case 'dd': return '#f97316'; // orange
      default: return '#64748b';
    }
  };

  // --- Handlers ---

  const handleBuildSubmit = (sourceId: string, targetIds: string[]) => {
    onAddRecord(sourceId, targetIds);
  };

  const handleEnterDetail = (record: TraceabilityRecord) => {
    if (record.status === 'success') {
      setActiveRecordId(record.id);
      setEditedEdges(record.edges); // Initialize local edit state
      setHasChanges(false);
      // Determine default matrix tab
      const sType = record.nodes.find(n => record.sourceDocs.some(d => d.id && n.id.startsWith(d.id)))?.type || 'req';
      const tType = record.nodes.find(n => record.targetDocs.some(d => d.id && n.id.startsWith(d.id)))?.type || 'tc';
      setMatrixTab(`${sType}-${tType}`);
    }
  };

  const handleToggleEdge = (sourceId: string, targetId: string) => {
    setHasChanges(true);
    setEditedEdges(prev => {
      const exists = prev.some(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId));
      if (exists) {
        return prev.filter(e => !((e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)));
      } else {
        return [...prev, { source: sourceId, target: targetId }];
      }
    });
  };

  const handleSaveMatrix = () => {
    if (!activeRecordId) return;
    const record = records.find(r => r.id === activeRecordId);
    if (record) {
      onUpdateRecord({
        ...record,
        edges: editedEdges
      });
      setHasChanges(false);
      alert('追溯关系已保存');
    }
  };

  // --- Renderers ---

  const renderDashboardView = () => {
    if (!dashboardGraph) return <div className="p-8 text-center text-slate-500">数据加载中...</div>;
    
    return (
      <div className="flex flex-col h-full relative">
        {/* Search Bar Header for Dashboard */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-20 shadow-sm">
           <div className="flex items-center gap-4">
               <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                 <LayoutDashboard className="w-5 h-5 text-primary-600" />
                 项目全景仪表盘
               </h2>
               <span className="text-xs text-slate-500 border border-slate-200 px-2 py-1 rounded-full bg-slate-50">Entry Level Full Data</span>
           </div>
           
           {/* Search Box that jumps to Chat */}
           <div className="flex-1 max-w-xl mx-6 relative">
             <div className="relative">
                <input
                  type="text"
                  placeholder="向 AI 助手提问 (例如: 系统有哪些高优先级需求?)"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearchQuery && searchQuery.trim()) {
                      onSearchQuery(searchQuery);
                      setSearchQuery('');
                    }
                  }}
                />
                <Sparkles className="w-4 h-4 text-primary-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
             </div>
           </div>

           <div className="flex items-center">
              {/* Right side actions if needed */}
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
               {/* Legend Content (Same as before) */}
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-primary-500" />
                  条目类型图例
               </h3>
               <div className="space-y-4">
                 {['req', 'tc', 'arch', 'dd'].map(t => (
                   <div key={t} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getNodeColor(t as any) }}></div>
                      <span className="text-xs font-medium text-slate-700 uppercase">{t}</span>
                   </div>
                 ))}
               </div>
               <div className="mt-auto">
                 <p className="text-[10px] text-slate-400">此视图展示当前项目所有文档解析后的条目关联概况。</p>
               </div>
             </div>
             <div className="flex-1 h-full overflow-auto bg-slate-50/50 pl-64">
               <svg width={1200} height={1000} className="mx-auto my-8 bg-white shadow-sm rounded-xl">
                  {dashboardGraph.edges.map((edge, idx) => {
                    const s = dashboardGraph.nodes.find(n => n.id === edge.source);
                    const t = dashboardGraph.nodes.find(n => n.id === edge.target);
                    if (!s || !t) return null;
                    const isHigh = dashboardHighlights.edges.has(`${edge.source}-${edge.target}`);
                    const isDim = (hoveredNode || selectedNode) && !isHigh;
                    return <line key={idx} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={isHigh ? '#3b82f6' : '#cbd5e1'} strokeWidth={isHigh ? 2 : 1} strokeOpacity={isDim ? 0.1 : 0.4} />;
                  })}
                  {dashboardGraph.nodes.map(node => {
                     const isHigh = dashboardHighlights.nodes.has(node.id);
                     const isDim = (hoveredNode || selectedNode) && !isHigh;
                     return (
                       <circle 
                         key={node.id} 
                         cx={node.x} cy={node.y} r={isHigh ? 8 : 5} 
                         fill={getNodeColor(node.type)} 
                         opacity={isDim ? 0.2 : 1}
                         onMouseEnter={() => setHoveredNode(node.id)}
                         onMouseLeave={() => setHoveredNode(null)}
                         onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                         className="cursor-pointer transition-all"
                       />
                     );
                  })}
               </svg>
             </div>
        </div>
      </div>
    );
  };

  // ... (renderRecordList and renderMatrixDetail are identical, keeping them concise)
  const renderRecordList = () => {
    return (
      <div className="p-8 max-w-6xl mx-auto">
         <div className="flex justify-between items-end mb-6">
            <div>
               <h2 className="text-2xl font-bold text-slate-900">追溯关系管理</h2>
               <p className="text-slate-500 mt-1">构建、管理和验证文档间的追溯矩阵。</p>
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsBuildModalOpen(true)}>
               构建追溯关系
            </Button>
         </div>

         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">关系名称 / 描述</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">源文档</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">目标文档</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">创建时间</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4">
                          <div className="flex items-center">
                             <div className={`p-2 rounded-lg mr-3 ${record.status === 'success' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                <Grid3X3 className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="text-sm font-medium text-slate-900">{record.name}</div>
                               <div className="text-xs text-slate-500">ID: {record.id.slice(-6)}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                          {record.sourceDocs.map(d => (
                            <div key={d.id} className="flex items-center gap-1 mb-1">
                               <FileText className="w-3 h-3 text-slate-400" /> {d.title}
                            </div>
                          ))}
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-600">
                          {record.targetDocs.map(d => (
                             <div key={d.id} className="flex items-center gap-1 mb-1">
                                <FileText className="w-3 h-3 text-slate-400" /> {d.title}
                             </div>
                          ))}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          {record.status === 'success' ? (
                             <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                <CheckCircle className="w-3 h-3 mr-1" /> 构建成功
                             </span>
                          ) : (
                             <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 构建中...
                             </span>
                          )}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(record.createTime).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {record.status === 'success' ? (
                             <button 
                               onClick={() => handleEnterDetail(record)}
                               className="text-primary-600 hover:text-primary-900 mr-4 font-semibold flex items-center justify-end inline-flex"
                             >
                                <Eye className="w-4 h-4 mr-1" /> 查看详情
                             </button>
                          ) : (
                             <span className="text-slate-400 mr-4 cursor-not-allowed flex items-center justify-end inline-flex">
                                <Loader2 className="w-4 h-4 mr-1" /> 等待中
                             </span>
                          )}
                          <button 
                            onClick={() => onDeleteRecord(record.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="删除"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                           <div className="flex flex-col items-center">
                              <LinkIcon className="w-10 h-10 text-slate-300 mb-3" />
                              <p className="text-lg font-medium text-slate-900">暂无追溯关系</p>
                              <p className="text-sm text-slate-500 mt-1">点击右上角按钮开始构建您的第一个追溯矩阵。</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    );
  };

  const renderMatrixDetail = () => {
     // ... (Existing matrix detail render code logic, omitted for brevity but assumed present)
     // For the update, I'm reusing the logic by reference or copy if I had to write the whole file.
     // Since the prompt asks for updates, I will paste the existing implementation back to ensure file integrity.
     const record = records.find(r => r.id === activeRecordId);
    if (!record) return null;

    const [rowTypeStr, colTypeStr] = matrixTab.split('-');
    
    const rowNodes = record.nodes.filter(n => n.type === rowTypeStr);
    const colNodes = record.nodes.filter(n => n.type === colTypeStr);

    const typesPresent = Array.from(new Set(record.nodes.map(n => n.type)));
    const availableTabs: string[] = [];
    const sourceTypes = Array.from(new Set(record.sourceDocs.map(d => {
       const node = record.nodes.find(n => n.id.startsWith(d.id));
       return node?.type;
    }).filter(Boolean)));
    const targetTypes = Array.from(new Set(record.targetDocs.map(d => {
       const node = record.nodes.find(n => n.id.startsWith(d.id));
       return node?.type;
    }).filter(Boolean)));

    sourceTypes.forEach(s => {
       targetTypes.forEach(t => {
          if(s && t) availableTabs.push(`${s}-${t}`);
       });
    });

    if(availableTabs.length === 0 && typesPresent.length >= 2) {
       availableTabs.push(`${typesPresent[0]}-${typesPresent[1]}`);
    }

    const hasRelation = (src: string, tgt: string) => {
       return editedEdges.some(e => (e.source === src && e.target === tgt) || (e.source === tgt && e.target === src));
    };

    return (
      <div className="flex flex-col h-full bg-slate-50">
         <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <button onClick={() => setActiveRecordId(null)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                  <h2 className="font-bold text-slate-800 text-lg">{record.name}</h2>
                  <p className="text-xs text-slate-500 flex items-center">
                     <Clock className="w-3 h-3 mr-1" /> 
                     最后更新: {new Date(record.createTime).toLocaleString()}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               {hasChanges && <span className="text-xs text-amber-600 font-medium animate-pulse">有未保存的修改</span>}
               <Button size="sm" onClick={handleSaveMatrix} disabled={!hasChanges} icon={<Save className="w-4 h-4" />}>
                  保存变更
               </Button>
            </div>
         </div>
         <div className="bg-white border-b border-slate-200 px-6 flex space-x-6">
            {availableTabs.map(tab => {
               const [r, c] = tab.split('-');
               return (
                  <button
                     key={tab}
                     onClick={() => setMatrixTab(tab)}
                     className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                        matrixTab === tab 
                        ? 'border-primary-500 text-primary-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                     }`}
                  >
                     {r.toUpperCase()} <span className="mx-1 text-slate-300">vs</span> {c.toUpperCase()}
                  </button>
               );
            })}
         </div>
         <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden inline-block min-w-full">
               <table className="min-w-full border-collapse">
                  <thead>
                     <tr>
                        <th className="sticky top-0 left-0 z-20 bg-slate-100 p-3 border-b border-r border-slate-200 text-left text-xs font-semibold text-slate-600 min-w-[200px]">
                           {rowTypeStr?.toUpperCase()} \ {colTypeStr?.toUpperCase()}
                        </th>
                        {colNodes.map(col => (
                           <th key={col.id} className="sticky top-0 z-10 bg-slate-50 p-2 border-b border-slate-200 text-xs font-medium text-slate-500 min-w-[100px] text-center">
                              <div className="truncate w-24 mx-auto" title={col.label}>{col.label}</div>
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {rowNodes.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50">
                           <td className="sticky left-0 z-10 bg-white p-2 border-r border-b border-slate-100 text-xs font-medium text-slate-700 whitespace-nowrap hover:bg-slate-50">
                              {row.label}
                           </td>
                           {colNodes.map(col => {
                              const active = hasRelation(row.id, col.id);
                              return (
                                 <td 
                                   key={`${row.id}-${col.id}`} 
                                   onClick={() => handleToggleEdge(row.id, col.id)}
                                   className={`border-b border-slate-100 text-center p-2 cursor-pointer transition-colors hover:bg-blue-50 ${active ? 'bg-blue-50/30' : ''}`}
                                 >
                                    <div className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all ${
                                       active ? 'bg-primary-500 border-primary-600 shadow-sm scale-100' : 'bg-white border-slate-200 scale-90 opacity-0 hover:opacity-100'
                                    }`}>
                                       {active && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                 </td>
                              );
                           })}
                        </tr>
                     ))}
                     {rowNodes.length === 0 && (
                        <tr>
                           <td colSpan={colNodes.length + 1} className="p-10 text-center text-slate-400">
                              此视图下无相关数据条目
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    );
  };

  if (isDashboard) {
    return renderDashboardView();
  }

  return (
    <div className="h-full flex flex-col bg-white">
       {activeRecordId ? renderMatrixDetail() : renderRecordList()}
       
       <BuildRelationModal 
         isOpen={isBuildModalOpen} 
         onClose={() => setIsBuildModalOpen(false)} 
         documents={documents}
         onBuild={handleBuildSubmit}
         existingRelations={existingRelations}
       />
    </div>
  );
};


// --- Main Component ---

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, onProjectUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const isProject = project?.type === ProjectType.Project;
  
  // Unified tab state, initially 'dashboard' for Projects and 'overview' for KB
  const [activeTab, setActiveTab] = useState<string>(isProject ? 'dashboard' : 'overview');

  // Dashboard Graph State (Snapshot for visual only)
  const [dashboardGraph] = useState(generateDashboardData());

  // Chat State
  const [currentSessionId, setCurrentSessionId] = useState<string | 'new'>('new');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_SESSIONS);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Traceability Records State
  const [traceabilityRecords, setTraceabilityRecords] = useState<TraceabilityRecord[]>([
     {
        id: 'rec-001',
        name: '需求规格说明书 <-> 系统测试方案',
        status: 'success',
        createTime: Date.now() - 10000000,
        sourceDocs: [{id: 'doc-1', title: '需求规格说明书.docx'}],
        targetDocs: [{id: 'doc-2', title: '系统测试方案.docx'}],
        nodes: [
           ...generateMockNodesForDoc({id: 'doc-1'} as Document, 'req'),
           ...generateMockNodesForDoc({id: 'doc-2'} as Document, 'tc')
        ],
        edges: [
           {source: 'doc-1-item-1', target: 'doc-2-item-1'},
           {source: 'doc-1-item-1', target: 'doc-2-item-2'},
           {source: 'doc-1-item-2', target: 'doc-2-item-3'}
        ]
     }
  ]);

  // Document Viewer State
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [repoFilePath, setRepoFilePath] = useState<string | null>(null); 
  const [viewMode, setViewMode] = useState<'raw' | 'parsed' | 'split'>('raw');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Modal State
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [managingSource, setManagingSource] = useState<DataSource | null>(null);
  const [addSourceType, setAddSourceType] = useState<DataSourceType | null>(null);
  
  // Form States
  const [sourceName, setSourceName] = useState('');
  const [jiraStep, setJiraStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Specific inputs
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const [gitToken, setGitToken] = useState('');
  
  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraPassword, setJiraPassword] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [jiraAuthMode, setJiraAuthMode] = useState<'password' | 'token'>('password');
  const [selectedJiraProjects, setSelectedJiraProjects] = useState<string[]>([]);

  // Reset tab if type changes or init
  useEffect(() => {
    if (project) {
       if (project.type === ProjectType.Project && activeTab === 'overview') {
         setActiveTab('dashboard');
       } else if (project.type === ProjectType.KnowledgeBase && activeTab === 'dashboard') {
         setActiveTab('overview');
       }
    }
  }, [project?.type]);

  useEffect(() => {
    setRepoFilePath(null);
    setViewMode('raw');
    setHighlightedItemId(null);
  }, [selectedDocId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSessionSwitch = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsChatProcessing(false);
    setChatInput('');
    setActiveCitation(null); 
    if (MOCK_SESSION_DATA[sessionId]) {
      setChatMessages(MOCK_SESSION_DATA[sessionId]);
    } else {
      setChatMessages([WELCOME_MESSAGE]);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId('new');
    setChatMessages([WELCOME_MESSAGE]);
    setIsChatProcessing(false);
    setChatInput('');
    setActiveCitation(null);
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <h2 className="text-xl font-semibold text-slate-900">项目未找到</h2>
        <Button onClick={() => navigate('/')} className="mt-4">返回首页</Button>
      </div>
    );
  }

  const dataSources = project.dataSources || [];
  const documents = project.documents || [];
  const visibleDocuments = documents.filter(doc => doc.enabled !== false);
  const selectedDoc = useMemo(() => documents.find(d => d.id === selectedDocId), [documents, selectedDocId]);
  const selectedSource = useMemo(() => dataSources.find(ds => ds.id === selectedDoc?.sourceId), [dataSources, selectedDoc]);
  const isGitRepo = selectedDoc?.fileType === 'git-repo';

  const fileTree = useMemo(() => {
    if (!selectedDoc) return null;
    if (isGitRepo) {
      const mockTreeDocs = MOCK_REPO_FILES.map(path => ({
        id: path, 
        title: path.split('/').pop() || path,
        sourceId: 'mock',
        fileType: path.split('.').pop() || 'file',
        updatedAt: 0,
        path: path,
        enabled: true,
        normalizationStatus: 'unprocessed',
        parsingStatus: 'unprocessed'
      } as Document));
      return buildFileTree(mockTreeDocs);
    }
    return null;
  }, [selectedDoc, isGitRepo]);

  useEffect(() => {
    if (isGitRepo && !repoFilePath) {
      setRepoFilePath('README.md');
    }
  }, [isGitRepo, repoFilePath]);

  // Project Type Menus
  const projectMenuItems = [
    { id: 'dashboard', label: '项目仪表盘', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'AI 助手', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'datasource', label: '数据源管理', icon: <Database className="w-4 h-4" /> },
    { id: 'documents', label: '文档管理', icon: <FileText className="w-4 h-4" /> },
    { id: 'traceability', label: '追溯关系', icon: <LinkIcon className="w-4 h-4" /> },
  ];

  const kbMenuItems = [
    { id: 'overview', label: '知识库概览', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: '智能问答', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'documents', label: '知识资产', icon: <Library className="w-4 h-4" /> },
    { id: 'datasource', label: '数据连接', icon: <Database className="w-4 h-4" /> },
  ];

  const currentMenuItems = isProject ? projectMenuItems : kbMenuItems;

  const generateDocsForSource = (source: DataSource): Document[] => {
     // ... (Same logic as before, kept concise)
    const now = Date.now();
    const baseDocs: Document[] = [];
    
    if (source.type === 'file' && source.details?.fileNames) {
      (source.details.fileNames as string[]).forEach((fileName, idx) => {
        const ext = fileName.split('.').pop() || 'file';
        let semanticType = getVModelType(fileName, ext);
        baseDocs.push({
          id: `${now}-${idx}`,
          title: fileName,
          sourceId: source.id,
          fileType: ext,
          updatedAt: now,
          path: fileName,
          content: `Mock content...`,
          enabled: true,
          parsingStatus: 'unprocessed',
          normalizationStatus: 'unprocessed',
          semanticType: semanticType
        });
      });
    } else if (source.type === 'git') {
      const repoName = source.details?.url ? source.details.url.split('/').pop() : source.name;
      baseDocs.push({
        id: `${now}-repo-${source.id}`,
        title: repoName || 'Git Repository',
        sourceId: source.id,
        fileType: 'git-repo',
        updatedAt: now,
        path: source.details?.url || '',
        content: 'Repository Content',
        enabled: true,
        parsingStatus: 'unprocessed',
        normalizationStatus: 'unprocessed'
      });
    } else if (source.type === 'jira' && source.details?.selectedProjects) {
      const projects = source.details.selectedProjects as string[];
      projects.forEach((projKey, idx) => {
        const issues = [
          { key: `${projKey}-1`, title: `[EPIC] Q3 核心功能规划`, type: 'epic' },
          { key: `${projKey}-101`, title: `用户登录与注册模块开发`, type: 'task' },
          { key: `${projKey}-102`, title: `首页 Dashboard 数据可视化设计`, type: 'story' },
          { key: `${projKey}-103`, title: `修复 API 响应超时问题`, type: 'bug' },
        ];
        issues.forEach((issue, i) => {
          baseDocs.push({
            id: `${now}-j-${idx}-${i}`,
            title: `${issue.key}: ${issue.title}`,
            sourceId: source.id,
            fileType: issue.type,
            updatedAt: now,
            path: issue.key,
            content: getMockJiraContent(issue.key, issue.title, issue.type),
            enabled: true,
            parsingStatus: 'unprocessed',
            normalizationStatus: 'unprocessed',
            semanticType: getVModelType(issue.title, issue.type)
          });
        });
      });
    }
    return baseDocs;
  };

  const handleAddRecord = (sourceId: string, targetIds: string[]) => {
    const sourceDoc = documents.find(d => d.id === sourceId);
    const targetDocObjs = documents.filter(d => targetIds.includes(d.id));
    if (!sourceDoc) return;
    const getType = (d: Document) => {
       if(d.semanticType?.includes('需求') || d.fileType === 'epic') return 'req';
       if(d.semanticType?.includes('测试') || d.fileType === 'test') return 'tc';
       if(d.semanticType?.includes('架构') || d.title.includes('arch')) return 'arch';
       if(d.semanticType?.includes('设计')) return 'dd';
       return 'req'; 
    };
    const sType = getType(sourceDoc);
    let nodes: TraceNode[] = generateMockNodesForDoc(sourceDoc, sType);
    targetDocObjs.forEach(t => {
       nodes = [...nodes, ...generateMockNodesForDoc(t, getType(t))];
    });
    const newRecord: TraceabilityRecord = {
       id: `rec-${Date.now()}`,
       name: `${sourceDoc.title} <-> ${targetDocObjs.length > 1 ? targetDocObjs[0].title + ' 等' : targetDocObjs[0].title}`,
       status: 'processing',
       createTime: Date.now(),
       sourceDocs: [{id: sourceDoc.id, title: sourceDoc.title}],
       targetDocs: targetDocObjs.map(t => ({id: t.id, title: t.title})),
       nodes: nodes,
       edges: [] 
    };
    setTraceabilityRecords(prev => [newRecord, ...prev]);
    setTimeout(() => {
       setTraceabilityRecords(prev => prev.map(r => {
          if(r.id === newRecord.id) {
             const randomEdges: TraceEdge[] = [];
             const srcNodes = r.nodes.filter(n => n.id.startsWith(sourceDoc.id));
             targetDocObjs.forEach(t => {
                const tgtNodes = r.nodes.filter(n => n.id.startsWith(t.id));
                srcNodes.forEach(s => {
                   if(Math.random() > 0.7) {
                      const randomTgt = tgtNodes[Math.floor(Math.random() * tgtNodes.length)];
                      randomEdges.push({source: s.id, target: randomTgt.id});
                   }
                });
             });
             return { ...r, status: 'success', edges: randomEdges };
          }
          return r;
       }));
    }, 2000);
  };

  const handleUpdateRecord = (updated: TraceabilityRecord) => setTraceabilityRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  const handleDeleteRecord = (id: string) => { if(window.confirm('确定要删除这条追溯记录吗？')) setTraceabilityRecords(prev => prev.filter(r => r.id !== id)); };

  const handleChatInputSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if(!chatInput.trim()) return;
    const userMsg: ChatMessage = {
       id: `msg-${Date.now()}`,
       role: 'user',
       content: chatInput,
       createdAt: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatProcessing(true);

    setTimeout(() => {
       const citableDocs = visibleDocuments.length > 0 ? visibleDocuments : documents;
       const citationCount = Math.min(citableDocs.length, 2);
       const citations: Citation[] = [];
       for(let i = 0; i < citationCount; i++) {
          const doc = citableDocs[i];
          const source = dataSources.find(s => s.id === doc.sourceId);
          citations.push({
             id: `cit-${Date.now()}-${i}`,
             docId: doc.id,
             title: doc.title,
             snippet: doc.content?.slice(0, 150) || "Content preview unavailable...",
             sourceName: source?.name
           });
       }
       let aiContent = "根据您项目中的文档，我找到了一些相关信息。";
       if (citations.length > 0) {
          aiContent += `\n\n在文档 [${citations[0].title}] 中提到了一些关键点。`;
          if(citations.length > 1) aiContent += ` 此外，[${citations[1].title}] 也有相关描述。`;
       } else {
          aiContent = "抱歉，我当前无法访问到相关的项目文档来回答这个问题。请检查数据源配置。";
       }
       const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'ai',
          content: aiContent,
          createdAt: Date.now(),
          citations: citations
       };
       setChatMessages(prev => [...prev, aiMsg]);
       setIsChatProcessing(false);
    }, 1500);
  };

  const handleDashboardSearch = (query: string) => {
     setActiveTab('chat');
     const newSessionId = `sess-${Date.now()}`;
     const newSession: ChatSession = {
        id: newSessionId,
        title: query, 
        lastMessageAt: Date.now()
     };
     setChatSessions(prev => [newSession, ...prev]);
     setCurrentSessionId(newSessionId);
     const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: query, createdAt: Date.now() };
     setChatMessages([WELCOME_MESSAGE, userMsg]);
     setIsChatProcessing(true);
     setTimeout(() => {
        const citableDocs = visibleDocuments.length > 0 ? visibleDocuments : documents;
        const citations: Citation[] = [];
        if (citableDocs.length > 0) {
           const doc = citableDocs[0];
           const source = dataSources.find(s => s.id === doc.sourceId);
           citations.push({ id: `cit-${Date.now()}`, docId: doc.id, title: doc.title, snippet: doc.content?.slice(0, 150) || "...", sourceName: source?.name });
        }
        const aiMsg: ChatMessage = {
           id: `msg-${Date.now() + 1}`,
           role: 'ai',
           content: `收到，正在为您分析关于 "${query}" 的信息。\n\n根据 [${citations[0]?.title || '项目文档'}]，这是一个关键的关注点。`,
           createdAt: Date.now(),
           citations: citations
        };
        setChatMessages(prev => [...prev, aiMsg]);
        MOCK_SESSION_DATA[newSessionId] = [WELCOME_MESSAGE, userMsg, aiMsg];
        setIsChatProcessing(false);
     }, 1500);
  };

  // Existing logic for handleParse, handleNormalize... (kept concise)
  const handleParse = (docId: string) => {
     const updatedProjectProcessing = { ...project, documents: project.documents?.map(d => d.id === docId ? { ...d, parsingStatus: 'processing' as ParsingStatus } : d) };
      onProjectUpdate(updatedProjectProcessing);
      setTimeout(() => {
        const doc = documents.find(d => d.id === docId);
        if (!doc) return;
        const parsedContent = generateMockParsedContent(doc.title);
        const inferredType = getVModelType(doc.title, doc.fileType);
        const completedProject = { ...project, documents: project.documents?.map(d => d.id === docId ? { ...d, parsingStatus: 'completed' as ParsingStatus, parsedContent: parsedContent, semanticType: inferredType } : d) };
        onProjectUpdate(completedProject);
      }, 2000);
  };

  const handleNormalize = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    const updatedProjectProcessing = { ...project, documents: project.documents?.map(d => d.id === docId ? { ...d, normalizationStatus: 'processing' as NormalizationStatus } : d) };
    onProjectUpdate(updatedProjectProcessing);
    setTimeout(() => {
      const content = doc.content || '';
      const rawLines = content.split(/\n+/).filter(line => line.trim().length > 10);
      const normalizedItems: NormalizedItem[] = rawLines.map((line, index) => ({ id: `item-${index}`, content: `标准化条目 ${index + 1}: ${line.substring(0, 20)}... (已验证)`, originalText: line.trim(), category: index % 2 === 0 ? '功能性' : '非功能性' }));
      if (normalizedItems.length === 0 && content.length > 0) normalizedItems.push({ id: 'item-0', content: '通用内容摘要与规范', originalText: content.substring(0, 50), category: '通用' });
      const completedProject = { ...project, documents: project.documents?.map(d => d.id === docId ? { ...d, normalizationStatus: 'completed' as NormalizationStatus, normalizedItems: normalizedItems } : d) };
      onProjectUpdate(completedProject);
    }, 2000);
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSourceType) return;
    let configDisplay = '';
    let details = {};
    if (addSourceType === 'file') {
      if (!files || files.length === 0) return;
      const fileNames = (Array.from(files) as any[]).map(f => f.name);
      configDisplay = `${files.length} 个文件`;
      details = { fileNames };
    } else if (addSourceType === 'git') {
      configDisplay = gitUrl;
      details = { url: gitUrl, branch: gitBranch, token: gitToken ? '******' : '' };
    } else if (addSourceType === 'jira') {
      configDisplay = `${selectedJiraProjects.length} 个同步项目`;
      details = { url: jiraUrl, authType: jiraAuthMode, username: jiraAuthMode === 'password' ? jiraEmail : undefined, password: jiraAuthMode === 'password' ? '******' : undefined, token: jiraAuthMode === 'token' ? '******' : undefined, selectedProjects: selectedJiraProjects };
    }
    const newSource: DataSource = {
      id: Date.now().toString(),
      name: sourceName || (addSourceType === 'git' ? 'Git Repository' : addSourceType === 'jira' ? 'Jira Workspace' : 'Local Upload'),
      type: addSourceType,
      config: configDisplay,
      details: details,
      status: 'synced',
      lastSync: Date.now()
    };
    const newDocs = generateDocsForSource(newSource);
    const updatedProject = { ...project, dataSources: [...(project.dataSources || []), newSource], documents: [...(project.documents || []), ...newDocs] };
    onProjectUpdate(updatedProject);
    closeAddSourceModal();
  };

  const handleJiraConnect = async () => { if (!jiraUrl) return; setIsLoading(true); setTimeout(() => { setIsLoading(false); setJiraStep(2); }, 1000); };
  const handleDeleteSource = (sourceId: string) => { if (!window.confirm('确定删除此数据源吗？相关文档也会被移除。')) return; const updatedProject = { ...project, dataSources: (project.dataSources || []).filter(ds => ds.id !== sourceId), documents: (project.documents || []).filter(d => d.sourceId !== sourceId) }; onProjectUpdate(updatedProject); };
  const handleToggleDocEnabled = (docId: string) => { const updatedDocuments = documents.map(doc => doc.id === docId ? { ...doc, enabled: !(doc.enabled ?? true) } : doc); onProjectUpdate({ ...project, documents: updatedDocuments }); };
  const closeAddSourceModal = () => { setIsAddSourceModalOpen(false); setAddSourceType(null); setSourceName(''); setFiles(null); setGitUrl(''); setGitBranch('main'); setGitToken(''); setJiraUrl(''); setJiraEmail(''); setJiraPassword(''); setJiraToken(''); setJiraAuthMode('password'); setJiraStep(1); setSelectedJiraProjects([]); setIsLoading(false); };

  const getSourceIcon = (type: DataSourceType) => {
    switch (type) {
      case 'git': return <Github className="w-5 h-5" />;
      case 'jira': return <Trello className="w-5 h-5" />;
      case 'file': return <File className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  // ... (Render helpers mostly unchanged)
  const renderParsedContent = (items: ParsedContentItem[]) => {
      return (
      <div className="space-y-6">
        <div className="mb-4 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileJson className="w-4 h-4" />
          解析结果预览 (JSON Structure)
        </div>
        {items.map((item, index) => {
          switch (item.type) {
            case 'text': return ( <div key={index} className="flex gap-3"> <div className="flex-shrink-0 mt-1"> <AlignLeft className="w-4 h-4 text-slate-300" /> </div> <p className="text-slate-700 leading-relaxed">{item.content as string}</p> </div> );
            case 'table': const table = item.content as ParsedTable; return ( <div key={index} className="flex gap-3"> <div className="flex-shrink-0 mt-4"> <TableIcon className="w-4 h-4 text-slate-300" /> </div> <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 my-2"> <table className="min-w-full divide-y divide-slate-200"> <thead className="bg-slate-50"> <tr> {table.headers.map((h, i) => <th key={i} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>)} </tr> </thead> <tbody className="divide-y divide-slate-200 bg-white"> {table.rows.map((row, rI) => ( <tr key={rI}> {row.map((cell, cI) => <td key={cI} className="px-4 py-2 text-sm text-slate-700">{cell}</td>)} </tr> ))} </tbody> </table> </div> </div> );
            case 'image': const img = item.content as ParsedImage; return ( <div key={index} className="flex gap-3"> <div className="flex-shrink-0 mt-8"> <ImageIcon className="w-4 h-4 text-slate-300" /> </div> <div className="flex-1 my-2"> <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg border border-slate-100"> <img src={img.url} alt={img.caption} className="rounded-md shadow-sm max-w-full h-auto" /> <span className="mt-3 text-xs text-slate-500 italic font-medium bg-white px-2 py-1 rounded shadow-sm border border-slate-100">{img.caption}</span> </div> </div> </div> );
            default: return null;
          }
        })}
      </div>
    );
  };

  const renderAddSourceContent = () => {
     if (!addSourceType) {
      return (
        <div className="grid grid-cols-3 gap-4 py-4">
          <button onClick={() => { setAddSourceType('file'); setSourceName('本地文件上传'); }} className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all gap-3 group"> <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white"> <UploadCloud className="w-6 h-6" /> </div> <span className="font-medium text-sm">本地文件</span> </button>
          <button onClick={() => { setAddSourceType('git'); setSourceName('Git 仓库'); }} className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all gap-3 group"> <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white"> <Github className="w-6 h-6" /> </div> <span className="font-medium text-sm">Git 仓库</span> </button>
          <button onClick={() => { setAddSourceType('jira'); setSourceName('Jira 项目'); }} className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all gap-3 group"> <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white"> <Trello className="w-6 h-6" /> </div> <span className="font-medium text-sm">Jira 项目</span> </button>
        </div>
      );
    }
    const header = (
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 border-b border-slate-100 pb-4">
        <button type="button" onClick={() => { setAddSourceType(null); setJiraStep(1); }} className="hover:text-slate-900 flex items-center"> <ArrowLeft className="w-3 h-3 mr-1" /> 返回选择 </button> <span className="text-slate-300">|</span> <span className="text-primary-600 font-medium flex items-center"> {addSourceType === 'file' && <UploadCloud className="w-4 h-4 mr-1" />} {addSourceType === 'git' && <Github className="w-4 h-4 mr-1" />} {addSourceType === 'jira' && <Trello className="w-4 h-4 mr-1" />} {addSourceType === 'file' ? '上传文件' : addSourceType === 'git' ? '连接仓库' : '连接 Jira'} </span>
      </div>
    );
    if (addSourceType === 'file') {
      return (
        <form onSubmit={handleAddSourceSubmit} className="space-y-4">
          {header}
          <div> <label className="block text-sm font-medium text-slate-900 mb-1">数据源名称</label> <input type="text" required value={sourceName} onChange={e => setSourceName(e.target.value)} className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" /> </div>
          <div> <label className="block text-sm font-medium text-slate-900 mb-1">选择文件</label> <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 cursor-pointer hover:bg-slate-50 hover:border-primary-400 transition-colors"> <div className="text-center"> <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" /> <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center"><span className="font-semibold text-primary-600 hover:text-primary-500">点击上传</span><span className="pl-1">或拖拽文件至此</span></div> <p className="text-xs leading-5 text-slate-500">支持 PDF, MD, DOCX, TXT 等格式</p> </div> <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => setFiles(e.target.files)} /> </div> {files && files.length > 0 && ( <div className="mt-4 bg-slate-50 rounded-lg p-3"> <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase">已选文件 ({files.length})</h4> <ul className="space-y-2"> {(Array.from(files) as any[]).map((file, i) => ( <li key={i} className="flex items-center text-sm text-slate-700 bg-white p-2 rounded border border-slate-200"> <File className="w-4 h-4 mr-2 text-slate-400" /> <span className="truncate flex-1">{file.name}</span> <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span> </li> ))} </ul> </div> )} </div>
          <div className="pt-4 flex gap-3"> <Button type="submit" className="flex-1" disabled={!files || files.length === 0}>确认上传</Button> <Button type="button" variant="secondary" onClick={closeAddSourceModal}>取消</Button> </div>
        </form>
      );
    }
    return null; 
  };

  const renderKbOverview = () => {
     return (
      <div className="p-8 max-w-6xl mx-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                   <FileText className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">知识文档</p>
                   <h3 className="text-2xl font-bold text-slate-900">{visibleDocuments.length}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                   <Database className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">数据来源</p>
                   <h3 className="text-2xl font-bold text-slate-900">{dataSources.length}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                   <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">最近同步</p>
                   <h3 className="text-lg font-bold text-slate-900 truncate">
                      {dataSources.length > 0 ? '10 分钟前' : '暂无同步'}
                   </h3>
                </div>
             </div>
          </div>

          {/* Hero Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center mb-10">
             <h2 className="text-2xl font-bold text-slate-900 mb-3">知识库智能检索</h2>
             <p className="text-slate-500 mb-8">基于语义理解，快速定位文档内容与答案。</p>
             
             <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="搜索知识库内容..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      handleDashboardSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
             </div>
             <div className="mt-4 flex justify-center gap-2 text-xs text-slate-400">
                <span>热门搜索:</span>
                <button onClick={() => handleDashboardSearch('系统架构设计')} className="hover:text-primary-600 underline decoration-dotted">系统架构</button>
                <button onClick={() => handleDashboardSearch('API 接口规范')} className="hover:text-primary-600 underline decoration-dotted">接口规范</button>
                <button onClick={() => handleDashboardSearch('部署流程')} className="hover:text-primary-600 underline decoration-dotted">部署流程</button>
             </div>
          </div>

          {/* Quick Actions & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Actions */}
             <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-slate-900">快捷操作</h3>
                <button 
                   onClick={() => { setAddSourceType('file'); setIsAddSourceModalOpen(true); }}
                   className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all group text-left"
                >
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                      <UploadCloud className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="font-medium text-slate-900">上传文档</div>
                      <div className="text-xs text-slate-500">支持 PDF, Markdown, Word</div>
                   </div>
                </button>
                <button 
                   onClick={() => { setAddSourceType('git'); setIsAddSourceModalOpen(true); }}
                   className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all group text-left"
                >
                   <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors">
                      <Github className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="font-medium text-slate-900">连接 Git 仓库</div>
                      <div className="text-xs text-slate-500">同步代码库与 README</div>
                   </div>
                </button>
             </div>

             {/* Recent Documents */}
             <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-slate-900">最近更新的文档</h3>
                   <button onClick={() => setActiveTab('documents')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">查看全部</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                   {visibleDocuments.slice(0, 5).map((doc, idx) => (
                      <div key={doc.id} onClick={() => setSelectedDocId(doc.id)} className={`p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${idx !== visibleDocuments.slice(0, 5).length - 1 ? 'border-b border-slate-100' : ''}`}>
                         <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <div className="truncate">
                               <div className="font-medium text-slate-900 truncate">{doc.title}</div>
                               <div className="text-xs text-slate-500">{new Date(doc.updatedAt).toLocaleString()}</div>
                            </div>
                         </div>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full ${doc.parsingStatus === 'completed' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {doc.parsingStatus === 'completed' ? '已索引' : '未索引'}
                         </span>
                      </div>
                   ))}
                   {visibleDocuments.length === 0 && (
                      <div className="p-8 text-center text-slate-400">
                         暂无文档，请先上传。
                      </div>
                   )}
                </div>
             </div>
          </div>
      </div>
     );
  };

  const renderChatView = () => {
    // ... (Keep existing chat view logic unchanged)
    return (
      <div className="flex h-full bg-slate-50 overflow-hidden">
        {showChatHistory && (
          <div className="w-64 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col animate-in slide-in-from-left-5 duration-200">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                   <History className="w-3.5 h-3.5 mr-2" /> 历史对话
                </span>
                <button onClick={() => setShowChatHistory(false)} className="text-slate-400 hover:text-slate-600 md:hidden"> <X className="w-4 h-4" /> </button>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <button onClick={handleNewChat} className={`w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg border border-dashed border-slate-300 text-xs transition-colors ${ currentSessionId === 'new' ? 'bg-white text-primary-600 border-primary-200 font-medium shadow-sm' : 'text-slate-500 hover:bg-white hover:text-primary-600 hover:border-primary-200' }`} > <Plus className="w-3.5 h-3.5" /> 新建对话 (最新) </button>
                {chatSessions.map(session => ( <button key={session.id} onClick={() => handleSessionSwitch(session.id)} className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all border group ${ currentSessionId === session.id ? 'bg-white shadow-sm border-slate-200 text-primary-700' : 'border-transparent text-slate-600 hover:bg-white hover:shadow-sm hover:border-slate-100' }`} > <div className="font-medium truncate">{session.title}</div> <div className="text-xs text-slate-400 mt-1">{new Date(session.lastMessageAt).toLocaleDateString()}</div> </button> ))}
             </div>
          </div>
        )}
        <div className={`flex-1 flex flex-col bg-white ${activeCitation ? 'w-1/2 border-r border-slate-200' : 'w-full'}`}>
           <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                 <button onClick={() => setShowChatHistory(!showChatHistory)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" title={showChatHistory ? "隐藏历史记录" : "显示历史记录"} > {showChatHistory ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />} </button>
                 <div> <h2 className="font-bold text-slate-800 flex items-center gap-2"> <Bot className="w-5 h-5 text-primary-600" /> AI 助手 </h2> </div>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block"> {currentSessionId === 'new' ? '正在进行新对话' : '查看历史记录模式'} </div>
           </div>
           <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
              {chatMessages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-primary-100 text-primary-600 ml-3' : 'bg-emerald-100 text-emerald-600 mr-3'}`}> {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />} </div>
                       <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${ msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' }`}>
                          <div className="whitespace-pre-wrap">
                             {msg.content.split(/(\[.*?\])/g).map((part, idx) => {
                                const isCitation = part.startsWith('[') && part.endsWith(']');
                                const citationTitle = isCitation ? part.slice(1, -1) : null;
                                const citation = citationTitle ? msg.citations?.find(c => c.title === citationTitle) : null;
                                if (isCitation && citation) { return ( <button key={idx} onClick={() => setActiveCitation(citation)} className={`inline-flex items-center px-1.5 mx-1 rounded cursor-pointer transition-colors font-medium text-xs ${ msg.role === 'user' ? 'bg-white/20 text-white hover:bg-white/30' : `bg-blue-100 text-blue-700 hover:bg-blue-200 ring-1 ring-blue-200 ${activeCitation?.id === citation.id ? 'ring-2 ring-blue-400 bg-blue-100' : ''}` }`} > <Quote className="w-3 h-3 mr-1 opacity-70" /> {citationTitle} </button> ); }
                                return <span key={idx}>{part}</span>;
                             })}
                          </div>
                          {msg.citations && msg.citations.length > 0 && msg.role === 'ai' && ( <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2"> {msg.citations.map(cit => ( <button key={cit.id} onClick={() => setActiveCitation(cit)} className={`text-xs px-2 py-1 rounded-md border transition-colors flex items-center ${ activeCitation?.id === cit.id ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm' }`} > <FileText className="w-3 h-3 mr-1" /> {cit.title} </button> ))} </div> )}
                       </div>
                    </div>
                 </div>
              ))}
              {isChatProcessing && ( <div className="flex justify-start"> <div className="flex flex-row max-w-[85%]"> <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 mr-3 flex items-center justify-center mt-1"> <Sparkles className="w-4 h-4" /> </div> <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-slate-500 text-sm"> <Loader2 className="w-4 h-4 animate-spin" /> 正在思考并检索相关文档... </div> </div> </div> )}
           </div>
           <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleChatInputSubmit} className="relative max-w-3xl mx-auto">
                 <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="询问关于项目文档、需求或架构的问题..." className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm" />
                 <button type="submit" disabled={!chatInput.trim() || isChatProcessing} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" > <Send className="w-4 h-4" /> </button>
              </form>
              <div className="text-center mt-2 text-[10px] text-slate-400"> AI 可能会产生不准确的信息，请核对重要文档。 </div>
           </div>
        </div>
        {activeCitation && (
           <div className="w-1/2 bg-white flex flex-col shadow-xl z-10 animate-in slide-in-from-right-10 duration-200 border-l border-slate-200">
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/50">
                 <div className="flex items-center gap-2 overflow-hidden"> <FileText className="w-5 h-5 text-primary-600" /> <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={activeCitation.title}>{activeCitation.title}</span> </div>
                 <button onClick={() => setActiveCitation(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"> <X className="w-5 h-5" /> </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div> <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">来源信息</span> <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600"> <div className="bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center"> <Database className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {activeCitation.sourceName || '未知数据源'} </div> <div className="bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center"> <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {new Date().toLocaleDateString()} </div> </div> </div>
                 <div> <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">引用内容片段</span> <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-slate-700 text-sm leading-relaxed italic rounded-r-md relative"> <Quote className="w-8 h-8 text-blue-200 absolute top-2 right-2 opacity-50" /> "{activeCitation.snippet}" </div> </div>
                 <div> <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">文档预览</span> <div className="prose prose-sm prose-slate max-w-none border border-slate-100 rounded-lg p-4 bg-slate-50/50 shadow-inner max-h-64 overflow-y-auto"> <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs">{documents.find(d => d.id === activeCitation?.docId)?.content || "暂无详细内容..."}</pre> </div> <div className="mt-4 flex justify-end"> <Button size="sm" variant="secondary" onClick={() => { setActiveCitation(null); setSelectedDocId(activeCitation!.docId); }} > <Eye className="w-4 h-4 mr-1" /> 打开完整文档 </Button> </div> </div>
              </div>
           </div>
        )}
      </div>
    );
  };

  // Document Viewer (Keep existing logic)
  if (selectedDoc) {
    // ... (Exact same viewer code as before, omitted to save space but assumed preserved)
     const isParsed = selectedDoc.parsingStatus === 'completed';
    const isNormalized = selectedDoc.normalizationStatus === 'completed';
    return (
      <div className="h-[calc(100vh-64px)] bg-white flex flex-col">
        <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0 z-10">
          <div className="flex items-center overflow-hidden">
             <button onClick={() => setSelectedDocId(null)} className="mr-4 p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors" title="Back to list" > <ArrowLeft className="w-5 h-5" /> </button>
             <div className="flex flex-col"> <div className="flex items-center gap-2"> <h2 className="text-sm font-semibold text-slate-900 truncate max-w-md"> {isGitRepo ? (repoFilePath || selectedDoc.title) : selectedDoc.title} </h2> {isParsed && selectedDoc.semanticType && ( <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"> {selectedDoc.semanticType} </span> )} </div> <span className="text-xs text-slate-500 truncate"> {selectedSource?.name} {selectedDoc.path ? `• ${selectedDoc.path}` : ''} </span> </div>
          </div>
          <div className="flex items-center gap-2"> <div className="flex rounded-md bg-slate-100 p-0.5 mr-2"> <button onClick={() => setViewMode('raw')} className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${viewMode === 'raw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} > <FileText className="w-3 h-3" /> 源文件 </button> {isParsed && ( <button onClick={() => setViewMode('parsed')} className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${viewMode === 'parsed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} > <FileJson className="w-3 h-3" /> 解析结果 </button> )} {isNormalized && ( <button onClick={() => setViewMode('split')} className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${viewMode === 'split' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} > <Columns className="w-3 h-3" /> 规范化视图 </button> )} </div> <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${ selectedDoc.fileType === 'bug' ? 'bg-red-50 text-red-600' : selectedDoc.fileType === 'epic' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600' }`}> {isGitRepo ? (repoFilePath?.split('.').pop() || 'git') : selectedDoc.fileType} </span> </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {isGitRepo && fileTree && viewMode === 'raw' && ( <div className="w-72 border-r border-slate-200 bg-slate-50 overflow-y-auto flex flex-col shrink-0"> <div className="p-3 border-b border-slate-200 bg-slate-100/50 text-xs font-medium text-slate-500 uppercase tracking-wider sticky top-0 z-10"> {selectedDoc.title} </div> <div className="p-2"> {(Object.values(fileTree) as TreeNode[]) .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)) .map(node => ( <FileTreeNode key={node.path} node={node} depth={0} selectedId={repoFilePath || ''} onSelect={setRepoFilePath} /> ))} </div> </div> )}
          {viewMode === 'split' && isNormalized && ( <div className="w-1/3 min-w-[300px] border-r border-slate-200 bg-slate-50 overflow-y-auto flex flex-col"> <div className="p-3 border-b border-slate-200 bg-white text-xs font-medium text-slate-500 uppercase tracking-wider sticky top-0 z-10 flex justify-between items-center"> <span>规范化条目 ({selectedDoc.normalizedItems?.length})</span> <CheckCircle className="w-4 h-4 text-green-500" /> </div> <div className="p-4 space-y-3"> {selectedDoc.normalizedItems?.map((item) => ( <div key={item.id} onClick={() => setHighlightedItemId(item.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${ highlightedItemId === item.id ? 'bg-primary-50 border-primary-300 shadow-sm ring-1 ring-primary-200' : 'bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm' }`} > <div className="flex items-start justify-between mb-1"> <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"> {item.category} </span> </div> <p className="text-sm text-slate-800 leading-relaxed"> {item.content} </p> </div> ))} </div> </div> )}
          <div className="flex-1 overflow-y-auto bg-white relative">
             {viewMode === 'parsed' && isParsed && selectedDoc.parsedContent ? ( <div className="max-w-4xl mx-auto py-12 px-8"> {renderParsedContent(selectedDoc.parsedContent)} </div> ) : viewMode === 'split' && isNormalized && selectedDoc.parsedContent ? ( <div className="mx-auto py-12 px-8 max-w-none"> <div className="mb-4 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2"> 解析后内容 </div> {renderParsedContent(selectedDoc.parsedContent)} </div> ) : ( isGitRepo && viewMode === 'raw' ? ( <div className="min-h-full"> <div className="flex min-h-full"> <div className="bg-slate-50 border-r border-slate-100 py-4 px-2 text-right text-xs text-slate-300 font-mono select-none"> {getMockCodeContent(repoFilePath || 'README.md').split('\n').map((_, i) => ( <div key={i} className="leading-6">{i + 1}</div> ))} </div> <div className="flex-1 py-4 px-6 overflow-x-auto"> <pre className="text-sm font-mono text-slate-800 leading-6 whitespace-pre"> {getMockCodeContent(repoFilePath || 'README.md')} </pre> </div> </div> </div> ) : ( <div className="mx-auto py-12 px-8 max-w-4xl"> <div className="prose prose-slate max-w-none"> <pre className="whitespace-pre-wrap font-sans text-base text-slate-700 bg-transparent border-none p-0"> {selectedDoc.content} </pre> </div> </div> ) )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
       {/* Sidebar */}
       <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
             <button 
                onClick={() => navigate('/')} 
                className="flex items-center text-sm text-slate-500 hover:text-primary-600 transition-colors mb-3"
             >
                <ArrowLeft className="w-4 h-4 mr-1" /> 返回列表
             </button>
             
             <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                  !isProject 
                    ? 'bg-indigo-50 text-indigo-700 ring-indigo-700/10' 
                    : 'bg-blue-50 text-blue-700 ring-blue-700/10'
                }`}>
                  {!isProject ? <Book className="mr-1 w-3 h-3" /> : <Folder className="mr-1 w-3 h-3" />}
                  {project.type}
                </span>
             </div>
             <h2 className="font-bold text-slate-800 text-lg truncate" title={project.name}>{project.name}</h2>
          </div>
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {currentMenuItems.map(item => (
                  <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === item.id
                          ? isProject ? 'bg-primary-50 text-primary-700' : 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                      <span className="mr-3 text-current opacity-80">{item.icon}</span>
                      {item.label}
                  </button>
              ))}
          </nav>
       </div>

       {/* Content */}
       <div className="flex-1 bg-slate-50 overflow-hidden">
          {/* Knowledge Base Overview */}
          {!isProject && activeTab === 'overview' && renderKbOverview()}
          
          {/* Project Dashboard */}
          {isProject && activeTab === 'dashboard' && (
             <TraceabilityView 
                isDashboard={true} 
                dashboardGraph={dashboardGraph}
                records={[]} 
                documents={documents}
                onAddRecord={() => {}}
                onUpdateRecord={() => {}}
                onDeleteRecord={() => {}}
                onSearchQuery={handleDashboardSearch}
             />
          )}

          {/* Shared Views */}
          {activeTab === 'chat' && renderChatView()}

          {isProject && activeTab === 'traceability' && (
             <TraceabilityView 
                documents={visibleDocuments}
                records={traceabilityRecords}
                onAddRecord={handleAddRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
             />
          )}

          {/* Documents / Assets Management */}
          {(activeTab === 'documents' || activeTab === 'datasource') && (
              <div className="max-w-5xl mx-auto p-8 h-full overflow-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {activeTab === 'datasource' ? (isProject ? '数据源管理' : '数据连接') : (isProject ? '文档管理' : '知识资产')}
                    </h1>
                    {activeTab === 'datasource' && (
                       <Button onClick={() => setIsAddSourceModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                          {isProject ? '添加数据源' : '新建连接'}
                       </Button>
                    )}
                  </div>
                  
                  {activeTab === 'datasource' ? (
                     dataSources.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {dataSources.map(ds => (
                            <div 
                              key={ds.id} 
                              onClick={() => setManagingSource(ds)}
                              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer hover:border-primary-200 group"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${
                                  ds.type === 'git' ? 'bg-slate-100 text-slate-700' :
                                  ds.type === 'jira' ? 'bg-blue-50 text-blue-600' :
                                  'bg-orange-50 text-orange-600'
                                }`}>
                                  {getSourceIcon(ds.type)}
                                </div>
                                <div className="flex gap-1">
                                   <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md" title="同步"> <RefreshCw className="w-4 h-4" /> </button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDeleteSource(ds.id); }} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md" title="删除"> <Trash2 className="w-4 h-4" /> </button>
                                </div>
                              </div>
                              <h3 className="font-semibold text-slate-900 mb-1 truncate group-hover:text-primary-600">{ds.name}</h3>
                              <p className="text-xs text-slate-500 mb-3 truncate" title={ds.config}> {ds.config || '无配置信息'} </p>
                              {ds.type === 'git' && ds.details?.branch && ( <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 mb-3"> Branch: {ds.details.branch} </span> )}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs"> <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"> <CheckCircle className="w-3 h-3 mr-1" /> 已同步 </span> <span className="text-slate-400"> {new Date(ds.lastSync).toLocaleTimeString()} </span> </div>
                            </div>
                          ))}
                        </div>
                     ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6"> <Database className="w-10 h-10 text-slate-400" /> </div>
                            <h3 className="text-lg font-semibold text-slate-900">暂无数据连接</h3>
                            <p className="mt-2 text-slate-500 max-w-sm mx-auto mb-8"> 连接 Git、Jira 或上传本地文件，系统将自动索引知识内容。 </p>
                            <Button onClick={() => setIsAddSourceModalOpen(true)}> <span className="flex items-center"> <span className="text-lg mr-1">+</span> 新建连接 </span> </Button>
                        </div>
                     )
                  ) : (
                    visibleDocuments.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">文档名称</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">智能归类</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">来源</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">解析状态</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">规范化状态</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {visibleDocuments.map((doc) => {
                                const source = dataSources.find(ds => ds.id === doc.sourceId);
                                const isParsed = doc.parsingStatus === 'completed';
                                return (
                                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedDocId(doc.id)} >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {doc.fileType === 'git-repo' ? ( <Github className="w-4 h-4 text-slate-400 mr-3" /> ) : doc.fileType === 'epic' || doc.fileType === 'story' || doc.fileType === 'bug' || doc.fileType === 'task' ? ( <LayoutList className="w-4 h-4 text-slate-400 mr-3" /> ) : ( <FileText className="w-4 h-4 text-slate-400 mr-3" /> )}
                                        <div className="text-sm font-medium text-slate-900 hover:text-primary-600">{doc.title}</div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ doc.fileType === 'bug' ? 'bg-red-50 text-red-700' : doc.fileType === 'epic' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600' }`}> {doc.fileType.toUpperCase()} </span> </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> {isParsed && doc.semanticType ? ( <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"> <BrainCircuit className="w-3 h-3 mr-1" /> {doc.semanticType} </span> ) : ( <span className="text-slate-300 text-xs">-</span> )} </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> <div className="flex items-center text-sm text-slate-500"> {source ? ( <> <span className="mr-2">{getSourceIcon(source.type)}</span> {source.name} </> ) : ( <span className="text-slate-400 italic">源已删除</span> )} </div> </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> {doc.parsingStatus === 'completed' ? ( <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"> <CheckCircle className="w-3 h-3 mr-1" /> 已解析 </span> ) : doc.parsingStatus === 'processing' ? ( <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"> <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 解析中 </span> ) : ( <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-500/10"> 未解析 </span> )} </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> {doc.normalizationStatus === 'completed' ? ( <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"> <CheckCircle className="w-3 h-3 mr-1" /> 已规范化 </span> ) : doc.normalizationStatus === 'processing' ? ( <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"> <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 处理中 </span> ) : ( <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-500/10"> 未处理 </span> )} </td>
                                    <td className="px-6 py-4 whitespace-nowrap"> <div className="flex items-center gap-2"> <button onClick={(e) => { e.stopPropagation(); if(doc.parsingStatus !== 'processing') handleParse(doc.id); }} disabled={doc.parsingStatus === 'processing'} className={`p-1.5 rounded-md transition-colors flex items-center text-xs font-medium border ${ doc.parsingStatus === 'processing' ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-primary-600' }`} title="智能解析" > <FileJson className="w-3.5 h-3.5 mr-1" /> {doc.parsingStatus === 'completed' ? '重新解析' : '解析'} </button> <button onClick={(e) => { e.stopPropagation(); if(isParsed && doc.normalizationStatus !== 'processing') handleNormalize(doc.id); }} disabled={!isParsed || doc.normalizationStatus === 'processing'} className={`p-1.5 rounded-md transition-colors flex items-center text-xs font-medium border ${ !isParsed || doc.normalizationStatus === 'processing' ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-primary-600 border-slate-200 hover:bg-primary-50 hover:border-primary-200' }`} title="规范化文档" > <Sparkles className="w-3.5 h-3.5 mr-1" /> {doc.normalizationStatus === 'completed' ? '重做' : '规范化'} </button> </div> </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6"> <FileText className="w-10 h-10 text-slate-400" /> </div>
                          <h3 className="text-lg font-semibold text-slate-900">暂无文档</h3>
                          <p className="mt-2 text-slate-500 max-w-sm mx-auto mb-8"> {documents.length > 0 ? "当前所有文档均已被禁用，请在数据源管理中启用。" : "请先新建连接，系统将自动索引文档。"} </p>
                          <Button onClick={() => setActiveTab('datasource')}> 前往新建连接 </Button>
                      </div>
                    )
                  )
                }
              </div>
          )}
       </div>

       {/* Add Data Source Modal */}
       <Modal isOpen={isAddSourceModalOpen} onClose={closeAddSourceModal} title={isProject ? "添加数据源" : "连接知识来源"} > {renderAddSourceContent()} </Modal>

       {/* Manage Source Modal */}
       <Modal isOpen={!!managingSource} onClose={() => setManagingSource(null)} title={`管理数据: ${managingSource?.name}`} > 
         <div className="space-y-4">
           <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4"> <div className="flex items-center"> {managingSource && getSourceIcon(managingSource.type)} <span className="ml-2 font-medium">{managingSource?.type.toUpperCase()}</span> <span className="mx-2">•</span> <span>{managingSource?.config}</span> </div> <span className="text-xs text-slate-400">ID: {managingSource?.id.slice(-6)}</span> </div>
           <div className="border-t border-slate-100 pt-4">
             <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center justify-between"> <span>包含文档</span> <span className="text-xs font-normal text-slate-500"> 启用状态决定文档是否显示在列表中 </span> </h4>
             <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
               {documents.filter(d => d.sourceId === managingSource?.id).map(doc => ( <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50"> <div className="flex items-center overflow-hidden mr-3"> <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg mr-3 ${ doc.enabled !== false ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400' }`}> {doc.fileType === 'git-repo' ? <Github className="w-4 h-4" /> : <FileText className="w-4 h-4" />} </span> <div className="truncate"> <p className={`text-sm font-medium truncate ${doc.enabled !== false ? 'text-slate-900' : 'text-slate-400'}`}> {doc.title} </p> <p className="text-xs text-slate-400 truncate">{doc.fileType}</p> </div> </div> <button onClick={() => handleToggleDocEnabled(doc.id)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${ doc.enabled !== false ? 'bg-primary-600' : 'bg-slate-200' }`} role="switch" aria-checked={doc.enabled !== false} > <span className="sr-only">Use setting</span> <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ doc.enabled !== false ? 'translate-x-5' : 'translate-x-0' }`} /> </button> </div> ))}
               {documents.filter(d => d.sourceId === managingSource?.id).length === 0 && ( <div className="p-8 text-center text-slate-400 text-sm"> 此数据源下暂无文档。 </div> )}
             </div>
           </div>
           <div className="pt-4 flex justify-end"> <Button onClick={() => setManagingSource(null)}>完成</Button> </div>
         </div>
       </Modal>
    </div>
  );
};
