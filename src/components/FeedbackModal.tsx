import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, Bug, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'feedback' | 'bug' | 'suggestion'>('feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // Logic for logging feedback
      console.log('Feedback Submitted:', { type, message, email, timestamp: new Date().toISOString() });
      
      // We could also send this to an endpoint if one existed
      // await axios.post('/api/feedback', { type, message, email });

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
          setEmail('');
          setType('feedback');
          setIsSubmitting(false);
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-600/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/30">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white font-bengali">আপনার মতামত জানান</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Feed us your thoughts</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-white font-bengali">অসংখ্য ধন্যবাদ!</h3>
                  <p className="text-gray-400 font-bengali">আপনার মূল্যবান মতামত আমরা পেয়েছি।</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Selector */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('feedback')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${type === 'feedback' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <MessageSquare size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('bug')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${type === 'bug' ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <Bug size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bug</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('suggestion')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${type === 'suggestion' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <Sparkles size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Idea</span>
                    </button>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">কি বলতে চান?</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="আপনার মতামত বা অভিযোগ এখানে লিখুন..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bengali focus:outline-none focus:border-red-600/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">আপনার ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bengali focus:outline-none focus:border-red-600/50 transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !message}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-600/20 group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span className="font-bengali">মতামত পাঠান</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
