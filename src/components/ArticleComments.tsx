import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, User, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
}

interface ArticleCommentsProps {
  articleId: string;
  articleTitle: string;
}

const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId, articleTitle }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;

    setLoading(true);
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId,
        articleTitle,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous User',
        userAvatar: auth.currentUser.photoURL || '',
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-600/10 rounded-lg text-red-500">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-xl font-black text-white font-bengali">মতামত ও আলোচনা ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {auth.currentUser ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {auth.currentUser.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/20" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500">
                  <User size={20} />
                </div>
              )}
            </div>
            <div className="flex-grow space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="এই সংবাদ সম্পর্কে আপনার মন্তব্য লিখুন..."
                className="w-full bg-transparent border-none text-white font-bengali focus:ring-0 placeholder:text-gray-500 resize-none"
                rows={2}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span className="font-bengali">মন্তব্য করুন</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl border border-dashed border-white/10 text-center">
          <p className="text-gray-500 font-bengali mb-4">মন্তব্য করতে আপনাকে লগ-ইন করতে হবে।</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-red-600 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 group"
              >
                <div className="flex-shrink-0">
                  {comment.userAvatar ? (
                    <img src={comment.userAvatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-gray-300">{comment.userName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                          {comment.createdAt?.toDate().toLocaleDateString('bn-BD')}
                        </span>
                        {(auth.currentUser?.uid === comment.userId) && (
                          <button 
                            onClick={() => handleDelete(comment.id)}
                            className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 font-bengali text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-12 text-center">
             <MessageSquare size={40} className="mx-auto text-white/5 mb-4" />
             <p className="text-gray-600 font-bengali">এখনো কোনো মন্তব্য নেই। প্রথম ব্যক্তি হিসেবে আপনার মতামত দিন!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleComments;
