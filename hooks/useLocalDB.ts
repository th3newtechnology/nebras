
import { useState, useEffect } from 'react';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_HALLS, MOCK_ANNOUNCEMENTS } from '../constants';

export const useLocalCollection = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem(`nebras_${collectionName}`);
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      let initialData: any[] = [];
      if (collectionName === 'students') initialData = MOCK_STUDENTS;
      if (collectionName === 'teachers') initialData = MOCK_TEACHERS;
      if (collectionName === 'halls') initialData = MOCK_HALLS;
      if (collectionName === 'announcements') initialData = MOCK_ANNOUNCEMENTS;
      if (collectionName === 'messages') initialData = [];
      if (collectionName === 'conversations') initialData = [];
      if (collectionName === 'timetable') initialData = [];
      if (collectionName === 'attendance_logs') initialData = [];
      
      localStorage.setItem(`nebras_${collectionName}`, JSON.stringify(initialData));
      setData(initialData);
    }
    setLoading(false);
  }, [collectionName]);

  const refreshData = () => {
    const savedData = localStorage.getItem(`nebras_${collectionName}`);
    if (savedData) setData(JSON.parse(savedData));
  };

  return { data, loading, refreshData };
};

export const addLocalData = (collectionName: string, payload: any) => {
  const savedData = JSON.parse(localStorage.getItem(`nebras_${collectionName}`) || '[]');
  const newData = [{ 
    ...payload, 
    id: Math.random().toString(36).substr(2, 9), 
    timestamp: new Date().toISOString() 
  }, ...savedData];
  localStorage.setItem(`nebras_${collectionName}`, JSON.stringify(newData));
  return newData;
};

export const updateLocalData = (collectionName: string, id: string, payload: any) => {
  const savedData = JSON.parse(localStorage.getItem(`nebras_${collectionName}`) || '[]');
  const newData = savedData.map((item: any) => 
    item.id === id ? { ...item, ...payload } : item
  );
  localStorage.setItem(`nebras_${collectionName}`, JSON.stringify(newData));
  return newData;
};

export const deleteLocalData = (collectionName: string, id: string) => {
  const savedData = JSON.parse(localStorage.getItem(`nebras_${collectionName}`) || '[]');
  const newData = savedData.filter((item: any) => item.id !== id);
  localStorage.setItem(`nebras_${collectionName}`, JSON.stringify(newData));
  return newData;
};

export const exportFullDB = () => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('nebras_'));
  const db: Record<string, any> = {};
  keys.forEach(key => {
    db[key] = JSON.parse(localStorage.getItem(key) || '[]');
  });
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", `nebras_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
