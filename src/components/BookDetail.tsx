import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, PenTool, Sparkles, BookOpen, Clock, Tag } from "lucide-react";
import { BookProject, Chapter, ChapterStatus } from "../types";

interface BookDetailProps {
  project: BookProject;
  chapters: Chapter[];
  onBack: () => void;
  onAddChapter: (title: string, summary: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onMoveChapter: (chapterId: string, direction: "up" | "down") => void;
  onSelectChapter: (chapterId: string) => void;
  onViewChange: (view: string) => void;
}

export default function BookDetail({
  project,
  chapters,
  onBack,
  onAddChapter,
  onDeleteChapter,
  onMoveChapter,
  onSelectChapter,
  onViewChange,
}: BookDetailProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddChapter(newTitle.trim(), newSummary.trim());
    setNewTitle("");
    setNewSummary("");
    setShowAddForm(false);
  };

  // Sort chapters based on their order mapping
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Compute calculated statistics
  const totalCharacters = chapters.reduce((acc, curr) => acc + curr.wordCount, 0);
  const progressPercent = Math.min(100, Math.round((totalCharacters / project.targetWordCount) * 100));

  const getChapterStatusBadge = (status: ChapterStatus) => {
    switch (status) {
      case "작성 완료": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "초안 작성 중": return "bg-sky-50 text-sky-700 border-sky-200";
      case "작성 전": return "bg-slate-50 text-slate-400 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="book-detail-section">
      {/* Return Navigation */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#182A4D] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>책 프로젝트 목록으로 돌아가기</span>
      </button>

      {/* Book Summary Banner Card */}
      <div className="bg-[#182A4D] rounded-3xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-[#86D7E8]/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[9px] bg-[#BFEDEB] text-[#182A4D] px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">
                {project.status}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono tracking-wider">
              작성 개시일: {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight leading-tight">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-xs font-sans text-teal-200 tracking-wider font-semibold uppercase">
                {project.subtitle}
              </p>
            )}
            {project.description && (
              <p className="max-w-2xl text-xs text-slate-300/90 leading-relaxed font-sans">
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div>
              <span className="text-[9px] text-[#7D8798] block uppercase tracking-wider font-bold mb-0.5">총 글자 수</span>
              <span className="text-lg font-serif font-bold">{totalCharacters.toLocaleString()}자</span>
            </div>
            <div>
              <span className="text-[9px] text-[#7D8798] block uppercase tracking-wider font-bold mb-0.5">목표 글자 수</span>
              <span className="text-lg font-serif font-bold text-teal-200">{project.targetWordCount.toLocaleString()}자</span>
            </div>
            <div>
              <span className="text-[9px] text-[#7D8798] block uppercase tracking-wider font-bold mb-0.5">진행도</span>
              <span className="text-lg font-serif font-bold text-[#BFEDEB]">{progressPercent}%</span>
            </div>
            <div>
              <span className="text-[9px] text-[#7D8798] block uppercase tracking-wider font-bold mb-0.5">총 구성 챕터</span>
              <span className="text-lg font-serif font-bold">{chapters.length}개</span>
            </div>
          </div>

          {/* Horizontal progress meter */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#BFEDEB] to-[#86D7E8] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table of contents and chapters manager */}
      <div className="space-y-4" id="table-of-contents">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#182A4D]">책 목차 및 챕터 수립</h3>
            <p className="text-[11px] text-slate-400">순서를 앞뒤로 재설정하거나 각 영역으로 직행해 글을 가공합니다.</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-1.5 border border-[#182A4D] hover:bg-[#182A4D] hover:text-white text-[#182A4D] rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>새 챕터 추가</span>
          </button>
        </div>

        {/* Chapter submission form */}
        {showAddForm && (
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-cyan-100 shadow-sm animate-fade-in">
            <form onSubmit={handleCreateChapter} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">챕터 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: Chapter 3. 밤기포의 하얀 울음소리"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#86D7E8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">챕터 메모 & 집필 지침</label>
                <input
                  type="text"
                  placeholder="예: 밤 바닷가 등대 정경 묘사와 파도 소리에 머금은 쓸쓸한 기억 기입하기"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#86D7E8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#182A4D] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                >
                  생성하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chapters Cards Grid containing up-down controls */}
        <div className="space-y-3">
          {sortedChapters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              아직 정의된 챕터가 없습니다. 우측 상단의 목차 추가 단추를 이용하여 시작해 보세요.
            </div>
          ) : (
            sortedChapters.map((chap, idx) => {
              return (
                <div
                  key={chap.id}
                  className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:border-cyan-150 transition"
                >
                  {/* Left: Move handles and text details */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    {/* Ordering control rail */}
                    <div className="flex flex-col space-y-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                      <button
                        onClick={() => onMoveChapter(chap.id, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:bg-white hover:text-[#182A4D] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="순서 한 칸 올리기"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveChapter(chap.id, "down")}
                        disabled={idx === sortedChapters.length - 1}
                        className="p-1 rounded text-slate-400 hover:bg-white hover:text-[#182A4D] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="순서 한 칸 내리기"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getChapterStatusBadge(chap.status)}`}>
                          {chap.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {chap.wordCount.toLocaleString()} 자 작성됨
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#182A4D]">
                        {chap.title}
                      </h4>

                      {chap.note ? (
                        <p className="text-xs text-[#D6B46A] bg-amber-50/50 px-2.5 py-1 rounded-lg w-max max-w-full truncate font-medium">
                          ✎ {chap.note}
                        </p>
                      ) : (
                        chap.summary && (
                          <p className="text-xs text-slate-400 truncate max-w-full">
                            {chap.summary}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center justify-end space-x-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <button
                      onClick={() => {
                        onSelectChapter(chap.id);
                        onViewChange("editor");
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-slate-50 text-[#182A4D] border border-slate-200 hover:bg-[#182A4D] hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>바로 쓰기</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectChapter(chap.id);
                        onViewChange("revisions");
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100 rounded-xl text-xs font-semibold transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>다듬기</span>
                    </button>

                    <button
                      onClick={() => onDeleteChapter(chap.id)}
                      className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="챕터 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
