export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  time: string;
  image: string;
  category: 'national' | 'international' | 'sports' | 'tech' | 'entertainment' | 'visa' | 'bangla' | 'english' | string;
  url: string;
  author?: string;
  timestamp?: number;
  isTopSource?: boolean;
};

export type MediaSource = {
  id: string;
  name: string;
  url: string;
  logoText: string;
  color: string;
  logo?: string;
};

export const topNews: NewsArticle[] = [];

export const banglaPapers: MediaSource[] = [
  { id: 'b1', name: 'প্রথম আলো', url: 'https://www.prothomalo.com', logoText: 'প্র.আ', color: 'bg-blue-600', logo: 'https://www.google.com/s2/favicons?domain=www.prothomalo.com&sz=64' },
  { id: 'b2', name: 'কালের কণ্ঠ', url: 'https://www.kalerkantho.com', logoText: 'কা.ক', color: 'bg-red-700', logo: 'https://www.google.com/s2/favicons?domain=www.kalerkantho.com&sz=64' },
  { id: 'b3', name: 'ইত্তেফাক', url: 'https://www.ittefaq.com.bd', logoText: 'ইত্তে', color: 'bg-teal-700', logo: 'https://www.google.com/s2/favicons?domain=www.ittefaq.com.bd&sz=64' },
  { id: 'b4', name: 'যুগান্তর', url: 'https://www.jugantor.com', logoText: 'যুগা', color: 'bg-indigo-700', logo: 'https://www.google.com/s2/favicons?domain=www.jugantor.com&sz=64' },
  { id: 'b5', name: 'সমকাল', url: 'https://samakal.com', logoText: 'সম', color: 'bg-green-700', logo: 'https://www.google.com/s2/favicons?domain=samakal.com&sz=64' },
  { id: 'b6', name: 'বাংলাদেশ প্রতিদিন', url: 'https://www.bd-pratidin.com', logoText: 'বা.প্র', color: 'bg-rose-700', logo: 'https://www.google.com/s2/favicons?domain=www.bd-pratidin.com&sz=64' },
  { id: 'b7', name: 'নয়া দিগন্ত', url: 'https://www.dailynayadiganta.com', logoText: 'নয়া', color: 'bg-cyan-700', logo: 'https://www.google.com/s2/favicons?domain=www.dailynayadiganta.com&sz=64' },
  { id: 'b8', name: 'আমাদের সময়', url: 'https://www.dainikamadershomoy.com', logoText: 'আ.স', color: 'bg-purple-700', logo: 'https://www.google.com/s2/favicons?domain=www.dainikamadershomoy.com&sz=64' },
  { id: 'b9', name: 'ভোরের কাগজ', url: 'https://www.voreshkagoj.com', logoText: 'ভোরে', color: 'bg-orange-700', logo: 'https://www.google.com/s2/favicons?domain=www.voreshkagoj.com&sz=64' },
  { id: 'b10', name: 'বিডিনিউজ২৪', url: 'https://bangla.bdnews24.com', logoText: 'বিডি', color: 'bg-red-800', logo: 'https://www.google.com/s2/favicons?domain=bangla.bdnews24.com&sz=64' },
  { id: 'b11', name: 'বাংলানিউজ২৪', url: 'https://www.banglanews24.com', logoText: 'বিএল', color: 'bg-emerald-800', logo: 'https://www.google.com/s2/favicons?domain=www.banglanews24.com&sz=64' },
  { id: 'b12', name: 'জাগো নিউজ', url: 'https://www.jagonews24.com', logoText: 'জাগো', color: 'bg-orange-600', logo: 'https://www.google.com/s2/favicons?domain=www.jagonews24.com&sz=64' },
  { id: 'b13', name: 'ঢাকা পোস্ট', url: 'https://www.dhakapost.com', logoText: 'ডি.পি', color: 'bg-blue-700', logo: 'https://www.google.com/s2/favicons?domain=www.dhakapost.com&sz=64' },
  { id: 'b14', name: 'কালবেলা', url: 'https://www.kalbela.com', logoText: 'কাল', color: 'bg-slate-900', logo: 'https://www.google.com/s2/favicons?domain=www.kalbela.com&sz=64' },
];

export const englishPapers: MediaSource[] = [
  { id: 'e1', name: 'The Daily Star', url: 'https://www.thedailystar.net', logoText: 'DS', color: 'bg-slate-800', logo: 'https://www.google.com/s2/favicons?domain=www.thedailystar.net&sz=64' },
  { id: 'e2', name: 'Dhaka Tribune', url: 'https://www.dhakatribune.com', logoText: 'DT', color: 'bg-sky-800', logo: 'https://www.google.com/s2/favicons?domain=www.dhakatribune.com&sz=64' },
  { id: 'e3', name: 'Financial Express', url: 'https://thefinancialexpress.com.bd', logoText: 'FE', color: 'bg-green-800', logo: 'https://www.google.com/s2/favicons?domain=thefinancialexpress.com.bd&sz=64' },
  { id: 'e4', name: 'New Age', url: 'https://www.newagebd.net', logoText: 'NA', color: 'bg-zinc-800', logo: 'https://www.google.com/s2/favicons?domain=www.newagebd.net&sz=64' },
  { id: 'e5', name: 'The Business Standard', url: 'https://www.tbsnews.net', logoText: 'TBS', color: 'bg-blue-900', logo: 'https://www.google.com/s2/favicons?domain=www.tbsnews.net&sz=64' },
  { id: 'e6', name: 'Observer', url: 'https://www.dailyobserverbd.com', logoText: 'DO', color: 'bg-red-800', logo: 'https://www.google.com/s2/favicons?domain=www.dailyobserverbd.com&sz=64' },
];

export const tvChannels: MediaSource[] = [
  { id: 't1', name: 'Somoy TV', url: 'https://www.somoynews.tv', logoText: 'সময়', color: 'bg-red-600', logo: 'https://www.google.com/s2/favicons?domain=www.somoynews.tv&sz=64' },
  { id: 't2', name: 'Jamuna TV', url: 'https://www.jamuna.tv', logoText: 'যমুনা', color: 'bg-teal-600', logo: 'https://www.google.com/s2/favicons?domain=www.jamuna.tv&sz=64' },
  { id: 't3', name: 'Channel i', url: 'https://www.channelionline.com', logoText: 'চ্যানেল আই', color: 'bg-red-500', logo: 'https://www.google.com/s2/favicons?domain=www.channelionline.com&sz=64' },
  { id: 't4', name: 'NTV', url: 'https://www.ntvbd.com', logoText: 'NTV', color: 'bg-emerald-600', logo: 'https://www.google.com/s2/favicons?domain=www.ntvbd.com&sz=64' },
  { id: 't5', name: 'Independent', url: 'https://www.independent24.com', logoText: 'Ind', color: 'bg-violet-700', logo: 'https://www.google.com/s2/favicons?domain=www.independent24.com&sz=64' },
  { id: 't6', name: 'ATN News', url: 'https://www.atnnewstv.com', logoText: 'ATN', color: 'bg-red-700', logo: 'https://www.google.com/s2/favicons?domain=www.atnnewstv.com&sz=64' },
  { id: 't7', name: 'Ekattor TV', url: 'https://ekattor.tv', logoText: '৭১', color: 'bg-green-600', logo: 'https://www.google.com/s2/favicons?domain=ekattor.tv&sz=64' },
  { id: 't8', name: 'DBC News', url: 'https://dbcnews.tv', logoText: 'DBC', color: 'bg-blue-600', logo: 'https://www.google.com/s2/favicons?domain=dbcnews.tv&sz=64' },
  { id: 't9', name: 'Channel 24', url: 'https://www.channel24bd.tv', logoText: '২৪', color: 'bg-red-800', logo: 'https://www.google.com/s2/favicons?domain=www.channel24bd.tv&sz=64' },
];

export const internationalChannels: MediaSource[] = [
  { id: 'i1', name: 'BBC News', url: 'https://www.bbc.com/news', logoText: 'BBC', color: 'bg-red-800', logo: 'https://www.google.com/s2/favicons?domain=www.bbc.com&sz=64' },
  { id: 'i2', name: 'CNN', url: 'https://edition.cnn.com', logoText: 'CNN', color: 'bg-red-600', logo: 'https://www.google.com/s2/favicons?domain=edition.cnn.com&sz=64' },
  { id: 'i3', name: 'Al Jazeera', url: 'https://www.aljazeera.com', logoText: 'AJ', color: 'bg-orange-600', logo: 'https://www.google.com/s2/favicons?domain=www.aljazeera.com&sz=64' },
  { id: 'i4', name: 'Reuters', url: 'https://www.reuters.com', logoText: 'RT', color: 'bg-zinc-800', logo: 'https://www.google.com/s2/favicons?domain=www.reuters.com&sz=64' },
  { id: 'i5', name: 'Al Arabiya', url: 'https://english.alarabiya.net', logoText: 'AA', color: 'bg-slate-700', logo: 'https://www.google.com/s2/favicons?domain=english.alarabiya.net&sz=64' },
];
