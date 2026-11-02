
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useCollection = (collectionName: string, sortBy: string = 'timestamp') => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy(sortBy, 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(result);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, sortBy]);

  return { data, loading };
};

export const addData = async (collectionName: string, payload: any) => {
  return await addDoc(collection(db, collectionName), {
    ...payload,
    timestamp: new Date()
  });
};

export const updateData = async (collectionName: string, id: string, payload: any) => {
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, payload);
};

export const deleteData = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
};
