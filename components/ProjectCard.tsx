import React from 'react';
import { Project, ProjectType } from '../types';
import { Edit2, Trash2, Book, Folder, Users, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onClick }) => {
  const isKb = project.type === ProjectType.KnowledgeBase;

  return (
    <div 
      onClick={() => onClick(project)}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary-200 cursor-pointer"
    >
      <div className={`absolute top-0 left-0 h-1 w-full ${isKb ? 'bg-indigo-500' : 'bg-primary-500'}`} />
      
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              isKb 
                ? 'bg-indigo-50 text-indigo-700 ring-indigo-700/10' 
                : 'bg-blue-50 text-blue-700 ring-blue-700/10'
            }`}>
              {isKb ? <Book className="mr-1 w-3 h-3" /> : <Folder className="mr-1 w-3 h-3" />}
              {project.type}
            </span>
          </div>
          
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600"
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 line-clamp-1">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-3 leading-relaxed">
          {project.description || <span className="italic text-slate-400">暂无描述</span>}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center text-xs text-slate-500">
            <Users className="mr-1.5 w-4 h-4 text-slate-400" />
            <span>{project.members.length} 成员</span>
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="mr-1.5 w-3.5 h-3.5" />
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>
        
        {/* Member Avatars Preview */}
        {project.members.length > 0 && (
          <div className="mt-3 flex -space-x-2 overflow-hidden">
            {project.members.slice(0, 4).map((member) => (
              <div 
                key={member.id}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-white"
                title={member.name}
              >
                <img
                  className="h-full w-full rounded-full bg-slate-100 object-cover"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&size=32`}
                  alt={member.name}
                />
              </div>
            ))}
            {project.members.length > 4 && (
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-medium text-slate-500">
                +{project.members.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};