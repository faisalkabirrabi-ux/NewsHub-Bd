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

export const topNews: NewsArticle[] = [
  {
    id: 'n1',
    title: 'দেশজুড়ে তীব্র তাপপ্রবাহ, একাধিক জেলায় সতর্কতা জারি করেছে আবহাওয়া অধিদপ্তর',
    summary: 'আগামী কয়েকদিন দেশের বেশ কয়েকটি অঞ্চলে মাঝারি থেকে তীব্র মাত্রার তাপপ্রবাহ বয়ে যেতে পারে। তাপমাত্রা ৪০ ডিগ্রি ছাড়ানোর আশঙ্কা রয়েছে।',
    content: 'আবহাওয়া অধিদপ্তরের সাম্প্রতিক বুলেটিন অনুযায়ী, দেশের উত্তর-পশ্চিমাঞ্চল ও মধ্যাঞ্চলে তাপপ্রবাহের মাত্রা আরও বাড়তে পারে। সাধারণ মানুষকে প্রয়োজন ছাড়া ঘরের বাইরে বের হতে নিষেধ করা হয়েছে। চিকিৎসকরা বেশি করে পানি পান করার পরামর্শ দিয়েছেন।',
    source: 'প্রথম আলো',
    time: '২ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1561553590-267fc716698a?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'national',
    url: 'https://www.prothomalo.com'
  },
  {
    id: 'n2',
    title: 'নতুন শিক্ষাক্রম নিয়ে শিক্ষামন্ত্রীর গুরুত্বপূর্ণ ঘোষণা, পরীক্ষা পদ্ধতিতে আসছে পরিবর্তন',
    summary: 'শিক্ষার্থীদের ওপর চাপ কমাতে নতুন শিক্ষাক্রমে মূল্যায়নের পদ্ধতিতে বড় রকমের পরিবর্তনের ইঙ্গিত দিয়েছেন শিক্ষামন্ত্রী।',
    content: 'আজ এক সংবাদ সম্মেলনে শিক্ষামন্ত্রী জানান, পাঠ্যপুস্তকের চেয়ে হাতে-কলমে শিক্ষার ওপর জোর দেওয়া হচ্ছে। ভবিষ্যতে পাবলিক পরীক্ষার সংখ্যা কমিয়ে ধারাবাহিক মূল্যায়নের দিকে এগোবে শিক্ষা ব্যবস্থা।',
    source: 'কালের কণ্ঠ',
    time: '৪ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'national',
    url: 'https://www.kalerkantho.com'
  },
  {
    id: 'n3',
    title: 'রপ্তানি আয়ে নতুন রেকর্ড গড়ল বাংলাদেশ, পোশাক খাতের বড় অবদান',
    summary: 'চলতি অর্থবছরে রপ্তানি আয়ে উল্লেখযোগ্য প্রবৃদ্ধি এসেছে। বিশেষ করে তৈরি পোশাক খাত থেকে সবচেয়ে বেশি আয় হয়েছে।',
    content: 'বাংলাদেশ রপ্তানি উন্নয়ন ব্যুরো (ইপিবি) জানিয়েছে, গত মাসের তুলনায় এ মাসে রপ্তানি আয় বেড়েছে প্রায় ১৫ শতাংশ। ইউরোপ ও আমেরিকার বাজারে দেশের পোশাকের চাহিদা বৃদ্ধি এর অন্যতম প্রধান কারণ।',
    source: 'দ্য ডেইলি স্টার',
    time: '৫ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1566118498563-3f1b3dc9beff?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'national',
    url: 'https://www.thedailystar.net'
  },
  {
    id: 'i1',
    title: 'কৃত্রিম বুদ্ধিমত্তায় বড় পরিবর্তন আনছে শীর্ষ টেক জায়ান্টগুলো',
    summary: 'শীর্ষ টেক জায়ান্টগুলো তাদের পণ্যে জেনারেটিভ এআই যুক্ত করে নতুন যুগের সূচনা করছে।',
    content: 'গুগল, মাইক্রোসফট এবং অ্যাপল তাদের অপারেটিং সিস্টেমে এআই ফিচার যুক্ত করার পরিকল্পনা প্রকাশ করেছে। এর ফলে ব্যবহারকারীরা আরও স্মার্ট ভাবে তাদের ডিভাইস ব্যবহার করতে পারবেন।',
    source: 'বিবিসি বাংলা',
    time: '৩ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'international',
    url: 'https://www.bbc.com/bengali'
  },
  {
    id: 'i2',
    title: 'বৈশ্বিক অর্থনীতিতে মন্দার প্রভাব, মুদ্রাস্ফীতি নিয়ন্ত্রণে হিমশিম খাচ্ছে দেশগুলো',
    summary: 'যুদ্ধ ও সরবরাহ ব্যবস্থার সংকটের কারণে বিশ্বব্যাপী নিত্যপণ্যের দাম আকাশছোঁয়া।',
    content: 'আন্তর্জাতিক মুদ্রা তহবিল (আইএমএফ) সতর্ক করেছে যে, অনেক উন্নত দেশও মন্দার কবলে পড়তে পারে। মুদ্রাস্ফীতি কমাতে ব্যাংকগুলো সুদের হার বৃদ্ধি করছে।',
    source: 'রয়টার্স',
    time: '৬ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'international',
    url: 'https://www.reuters.com'
  },
  {
    id: 's1',
    title: 'বিশ্বকাপ ফুটবলের প্রস্তুতি শুরু, নতুন ভেন্যু নিয়ে উচ্ছ্বসিত ফুটবলপ্রেমীরা',
    summary: 'ফিফা বিশ্বকাপের জন্য চূড়ান্ত ভেন্যু তালিকা প্রকাশ করা হয়েছে। আধুনিক সুবিধাসম্পন্ন স্টেডিয়ামগুলো প্রস্তুত হচ্ছে।',
    content: 'আগামী বিশ্বকাপের আয়োজক দেশগুলো জানায়, তারা সর্বোচ্চ নিরাপত্তা ও দর্শনার্থীদের সুবিধার কথা বিবেচনা করে প্রস্তুতি নিচ্ছে। ফুটবল তারকাদের নিয়ে এখনই শুরু হয়েছে জল্পনা-কল্পনা।',
    source: 'যুগান্তর',
    time: '১ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'sports',
    url: 'https://www.jugantor.com'
  },
  {
    id: 's2',
    title: 'টি-টোয়েন্টি সিরিজে বাংলাদেশের দাপুটে জয়',
    summary: 'সিরিজের শেষ ম্যাচে অলরাউন্ড পারফরম্যান্সে সিরিজ নিশ্চিত করল বাংলাদেশ।',
    content: 'ব্যাটসম্যানদের দুর্দান্ত শুরু এবং বোলারদের নিয়ন্ত্রিত বোলিংয়ে সহজ জয় নিয়ে মাঠ ছাড়ে টাইগাররা। ম্যাচসেরা হয়েছেন তরুণ অলরাউন্ডার।',
    source: 'প্রথম আলো',
    time: '৩ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'sports',
    url: 'https://www.prothomalo.com'
  },
  {
    id: 's3',
    title: 'চ্যাম্পিয়ন্স লিগে রিয়াল মাদ্রিদের অসাধারণ কামব্যাক',
    summary: 'পিছিয়ে পড়েও শেষ মুহূর্তের জোড়া গোলে জয় নিশ্চিত করল স্প্যানিশ জায়ান্টরা।',
    content: 'রুদ্ধশ্বাস এই ম্যাচে অসাধারণ ক্রীড়ানৈপুণ্য দেখিয়েছেন দলের ফরোয়ার্ডরা। এই জয়ের ফলে সেমিফাইনালে খেলা প্রায় নিশ্চিত করে ফেলল তারা।',
    source: 'দ্য ডেইলি স্টার',
    time: '৬ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'sports',
    url: 'https://www.thedailystar.net'
  },
  {
    id: 's4',
    title: 'আইপিএলে রেকর্ড গড়া ইনিংস খেললেন কোহলি',
    summary: 'দুর্দান্ত এক সেঞ্চুরিতে দলকে বড় সংগ্রহ এনে দিলেন বিরাট কোহলি।',
    content: 'শুরু থেকেই আক্রমণাত্মক ব্যাটিং করে প্রতিপক্ষের বোলারদের চাপে ফেলেন এই আইকন ব্যাটার। তার এই ইনিংসে ভর করেই জয় নিশ্চিত করে তার দল।',
    source: 'イッテファク',
    time: '৮ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1531415074968-03611f095d31?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'sports',
    url: 'https://www.ittefaq.com.bd'
  },
  {
    id: 't1',
    title: 'নতুন চিপ উন্মোচন করল অ্যাপল, এআইতে আরও শক্তিশালী',
    summary: 'ম্যাকবুক এবং আইপ্যাডের জন্য নতুন এম-সিরিজের চিপ এনেছে অ্যাপল যা আগের চেয়ে দ্বিগুণ গতির।',
    content: 'অ্যাপলের দাবি, এই নতুন প্রসেসরটি জেনারেটিভ এআই প্রসেসিংয়ের ক্ষেত্রে যুগান্তকারী পরিবর্তন আনবে। এতে ব্যাটারি লাইফও আগের তুলনায় বাড়বে।',
    source: 'The Daily Star',
    time: '৫ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'tech',
    url: 'https://www.thedailystar.net'
  },
  {
    id: 'v1',
    title: 'ইউএস ভিসার নতুন নিয়মকানুন',
    summary: 'মার্কিন যুক্তরাষ্ট্র বাংলাদেশীদের জন্য ভিসা নীতিতে পরিবর্তন এনেছে।',
    content: 'নতুন ভিসা নীতিতে স্টুডেন্ট এবং ওয়ার্ক ভিসার জন্য কিছু নতুন শর্ত যুক্ত করা হয়েছে। বিস্তারিত জানতে এম্বেসি সাইট ভিজিট করুন।',
    source: 'প্রথম আলো',
    time: '১ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'visa',
    url: 'https://www.prothomalo.com'
  }
];

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
];
