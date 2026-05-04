export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  time: string;
  image: string;
  category: 'national' | 'international' | 'sports' | 'tech' | 'entertainment';
};

export type MediaSource = {
  id: string;
  name: string;
  url: string;
  logoText: string;
  color: string;
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
    category: 'national'
  },
  {
    id: 'n2',
    title: 'নতুন শিক্ষাক্রম নিয়ে শিক্ষামন্ত্রীর গুরুত্বপূর্ণ ঘোষণা, পরীক্ষা পদ্ধতিতে আসছে পরিবর্তন',
    summary: 'শিক্ষার্থীদের ওপর চাপ কমাতে নতুন শিক্ষাক্রমে মূল্যায়নের পদ্ধতিতে বড় রকমের পরিবর্তনের ইঙ্গিত দিয়েছেন শিক্ষামন্ত্রী।',
    content: 'আজ এক সংবাদ সম্মেলনে শিক্ষামন্ত্রী জানান, পাঠ্যপুস্তকের চেয়ে হাতে-কলমে শিক্ষার ওপর জোর দেওয়া হচ্ছে। ভবিষ্যতে পাবলিক পরীক্ষার সংখ্যা কমিয়ে ধারাবাহিক মূল্যায়নের দিকে এগোবে শিক্ষা ব্যবস্থা।',
    source: 'কালের কণ্ঠ',
    time: '৪ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'national'
  },
  {
    id: 'n3',
    title: 'রপ্তানি আয়ে নতুন রেকর্ড গড়ল বাংলাদেশ, পোশাক খাতের বড় অবদান',
    summary: 'চলতি অর্থবছরে রপ্তানি আয়ে উল্লেখযোগ্য প্রবৃদ্ধি এসেছে। বিশেষ করে তৈরি পোশাক খাত থেকে সবচেয়ে বেশি আয় হয়েছে।',
    content: 'বাংলাদেশ রপ্তানি উন্নয়ন ব্যুরো (ইপিবি) জানিয়েছে, গত মাসের তুলনায় এ মাসে রপ্তানি আয় বেড়েছে প্রায় ১৫ শতাংশ। ইউরোপ ও আমেরিকার বাজারে দেশের পোশাকের চাহিদা বৃদ্ধি এর অন্যতম প্রধান কারণ।',
    source: 'দ্য ডেইলি স্টার',
    time: '৫ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1566118498563-3f1b3dc9beff?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'national'
  },
  {
    id: 'i1',
    title: 'কৃত্রিম বুদ্ধিমত্তায় বড় পরিবর্তন আনছে শীর্ষ টেক জায়ান্টগুলো',
    summary: 'নতুন জেনারেটিভ এআই মডেল উন্মুক্ত করতে যাচ্ছে সিলিকন ভ্যালি। প্রযুক্তির ইতিহাসে এটি একটি বড় মাইলফলক হতে পারে।',
    content: 'গুগল এবং অন্যান্য শীর্ষ প্রযুক্তি প্রতিষ্ঠানগুলো তাদের এআই চ্যাটবট ও টুলগুলোকে আরও বুদ্ধিমান এবং ইউজ-ফ্রেন্ডলি করার জন্য বিশাল অঙ্কের বিনিয়োগ করছে। বিশেষজ্ঞরা বলছেন, এর ফলে অনেক খাতের কাজের ধরন বদলে যাবে।',
    source: 'বিবিসি বাংলা',
    time: '৩ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'international'
  },
  {
    id: 'i2',
    title: 'মহাকাশ গবেষণায় নতুন মাত্রা: মঙ্গলের পথে নতুন রোভার',
    summary: 'মঙ্গলে প্রাণের অস্তিত্ব খুঁজতে নতুন একটি রোভার পাঠিয়েছে আন্তর্জাতিক গবেষক দল।',
    content: 'রোভারটি আগামী সাত মাসের মধ্যে মঙ্গলের মাটি স্পর্শ করবে বলে আশা করা হচ্ছে। এর প্রধান কাজ হবে মাটির নমুনা সংগ্রহ করা এবং প্রাচীন প্রাণের সন্ধান করা।',
    source: 'রয়টার্স',
    time: '৬ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'international'
  },
  {
    id: 'i3',
    title: 'বিশ্ব বাণিজ্যে নতুন মেরুকরণ, এশিয়ার অর্থনীতিতে প্রভাব',
    summary: 'আন্তর্জাতিক বাণিজ্যে বড় ধরনের পরিবর্তন আসছে। এশিয়ার বাজারগুলো এর ফলে লাভবান হতে পারে বলে মনে করছেন অর্থনীতিবিদরা।',
    content: 'সাপ্লাই চেইন ডাইভারসিফিকেশনের কারণে অনেক বিনিয়োগকারী এখন নতুন বাজারের দিকে ঝুঁকছেন। এশিয়া প্যাসিফিক অঞ্চল এই বিনিয়োগের অন্যতম প্রধান গন্তব্য হয়ে উঠছে।',
    source: 'আল জাজিরা',
    time: '৭ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'international'
  },
  {
    id: 's1',
    title: 'বিশ্বকাপ বাছাইপর্বে আজ মাঠে নামছে বাংলাদেশ',
    summary: 'গুরুত্বপূর্ণ ম্যাচে শক্তিশালী প্রতিপক্ষের মোকাবিলা করবে বাংলাদেশ দল। দলে ফিরেছেন অভিজ্ঞ অধিনায়ক।',
    content: 'কোচ জানিয়েছেন, দলের সবাই ফিট আছেন এবং ভালো কিছু করার ব্যাপারে আশাবাদী। আজ সন্ধ্যার ম্যাচে দর্শকদের পূর্ণ সমর্থন প্রত্যাশা করছে দল।',
    source: 'যুগান্তর',
    time: '১ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'sports'
  },
  {
    id: 't1',
    title: 'নতুন চিপ উন্মোচন করল অ্যাপল, এআইতে আরও শক্তিশালী',
    summary: 'ম্যাকবুক এবং আইপ্যাডের জন্য নতুন এম-সিরিজের চিপ এনেছে অ্যাপল যা আগের চেয়ে দ্বিগুণ গতির।',
    content: 'অ্যাপলের দাবি, এই নতুন প্রসেসরটি জেনারেটিভ এআই প্রসেসিংয়ের ক্ষেত্রে যুগান্তকারী পরিবর্তন আনবে। এতে ব্যাটারি লাইফও আগের তুলনায় বাড়বে।',
    source: 'The Daily Star',
    time: '৫ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'tech'
  },
  {
    id: 'e1',
    title: 'অস্কারে সেরা ছবির পুরস্কার জিতল নতুন সিনেমা',
    summary: 'লস অ্যাঞ্জেলেসে অনুষ্ঠিত একাডেমি অ্যাওয়ার্ডসে সেরা চলচ্চিত্রের পুরস্কার জিতেছে আলোচিত ছবিটি।',
    content: 'সিনেমাটির পরিচালক এই সম্মাননা তার পুরো টিমকে উৎসর্গ করেছেন। দর্শকরাও ছবিটি নিয়ে দারুণ উচ্ছ্বসিত ছিলেন।',
    source: 'সমকাল',
    time: '১০ ঘণ্টা আগে',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800&h=500',
    category: 'entertainment'
  }
];

export const banglaPapers: MediaSource[] = [
  { id: 'b1', name: 'প্রথম আলো', url: 'https://www.prothomalo.com', logoText: 'প্র.আ', color: 'bg-blue-600' },
  { id: 'b2', name: 'কালের কণ্ঠ', url: 'https://www.kalerkantho.com', logoText: 'কা.ক', color: 'bg-red-700' },
  { id: 'b3', name: 'ইত্তেফাক', url: 'https://www.ittefaq.com.bd', logoText: 'ইত্তে', color: 'bg-teal-700' },
  { id: 'b4', name: 'যুগান্তর', url: 'https://www.jugantor.com', logoText: 'যুগা', color: 'bg-indigo-700' },
  { id: 'b5', name: 'সমকাল', url: 'https://samakal.com', logoText: 'সম', color: 'bg-green-700' },
  { id: 'b6', name: 'বাংলাদেশ প্রতিদিন', url: 'https://www.bd-pratidin.com', logoText: 'বা.প্র', color: 'bg-rose-700' },
  { id: 'b7', name: 'নয়া দিগন্ত', url: 'https://www.dailynayadiganta.com', logoText: 'নয়া', color: 'bg-cyan-700' },
  { id: 'b8', name: 'আমাদের সময়', url: 'https://www.dainikamadershomoy.com', logoText: 'আ.স', color: 'bg-purple-700' },
];

export const englishPapers: MediaSource[] = [
  { id: 'e1', name: 'The Daily Star', url: 'https://www.thedailystar.net', logoText: 'DS', color: 'bg-slate-800' },
  { id: 'e2', name: 'Dhaka Tribune', url: 'https://www.dhakatribune.com', logoText: 'DT', color: 'bg-sky-800' },
  { id: 'e3', name: 'Financial Express', url: 'https://thefinancialexpress.com.bd', logoText: 'FE', color: 'bg-green-800' },
  { id: 'e4', name: 'New Age', url: 'https://www.newagebd.net', logoText: 'NA', color: 'bg-zinc-800' },
  { id: 'e5', name: 'The Business Standard', url: 'https://www.tbsnews.net', logoText: 'TBS', color: 'bg-blue-900' },
  { id: 'e6', name: 'Observer', url: 'https://www.dailyobserverbd.com', logoText: 'DO', color: 'bg-red-800' },
];

export const tvChannels: MediaSource[] = [
  { id: 't1', name: 'Somoy TV', url: 'https://www.somoynews.tv', logoText: 'সময়', color: 'bg-red-600' },
  { id: 't2', name: 'Jamuna TV', url: 'https://www.jamuna.tv', logoText: 'যমুনা', color: 'bg-teal-600' },
  { id: 't3', name: 'Channel i', url: 'https://www.channelionline.com', logoText: 'চ্যানেল আই', color: 'bg-red-500' },
  { id: 't4', name: 'NTV', url: 'https://www.ntvbd.com', logoText: 'NTV', color: 'bg-emerald-600' },
  { id: 't5', name: 'Independent', url: 'https://www.independent24.com', logoText: 'Ind', color: 'bg-violet-700' },
  { id: 't6', name: 'ATN News', url: 'https://www.atnnewstv.com', logoText: 'ATN', color: 'bg-red-700' },
];
