import axios from 'axios';
import { NewsArticle } from '../../data';

const API = axios.create({
  baseURL: '/api'
});

export const getNews = () => API.get<NewsArticle[]>('/news');
export const addNews = (data: Partial<NewsArticle>) => API.post<NewsArticle>('/news', data);
export const deleteNews = (id: number | string) => API.delete(`/news/${id}`);
export const updateNews = (id: number | string, data: Partial<NewsArticle>) => API.patch(`/news/${id}`, data);

// Keep the object for backward compatibility if needed, or remove it
export const adminService = {
  getAllNews: async () => (await getNews()).data,
  addNews: async (news: Partial<NewsArticle>) => (await addNews(news)).data,
  deleteNews,
  updateNews
};
