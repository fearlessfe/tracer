import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData, ProjectType, Member } from '../types';
import { Button } from './Button';
import { Sparkles, X } from 'lucide-react';
import { generateProjectDescription } from '../services/geminiService';

// Mock Available Users
const AVAILABLE_USERS = [
  { id: 'u1', name: '张三' },
  { id: 'u2', name: '李四' },
  { id: 'u3', name: '王五' },
  { id: 'u4', name: '赵六' },
  { id: 'u5', name: 'Sarah Wilson' },
  { id: 'u6', name: 'Mike Brown' },
  { id: 'u7', name: 'Emily Chen' },
  { id: 'u8', name: 'David Lee' },
];

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<ProjectType>(initialData?.type || ProjectType.Project);
  const [members, setMembers] = useState<Member[]>(initialData?.members || []);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      type,
      members,
    });
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
      const userToAdd = AVAILABLE_USERS.find(u => u.id === userId);
      if (userToAdd && !members.some(m => m.id === userToAdd.id)) {
        const newMember: Member = {
          id: userToAdd.id,
          name: userToAdd.name,
        };
        setMembers([...members, newMember]);
      }
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleAiGenerate = async () => {
    if (!name) return;
    setIsGenerating(true);
    try {
      const desc = await generateProjectDescription(name, type);
      setDescription(desc);
    } catch (error) {
      alert("生成描述失败，请检查 API Key 配置或网络连接。");
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter out users who are already members
  const availableOptions = AVAILABLE_USERS.filter(
    user => !members.some(member => member.id === user.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
          项目名称 <span className="text-red-500">*</span>
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="输入项目名称..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium leading-6 text-slate-900">
          项目类型
        </label>
        <div className="mt-2">
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          >
            <option value={ProjectType.Project}>{ProjectType.Project}</option>
            <option value={ProjectType.KnowledgeBase}>{ProjectType.KnowledgeBase}</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">
            描述
          </label>
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={isGenerating || !name}
            className="text-xs flex items-center text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="animate-pulse">思考中...</span>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                AI 智能生成
              </>
            )}
          </button>
        </div>
        <div className="mt-2">
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="描述项目的目标..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-slate-900">
          项目成员
        </label>
        <div className="mt-2">
          <select
            value=""
            onChange={handleMemberChange}
            className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          >
            <option value="" disabled>选择成员添加到项目...</option>
            {availableOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
             {availableOptions.length === 0 && (
                <option value="" disabled>所有成员已添加</option>
             )}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {members.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
            >
              {member.name}
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
              >
                <span className="sr-only">Remove {member.name}</span>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {members.length === 0 && (
            <span className="text-sm text-slate-400 italic">暂无成员</span>
          )}
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <Button type="submit" className="w-full sm:col-start-2">
          {initialData ? '保存修改' : '创建项目'}
        </Button>
        <Button type="button" variant="secondary" className="mt-3 w-full sm:mt-0 sm:col-start-1" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
};
