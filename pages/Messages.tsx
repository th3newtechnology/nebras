
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  Search, 
  User, 
  ShieldCheck, 
  Clock, 
  Paperclip, 
  Mic, 
  Sparkles, 
  MoreVertical,
  ChevronLeft,
  Circle,
  CheckCheck,
  Loader2,
  Lock
} from 'lucide-react';
import { useLocalCollection, addLocalData, updateLocalData } from '../hooks/useLocalDB';
import { useAuth } from '../context/AuthContext';
import { User as UserType, Message, Conversation, UserRole } from '../types';
import { GoogleGenAI } from "@google/genai";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { data: allMessages, refreshData: refreshMessages } = useLocalCollection('messages');
  const { data: students } = useLocalCollection('students');
  const { data: teachers } = useLocalCollection('teachers');
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // استنتاج المحادثات المتاحة بناءً على الدور
  const contacts = useMemo(() => {
    if (user?.role === UserRole.ADMIN) {
      // الأدمن يرى المعلمين والإدارة
      return teachers.map(t => ({ id: t.id, name: t.name, role: 'معلم' }));
    } else if (user?.role === UserRole.GUARDIAN) {
      // ولي الأمر يرى معلمي أبنائه + الإدارة
      const myChildren = students.filter(s => user.studentIds?.includes(s.id));
      const myTeachersIds = Array.from(new Set(myChildren.map(s => s.teacherId)));
      const myTeachers = teachers.filter(t => myTeachersIds.includes(t.id));
      
      return [
        { id: 'admin', name: 'إدارة المدرسة', role: 'إدارة' },
        ...myTeachers.map(t => ({ id: t.id, name: t.name, role: 'معلم الحلقة' }))
      ];
    }
    return [];
  }, [user, teachers, students]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, activeChatId]);

  const activeMessages = useMemo(() => {
    if (!activeChatId || !user) return [];
    return allMessages.filter(m => 
      (m.senderId === user.id && m.recipientId === activeChatId) ||
      (m.senderId === activeChatId && m.recipientId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [allMessages, activeChatId, user]);

  const handleSendMessage = (content: string = inputText) => {
    if (!content.trim() || !activeChatId || !user) return;

    addLocalData('messages', {
      senderId: user.id,
      recipientId: activeChatId,
      content,
      read: false,
      type: 'text'
    });

    setInputText('');
    refreshMessages();
  };

  const handleAiAssistant = async () => {
    if (!activeChatId) return;
    setIsAiDrafting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contact = contacts.find(c => c.id === activeChatId);
      
      const prompt = `أنت مساعد تعليمي في مدرسة قرآنية. ساعدني في كتابة رسالة مهنية ومحفزة إلى ${contact?.name} (${contact?.role}). 
      سياق الرسالة الحالي: ${inputText || 'تحديث دوري عن مستوى الطالب'}. 
      اكتب الرد باللغة العربية بأسلوب وقور ولطيف.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInputText(response.text || '');
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiDrafting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar: Contacts List */}
      <div className="w-80 border-l border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600 -rotate-12" /> الرسائل
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن محادثة..." 
              className="w-full pr-10 pl-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveChatId(contact.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeChatId === contact.id 
                ? 'bg-white shadow-lg shadow-indigo-600/5 border border-indigo-100 translate-x-[-4px]' 
                : 'hover:bg-white/50 border border-transparent'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${
                  contact.role === 'إدارة' ? 'bg-indigo-600' : 'bg-cyan-600'
                }`}>
                  {contact.name[0]}
                </div>
                <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{contact.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{contact.role}</p>
              </div>
              <ChevronLeft className={`w-4 h-4 transition-all ${activeChatId === contact.id ? 'text-indigo-600' : 'text-slate-200'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {contacts.find(c => c.id === activeChatId)?.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{contacts.find(c => c.id === activeChatId)?.name}</h3>
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold">
                    <Circle className="w-2 h-2 fill-current" /> نشط الآن
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400">تشفير تام للبيانات</span>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
            >
              {activeMessages.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[70%] space-y-1 ${isMine ? 'text-right' : 'text-right'}`}>
                      <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                        isMine 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 text-[9px] font-bold ${isMine ? 'text-indigo-400' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" /> 
                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Send className="w-16 h-16 opacity-10 mb-4" />
                  <p className="font-bold">ابدأ المحادثة الآن بكلمة طيبة</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <footer className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-end gap-4 max-w-4xl mx-auto">
                <div className="flex-1 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm focus-within:border-indigo-500 transition-all flex flex-col gap-2">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full p-3 bg-transparent border-none outline-none resize-none text-sm font-medium min-h-[44px] max-h-32 custom-scrollbar"
                  />
                  <div className="flex items-center justify-between px-3 pb-1">
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      onClick={handleAiAssistant}
                      disabled={isAiDrafting}
                      className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAiDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {isAiDrafting ? 'جاري الصياغة...' : 'تحسين الرد ذكياً'}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendMessage()}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 shrink-0"
                >
                  <Send className="w-6 h-6 -rotate-12 translate-x-[-2px]" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50/30">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-indigo-600 mb-6">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-800">مركز نبراس للمراسلة</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium">اختر محادثة من القائمة للبدء بالتواصل</p>
          </div>
        )}
      </div>

    </div>
  );
};

// Re-using MessageCircle icon
const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);

export default Messages;
