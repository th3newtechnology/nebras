import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  Search, 
  User, 
  Clock, 
  Sparkles, 
  CheckCheck, 
  Loader2, 
  Lock, 
  Phone, 
  MessageSquare, 
  BookOpen, 
  AlertCircle, 
  Award, 
  RefreshCw, 
  Bell, 
  Circle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchChatContacts, 
  fetchMessages, 
  sendChatMessage, 
  generateDraftMessage,
  markMessagesAsRead,
  PEDAGOGICAL_TEMPLATES,
} from '../lib/messagesService';
import { ChatMessage, ContactItem } from '../types/communication.types';
import { GoogleGenAI } from "@google/genai";

const Messages: React.FC = () => {
  const { user } = useAuth();
  
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id || 'current-user';

  // تحميل جهات الاتصال عند البداية
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const { contacts: loadedContacts } = await fetchChatContacts(user?.role, currentUserId);
      setContacts(loadedContacts);
      if (loadedContacts.length > 0 && !activeContactId) {
        setActiveContactId(loadedContacts[0].id);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // جلب رسائل المحادثة النشطة عند تغييرها
  useEffect(() => {
    if (!activeContactId) return;

    let isMounted = true;
    const loadConversation = async () => {
      setIsLoadingMessages(true);
      try {
        const { messages: loadedMessages } = await fetchMessages(activeContactId, currentUserId);
        if (isMounted) {
          setMessages(loadedMessages);
          await markMessagesAsRead(activeContactId, currentUserId);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [activeContactId, currentUserId]);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // تصفية جهات الاتصال بالبحث
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.roleLabel.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  }, [contacts, searchTerm]);

  // جهة الاتصال النشطة حالياً
  const activeContact = useMemo(() => {
    return contacts.find(c => c.id === activeContactId) || null;
  }, [contacts, activeContactId]);

  // إرسال رسالة
  const handleSendMessage = async (textToSend: string = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !activeContactId || isSending) return;

    setIsSending(true);
    try {
      const res = await sendChatMessage({
        senderId: currentUserId,
        senderRole: user?.role,
        recipientId: activeContactId,
        recipientRole: activeContact?.role,
        content: trimmed,
        messageType: 'text',
        studentId: activeContact?.associatedStudentId,
        studentName: activeContact?.associatedStudentName,
      });

      if (res.success && res.message) {
        setMessages(prev => [...prev, res.message!]);
        setInputText('');
        setShowQuickTemplates(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // إدراج قالب جاهز
  const handleSelectTemplate = (type: 'reminder' | 'compliment' | 'absence_notice' | 'meeting') => {
    const draft = generateDraftMessage(
      type,
      activeContact?.associatedStudentName || (activeContact?.role === 'GUARDIAN' ? activeContact.name.replace('ولي أمر ', '') : '')
    );
    setInputText(draft);
    setShowQuickTemplates(false);
  };

  // المساعد الذكي لصياغة الرسائل
  const handleAiAssistant = async () => {
    if (!activeContact) return;
    setIsAiDrafting(true);

    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY;

    if (!apiKey) {
      // بديل أنيق بدون API key: إنشاء صياغة تربوية وقورة تلقائياً
      const template = generateDraftMessage(
        inputText.includes('غاب') || inputText.includes('تغيب') ? 'absence_notice' :
        inputText.includes('ممتاز') || inputText.includes('أتقن') ? 'compliment' : 'reminder',
        activeContact.name
      );
      setInputText(template);
      setIsAiDrafting(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `أنت مساعد تعليمي وقور في مدرسة نبراس القرآنية التابعة لمسجد إبراهيم الخليل.
ساعدني في كتابة أو تحسين رسالة رسمية وتربوية موجهة إلى: ${activeContact.name} (${activeContact.roleLabel}).
سياق الرسالة الحالي: "${inputText || 'تذكير بمتابعة الحفظ وحضور الحلقات'}".
المطلوب:
1. أن تكون الصياغة باللغة العربية الفصحى الوقورة وبأسلوب إسلامي راقٍ ومحفز.
2. اختصر النص ليكون مناسباً لرسالة محادثة مباشرة (بين 2 إلى 4 أسطر).
3. ابدأ بالسلام والتحية واختم بالدعاء الصالح.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setInputText(response.text.trim());
      }
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback
      setInputText(generateDraftMessage('reminder', activeContact.name));
    } finally {
      setIsAiDrafting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      
      {/* القائمة الجانبية: جهات الاتصال */}
      <div className="w-80 md:w-96 border-l border-slate-100 flex flex-col bg-slate-50/50">
        
        {/* ترويسة البحث */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              مركز المراسلات
            </h2>
            <button
              onClick={loadContacts}
              title="تحديث جهات الاتصال"
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingContacts ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الدور أو الهاتف..." 
              className="w-full pr-10 pl-4 py-2.5 bg-slate-100/80 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>
        </div>
        
        {/* قائمة جهات الاتصال */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-100/50">
          {isLoadingContacts ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-bold">جاري تحميل جهات الاتصال...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <User className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-bold">لا توجد جهات اتصال مطابقة</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = activeContactId === contact.id;
              const isTeacher = contact.role === 'TEACHER';
              const isAdmin = contact.role === 'ADMIN';

              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all text-right ${
                    isSelected 
                      ? 'bg-emerald-50/80 shadow-sm border border-emerald-200/80' 
                      : 'hover:bg-white border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm ${
                      isAdmin 
                        ? 'bg-amber-600' 
                        : isTeacher 
                          ? 'bg-emerald-600' 
                          : 'bg-indigo-600'
                    }`}>
                      {contact.name[0] || 'ن'}
                    </div>
                    <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-slate-800 truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-[10px] text-slate-400 font-medium">{contact.lastMessageTime}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mb-1">
                      {contact.lastMessage || contact.roleLabel}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isAdmin
                          ? 'bg-amber-100 text-amber-800'
                          : isTeacher
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {contact.role === 'ADMIN' ? 'إدارة' : contact.role === 'TEACHER' ? 'معلم' : 'ولي أمر'}
                      </span>
                      {contact.phone && (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {contact.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shrink-0">
                      {contact.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* النافذة الرئيسية للمحادثة */}
      <div className="flex-1 flex flex-col bg-white">
        {activeContact ? (
          <>
            {/* ترويسة المحادثة */}
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                  activeContact.role === 'ADMIN' ? 'bg-amber-600' : activeContact.role === 'TEACHER' ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}>
                  {activeContact.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{activeContact.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                      متصل الآن
                    </span>
                    <span>•</span>
                    <span>{activeContact.roleLabel}</span>
                    {activeContact.phone && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{activeContact.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>محادثة مشفرة وآمنة</span>
                </div>
              </div>
            </header>

            {/* سجل الرسائل */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
            >
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">لا توجد رسائل سابقة مع هذه الجهة</p>
                  <p className="text-xs text-slate-400">ابدأ المحادثة الآن بكلمة طيبة أو تحية مباركة</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                    >
                      <div className={`max-w-[75%] space-y-1 ${isMine ? 'text-left' : 'text-right'}`}>
                        {msg.studentName && (
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              بخصوص الطالب: {msg.studentName}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                          isMine 
                            ? 'bg-emerald-700 text-white rounded-bl-none shadow-sm' 
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-br-none shadow-xs'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium px-1 ${
                          isMine ? 'justify-end text-emerald-600' : 'justify-start text-slate-400'
                        }`}>
                          <Clock className="w-3 h-3 opacity-60" />
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString('ar-DZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isMine && (
                            <span
                              className={`flex items-center gap-0.5 ${msg.isRead ? 'text-blue-500 font-bold' : 'text-slate-300'}`}
                              title={msg.readAt ? `تمت القراءة: ${new Date(msg.readAt).toLocaleTimeString('ar-DZ')}` : msg.isRead ? 'تمت القراءة' : 'تم الإرسال'}
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* شريط الإدخال ومساعد الصياغة الذكي */}
            <footer className="p-4 border-t border-slate-100 bg-white">
              
              {/* شريط القوالب السريعة */}
              {showQuickTemplates && (
                <div className="mb-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      نماذج وقوالب تربوية جاهزة:
                    </span>
                    <button 
                      onClick={() => setShowQuickTemplates(false)}
                      className="text-slate-400 hover:text-slate-600 text-[11px]"
                    >
                      إغلاق ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSelectTemplate('reminder')}
                      className="p-2.5 bg-white rounded-xl border border-emerald-100 text-right hover:border-emerald-500 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 mb-0.5">
                        <Bell className="w-3.5 h-3.5 text-emerald-600" />
                        تذكير بموعد الحلقة
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">تذكير بموعد حلقة القرآن غداً بالمسجد</p>
                    </button>

                    <button
                      onClick={() => handleSelectTemplate('compliment')}
                      className="p-2.5 bg-white rounded-xl border border-emerald-100 text-right hover:border-emerald-500 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 mb-0.5">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        تهنئة بإتقان الحفظ
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">إشادة بتميز الطالب وإتقانه للتسميع</p>
                    </button>

                    <button
                      onClick={() => handleSelectTemplate('absence_notice')}
                      className="p-2.5 bg-white rounded-xl border border-emerald-100 text-right hover:border-emerald-500 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black text-red-800 mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        إشعار غياب ولي الأمر
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">إشعار لتبرير الغياب والتنسيق لتعويض الورد</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="flex-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all flex flex-col gap-2">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="اكتب رسالتك هنا... (اضغط Enter للإرسال، و Shift+Enter لسطر جديد)"
                    className="w-full p-2 bg-transparent border-none outline-none resize-none text-xs sm:text-sm font-medium min-h-[44px] max-h-32 text-slate-800 placeholder-slate-400"
                    rows={2}
                  />

                  <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowQuickTemplates(prev => !prev)}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>قوالب تربوية</span>
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={handleAiAssistant}
                      disabled={isAiDrafting}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-lg text-xs font-black hover:bg-emerald-200/80 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAiDrafting ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{isAiDrafting ? 'جاري الصياغة...' : 'تحسين الرد بالمساعد الذكي'}</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="إرسال"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 -rotate-12 translate-x-[-1px]" />
                  )}
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50/30 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black text-slate-800">بوابة المراسلات المدرسية</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
              اختر أحد المعلمين أو أولياء الأمور من القائمة الجانبية لبدء التواصل والمتابعة
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;