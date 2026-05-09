import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NewsArticle } from '../../data';

export const adminService = {
  getAllNews: async () => {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as NewsArticle[];
  },
  addNews: async (news: Partial<NewsArticle>) => {
    const docRef = await addDoc(collection(db, 'articles'), {
      ...news,
      publishedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...news } as NewsArticle;
  },
  deleteNews: async (id: string | number) => {
    await deleteDoc(doc(db, 'articles', String(id)));
  },
  updateNews: async (id: string | number, data: Partial<NewsArticle>) => {
    await updateDoc(doc(db, 'articles', String(id)), data);
  }
};
