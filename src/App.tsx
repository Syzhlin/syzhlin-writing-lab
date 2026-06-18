import React, { useState, useEffect } from "react";
import { 
  INITIAL_PROJECTS, 
  INITIAL_CHAPTERS, 
  INITIAL_EXPORTS, 
  BookProject, 
  Chapter, 
  ExportLog, 
  ProjectStatus 
} from "./types";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import BookProjects from "./components/BookProjects";
import BookDetail from "./components/BookDetail";
import WritingEditor from "./components/WritingEditor";
import RevisionLab from "./components/RevisionLab";
import Archive from "./components/Archive";
import SettingsModal from "./components/SettingsModal";
import { Sparkles, FileText, CheckCircle, Waves } from "lucide-react";

export default function App() {
  // Views navigation
  const [view, setView] = useState<string>("home");

  // Core Persistent State
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);

  // Selected Entities
  const [selectedProjectId, setSelectedProjectId] = useState<string>("proj-1");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Settings & OAuth
  const [gdocsLinked, setGdocsLinked] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [dailyGoal, setDailyGoal] = useState<number>(1000);

  // Load from local storage
  useEffect(() => {
    const savedProj = localStorage.getItem("syzhlin_projects");
    const savedChaps = localStorage.getItem("syzhlin_chapters");
    const savedLogs = localStorage.getItem("syzhlin_exports");

    if (savedProj && savedChaps) {
      setProjects(JSON.parse(savedProj));
      setChapters(JSON.parse(savedChaps));
    } else {
      // Seed initial sample data so the workspace looks pristine
      setProjects(INITIAL_PROJECTS);
      setChapters(INITIAL_CHAPTERS);
      localStorage.setItem("syzhlin_projects", JSON.stringify(INITIAL_PROJECTS));
      localStorage.setItem("syzhlin_chapters", JSON.stringify(INITIAL_CHAPTERS));
    }

    if (savedLogs) {
      setExportLogs(JSON.parse(savedLogs));
    } else {
      setExportLogs(INITIAL_EXPORTS);
      localStorage.setItem("syzhlin_exports", JSON.stringify(INITIAL_EXPORTS));
    }
  }, []);

  // Update selected Chapter default
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      const firstProjChapter = chapters.find(c => c.bookId === selectedProjectId);
      if (firstProjChapter) {
        setSelectedChapterId(firstProjChapter.id);
      }
    }
  }, [chapters, selectedProjectId, selectedChapterId]);

  // Save to local storage helpers
  const saveProjects = (updt: BookProject[]) => {
    setProjects(updt);
    localStorage.setItem("syzhlin_projects", JSON.stringify(updt));
  };

  const saveChapters = (updt: Chapter[]) => {
    setChapters(updt);
    localStorage.setItem("syzhlin_chapters", JSON.stringify(updt));

    // Also update word counts in Projects
    const updatedProjects = projects.map((p) => {
      const bookChaps = updt.filter((c) => c.bookId === p.id);
      const totalWords = bookChaps.reduce((acc, curr) => acc + curr.wordCount, 0);
      return {
        ...p,
        currentWordCount: totalWords,
        updatedAt: new Date().toISOString()
      };
    });
    saveProjects(updatedProjects);
  };

  const saveExportLogs = (updt: ExportLog[]) => {
    setExportLogs(updt);
    localStorage.setItem("syzhlin_exports", JSON.stringify(updt));
  };

  // Create book project
  const handleCreateProject = (newProj: Omit<BookProject, "id" | "createdAt" | "updatedAt" | "currentWordCount">) => {
    const id = `proj-${Date.now()}`;
    const entry: BookProject = {
      ...newProj,
      id,
      currentWordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = [...projects, entry];
    saveProjects(updatedProjects);

    // Auto generate Prologue chapter inside the new project to greet them
    const prologue: Chapter = {
      id: `chap-${Date.now()}`,
      bookId: id,
      title: "Chapter 1. 프롤로그",
      order: 1,
      summary: "책의 문을 여기 전, 독자에게 전하는 첫 서론.",
      content: "",
      status: "작성 전",
      wordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      note: "이 챕터의 핵심 기획과 분위기를 조율하여 써주세요."
    };

    saveChapters([...chapters, prologue]);
    setSelectedProjectId(id);
    setSelectedChapterId(prologue.id);
    setView("project-detail");
  };

  // Add chapter to active book
  const handleAddChapter = (title: string, summary: string) => {
    const bookChapters = chapters.filter(c => c.bookId === selectedProjectId);
    const nextOrder = bookChapters.length > 0 ? Math.max(...bookChapters.map(c => c.order)) + 1 : 1;

    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      bookId: selectedProjectId,
      title: title,
      order: nextOrder,
      summary: summary,
      content: "",
      status: "작성 전",
      wordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveChapters([...chapters, newChapter]);
  };

  // Delete chapter from project catalog
  const handleDeleteChapter = (chapterId: string) => {
    const updated = chapters.filter(c => c.id !== chapterId);
    saveChapters(updated);
    if (selectedChapterId === chapterId) {
      setSelectedChapterId(null);
    }
  };

  // Move chapters order up-down
  const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
    const bookChaps = [...chapters].filter((c) => c.bookId === selectedProjectId).sort((a, b) => a.order - b.order);
    const index = bookChaps.findIndex((c) => c.id === chapterId);

    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === bookChaps.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const tempOrder = bookChaps[index].order;
    bookChaps[index].order = bookChaps[targetIndex].order;
    bookChaps[targetIndex].order = tempOrder;

    const remainingChaps = chapters.filter((c) => c.bookId !== selectedProjectId);
    saveChapters([...remainingChaps, ...bookChaps]);
  };

  // Save/Update active chapter content
  const handleUpdateChapterContent = (chapterId: string, content: string, note?: string) => {
    const revisedChapters = chapters.map((c) => {
      if (c.id === chapterId) {
        const charCount = content.length;
        let updateStatus: "작성 전" | "초안 작성 중" | "작성 완료" = "초안 작성 중";
        if (charCount === 0) {
          updateStatus = "작성 전";
        } else if (charCount > 200) {
          updateStatus = "작성 완료";
        }

        return {
          ...c,
          content,
          wordCount: charCount,
          status: updateStatus,
          note: note !== undefined ? note : c.note,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    saveChapters(revisedChapters);
  };

  // Export Chapter to Google Docs (replicates cloud synchronization)
  const handleExportToGDocs = (chapterId: string) => {
    const chap = chapters.find((c) => c.id === chapterId);
    const proj = projects.find((p) => p.id === chap?.bookId);

    if (!chap || !proj) return;

    if (!gdocsLinked) {
      const integrate = window.confirm("Google Docs 연동이 해제되어 있습니다.\n구글 드라이브와 실시간으로 동기화하려면 먼저 설정을 완료해 주세요. 연동하시겠습니까?");
      if (integrate) {
        setGdocsLinked(true);
      }
      return;
    }

    // Generate output file identifier
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // e.g. "260618"
    const cleanedTitle = proj.title.replace(/\s+/g, "");
    const cleanedChapTitle = chap.title.replace(/\s+/g, "");
    const documentTitle = `${dateStr}_${cleanedTitle}_${cleanedChapTitle}`;
    
    const docId = `gdocs-${Date.now()}`;
    const newLog: ExportLog = {
      id: `log-${Date.now()}`,
      bookId: proj.id,
      chapterId: chap.id,
      provider: "google_docs",
      documentTitle,
      documentUrl: `https://docs.google.com/document/d/${docId}/edit`,
      exportedAt: new Date().toISOString(),
    };

    saveExportLogs([newLog, ...exportLogs]);
    alert(`[Google Docs 내보내기 성공]\n\n원고가 성공적으로 구글 드라이브로 백업되었습니다!\n\n파일명: ${documentTitle}\n(원고 보관함에서 확인 가능)`);
  };

  // Route back from quick landing actions
  const handleHeroAction = (action: "write-today" | "continue" | "polish") => {
    if (action === "write-today" || action === "continue") {
      const activeChaps = chapters.filter(c => c.bookId === selectedProjectId);
      const firstIncomp = activeChaps.find(c => c.status !== "작성 완료") || activeChaps[0] || chapters[0];
      if (firstIncomp) {
        setSelectedChapterId(firstIncomp.id);
      }
      setView("editor");
    } else if (action === "polish") {
      setView("revisions");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-slate-800 flex flex-col font-sans selection:bg-teal-100 antialiased selection:text-teal-900">
      
      {/* Universal Sticky Header Nav */}
      <Header
        currentView={view}
        onViewChange={(v) => setView(v)}
        gdocsLinked={gdocsLinked}
        onToggleGdocs={() => setGdocsLinked(!gdocsLinked)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Workspace Frame container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {view === "home" && (
          <HeroSection
            projects={projects}
            chapters={chapters.filter(c => c.bookId === selectedProjectId)}
            exportLogs={exportLogs}
            gdocsLinked={gdocsLinked}
            onActionClick={handleHeroAction}
            onViewChange={(v) => setView(v)}
            onSelectChapter={(id) => setSelectedChapterId(id)}
            onExportToGDocs={handleExportToGDocs}
          />
        )}

        {view === "projects" && (
          <BookProjects
            projects={projects}
            onCreateProject={handleCreateProject}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setView("project-detail");
            }}
          />
        )}

        {view === "project-detail" && (
          (() => {
            const activeProj = projects.find(p => p.id === selectedProjectId) || projects[0];
            return activeProj ? (
              <BookDetail
                project={activeProj}
                chapters={chapters.filter((c) => c.bookId === selectedProjectId)}
                onBack={() => setView("projects")}
                onAddChapter={handleAddChapter}
                onDeleteChapter={handleDeleteChapter}
                onMoveChapter={handleMoveChapter}
                onSelectChapter={(id) => setSelectedChapterId(id)}
                onViewChange={(v) => setView(v)}
              />
            ) : (
              <div className="text-center py-20 text-slate-400">책을 준비하기 오류</div>
            );
          })()
        )}

        {view === "editor" && (
          <WritingEditor
            projects={projects}
            chapters={chapters.filter((c) => c.bookId === selectedProjectId)}
            selectedChapterId={selectedChapterId}
            onSelectChapter={(id) => setSelectedChapterId(id)}
            onUpdateChapterContent={handleUpdateChapterContent}
            onExportToGDocs={handleExportToGDocs}
            onViewChange={(v) => setView(v)}
          />
        )}

        {view === "revisions" && (
          <RevisionLab
            chapters={chapters.filter((c) => c.bookId === selectedProjectId && c.status !== "작성 전")}
            selectedChapterId={selectedChapterId}
            onUpdateChapterContent={handleUpdateChapterContent}
          />
        )}

        {view === "archive" && (
          <Archive
            projects={projects}
            chapters={chapters}
            exportLogs={exportLogs}
            onDeleteChapter={handleDeleteChapter}
            onSelectChapter={(id) => {
              setSelectedChapterId(id);
              const chap = chapters.find(c => c.id === id);
              if (chap) setSelectedProjectId(chap.bookId);
            }}
            onViewChange={(v) => setView(v)}
            onExportToGDocs={handleExportToGDocs}
          />
        )}

      </main>

      {/* Environmental configuration setting Dialog */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          gdocsLinked={gdocsLinked}
          onToggleGdocs={() => setGdocsLinked(!gdocsLinked)}
          userEmail="studywithseijin@gmail.com"
          defaultGoal={dailyGoal}
          onSaveConfig={(goal, autoSave) => {
            setDailyGoal(goal);
          }}
        />
      )}

      {/* Universal ambient desktop footer */}
      <footer className="py-8 bg-slate-100/50 border-t border-cyan-100/30 text-center text-[11px] text-slate-400 space-y-1 mt-12 font-sans select-none pointer-events-none">
        <div className="flex items-center justify-center space-x-2 text-slate-400">
          <Waves className="w-3.5 h-3.5 text-cyan-300" />
          <span>Syzhlin Writing Lab &copy; 2026. 나만의 바다 집필실</span>
        </div>
        <p>고요함 속에 정제되고 영감을 통해 한 권의 책으로 결실을 맺는 작가실</p>
      </footer>
    </div>
  );
}
