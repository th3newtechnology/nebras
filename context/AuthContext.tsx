
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setDemoUser: (isDemo: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => { },
  setDemoUser: () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('nebras_active_user');
    if (savedUserStr) {
      let parsedUser = JSON.parse(savedUserStr);
      // Patch old teacher sessions missing teacherId
      if (parsedUser.role === UserRole.TEACHER && !parsedUser.teacherId) {
        const allTeachersData = JSON.parse(localStorage.getItem('nebras_teachers') || '[]');
        const matchingTeacher = allTeachersData.find((t: any) => t.name === parsedUser.displayName);
        if (matchingTeacher) {
          parsedUser.teacherId = matchingTeacher.id;
          localStorage.setItem('nebras_active_user', JSON.stringify(parsedUser));
        }
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // 1. Check Admin (Mock)
    if (username === 'admin@nebras.edu' && password === 'admin123') {
      const admin: User = {
        id: 'admin-1',
        email: 'admin@nebras.edu',
        displayName: 'مدير النظام',
        role: UserRole.ADMIN
      };
      localStorage.setItem('nebras_active_user', JSON.stringify(admin));
      setUser(admin);
      return true;
    }

    // 2. Check Guardians in Local Storage
    const guardians = JSON.parse(localStorage.getItem('nebras_guardians') || '[]');
    const guardianAccount = guardians.find((g: any) => g.username === username && g.password === password);

    if (guardianAccount) {
      const user: User = {
        id: guardianAccount.id,
        email: `${username}@guardian.nebras`,
        displayName: guardianAccount.guardianName,
        role: UserRole.GUARDIAN,
        studentIds: guardianAccount.studentIds,
        username: guardianAccount.username
      };
      localStorage.setItem('nebras_active_user', JSON.stringify(user));
      setUser(user);
      return true;
    }

    // 3. Check Students in Local Storage
    const studentsAcc = JSON.parse(localStorage.getItem('nebras_student_accounts') || '[]');
    const studentAccount = studentsAcc.find((s: any) => s.username === username && s.password === password);

    if (studentAccount) {
      const user: User = {
        id: studentAccount.id,
        email: `${username}@student.nebras`,
        displayName: studentAccount.studentName,
        role: UserRole.STUDENT,
        studentId: studentAccount.studentId,
        username: studentAccount.username
      };
      localStorage.setItem('nebras_active_user', JSON.stringify(user));
      setUser(user);
      return true;
    }

    const teachers = JSON.parse(localStorage.getItem('nebras_teachers_accounts') || '[]');
    const teacherAccount = teachers.find((t: any) => t.username === username && t.password === password);

    if (teacherAccount) {
      // Fallback for older accounts created before `teacherId` was added to accounts
      let finalTeacherId = teacherAccount.teacherId;
      if (!finalTeacherId) {
        const allTeachersData = JSON.parse(localStorage.getItem('nebras_teachers') || '[]');
        const matchingTeacher = allTeachersData.find((t: any) => t.name === teacherAccount.teacherName);
        finalTeacherId = matchingTeacher?.id;
      }

      const user: User = {
        id: teacherAccount.id,
        email: `${username}@teacher.nebras`,
        displayName: teacherAccount.teacherName,
        role: UserRole.TEACHER,
        teacherId: finalTeacherId,
        username: teacherAccount.username
      };
      localStorage.setItem('nebras_active_user', JSON.stringify(user));
      setUser(user);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('nebras_active_user');
    setUser(null);
  };

  const setDemoUser = (isDemo: boolean) => {
    if (isDemo) {
      const mockUser: User = {
        id: 'local-admin',
        email: 'admin@nebras.edu',
        displayName: 'مدير النظام',
        role: UserRole.ADMIN
      };
      localStorage.setItem('nebras_active_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setDemoUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
