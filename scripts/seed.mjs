/**
 * Seeds site settings, social links and a few bilingual trips so the site can be
 * demonstrated and smoke-tested without hand-entering content.
 *
 *   npm run seed            # insert only what is missing
 *   npm run seed -- --reset # delete existing trips/social/settings first
 *
 * Admin accounts are NOT touched — use `npm run create-admin` for those.
 */
import { parseArgs } from 'node:util';
import mongoose from 'mongoose';

const { values } = parseArgs({ options: { reset: { type: 'boolean', default: false } } });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('\n✖ MONGODB_URI is not set. Copy .env.example to .env.local first.\n');
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
const db = mongoose.connection.db;

const day = (offsetDays) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date;
};

const L = (ar, en) => ({ ar, en });
const LL = (ar, en) => ({ ar, en });

/*
 * Cover images come from Unsplash's CDN, which is allow-listed in next.config.ts.
 * Real content is uploaded through the admin; these exist only so the seeded site
 * has something to render.
 */
const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=70`;

const image = (id, ar, en) => ({
  url: photo(id),
  storageKey: `seed/${id}`,
  alt: L(ar, en),
  width: 1600,
  height: 1067,
});

const trips = [
  {
    slug: 'alexandria-day-trip',
    title: L('رحلة الإسكندرية', 'Alexandria Day Trip'),
    shortDescription: L(
      'يوم كامل بين القلعة والمسرح الروماني والمكتبة وعمود السواري.',
      'A full day across the Citadel, the Roman Theatre, the Library and Pompey’s Pillar.',
    ),
    description: L(
      'رحلة يوم واحد إلى عروس البحر المتوسط.\n\nننطلق مبكرًا من القاهرة بسيارة خاصة مكيّفة، ونبدأ بقلعة قايتباي المطلة على الميناء الشرقي، ثم المسرح الروماني، فمكتبة الإسكندرية الحديثة، وننهي اليوم عند عمود السواري.\n\nالبرنامج مصمم ليكون مريحًا: توقيتات واقعية، استراحات كافية، ووقت حر على الكورنيش قبل العودة.',
      'A single day in the Mediterranean’s old capital.\n\nWe leave Cairo early in a private air-conditioned car and begin at the Citadel of Qaitbay overlooking the Eastern Harbour, then the Roman Theatre, then the modern Bibliotheca Alexandrina, finishing at Pompey’s Pillar.\n\nThe schedule is built to be comfortable: realistic timings, proper rest stops, and free time on the Corniche before the drive back.',
    ),
    destination: L('الإسكندرية', 'Alexandria'),
    location: L('القلعة، المسرح الروماني، المكتبة', 'Citadel, Roman Theatre, Library'),
    meetingPoint: L(
      'أمام محطة مترو الدقي، الساعة 6:30 صباحًا.',
      'Outside Dokki metro station at 6:30 am.',
    ),
    transportation: L(
      'سيارة ملاكي خاصة مكيّفة حتى 4 ركاب، أو ميتسوبيشي إكسباندر حتى 7 ركاب. السائق يتحدث الإنجليزية.',
      'A private air-conditioned car for up to 4 passengers, or a Mitsubishi Xpander for up to 7. The driver speaks English.',
    ),
    entertainment: LL(
      ['جولة داخل قلعة قايتباي', 'زيارة مكتبة الإسكندرية', 'وقت حر على الكورنيش', 'غداء أسماك طازجة'],
      ['Tour inside the Citadel of Qaitbay', 'Visit to the Bibliotheca Alexandrina', 'Free time on the Corniche', 'Fresh seafood lunch'],
    ),
    includedServices: LL(
      ['المواصلات ذهابًا وعودة', 'سائق بخبرة سياحية', 'الوقود ورسوم الطريق', 'مياه معدنية'],
      ['Return transport', 'An experienced tourism driver', 'Fuel and road tolls', 'Bottled water'],
    ),
    excludedServices: LL(
      ['تذاكر دخول الأماكن الأثرية', 'الوجبات والمشروبات', 'الإكراميات'],
      ['Entrance tickets to the sites', 'Meals and drinks', 'Gratuities'],
    ),
    importantNotes: LL(
      ['يرجى إحضار بطاقة الرقم القومي أو جواز السفر.', 'ارتداء حذاء مريح للمشي.'],
      ['Please bring your national ID or passport.', 'Wear comfortable walking shoes.'],
    ),
    reservationInformation: L(
      'يتم تأكيد الحجز بدفع عربون 25% عبر واتساب، والباقي يوم الرحلة.',
      'A 25% deposit confirms the booking over WhatsApp; the balance is paid on the day.',
    ),
    coverImage: image('1568322445389-f64ac2515020', 'ساحل الإسكندرية', 'The Alexandria coastline'),
    gallery: [
      image('1539768942893-daf53e448371', 'قلعة قايتباي', 'The Citadel of Qaitbay'),
      image('1572252009286-268acec5ca0a', 'كورنيش الإسكندرية', 'The Corniche'),
    ],
    startDate: day(24),
    endDate: day(24),
    reservationStartDate: day(-3),
    reservationEndDate: day(21),
    price: 3400,
    currency: 'EGP',
    capacity: 16,
    availableSeats: 9,
    status: 'UPCOMING',
    published: true,
    featured: true,
    displayOrder: 1,
  },
  {
    slug: 'dahshur-and-memphis',
    title: L('دهشور ومنف وسقارة', 'Dahshur, Memphis & Saqqara'),
    shortDescription: L(
      'الأهرامات التي سبقت الجيزة — الهرم المنحني والهرم الأحمر.',
      'The pyramids that came before Giza — the Bent Pyramid and the Red Pyramid.',
    ),
    description: L(
      'يوم بين ثلاث محطات تحكي بداية بناء الأهرامات.\n\nنبدأ بسقارة والهرم المدرج، ثم منف عاصمة مصر القديمة، وننتهي بدهشور حيث الهرم المنحني والهرم الأحمر — أقل زحامًا من الجيزة وأكثر هدوءًا للتصوير.',
      'A day across three sites that tell the story of how pyramid building began.\n\nWe start at Saqqara and the Step Pyramid, continue to Memphis, ancient Egypt’s first capital, and finish at Dahshur with the Bent and Red Pyramids — quieter than Giza and far better for photographs.',
    ),
    destination: L('دهشور', 'Dahshur'),
    location: L('سقارة، منف، دهشور', 'Saqqara, Memphis, Dahshur'),
    meetingPoint: L('من الفندق أو أي عنوان داخل القاهرة والجيزة.', 'Hotel pickup anywhere in Cairo or Giza.'),
    transportation: L('سيارة خاصة مكيّفة مع سائق.', 'A private air-conditioned car with driver.'),
    entertainment: LL(
      ['النزول داخل الهرم الأحمر', 'تمثال رمسيس الثاني بمنف', 'جلسة تصوير عند الهرم المنحني'],
      ['Descending inside the Red Pyramid', 'The colossus of Ramesses II at Memphis', 'A photo stop at the Bent Pyramid'],
    ),
    includedServices: LL(
      ['المواصلات', 'سائق بخبرة', 'مياه معدنية'],
      ['Transport', 'An experienced driver', 'Bottled water'],
    ),
    excludedServices: LL(['تذاكر الدخول', 'الغداء'], ['Entrance tickets', 'Lunch']),
    importantNotes: LL(
      ['النزول داخل الأهرامات غير مناسب لمن يعاني من ضيق الأماكن المغلقة.'],
      ['Descending inside the pyramids is not suitable if you are claustrophobic.'],
    ),
    reservationInformation: L('الحجز عبر واتساب قبل الرحلة بيومين على الأقل.', 'Book on WhatsApp at least two days ahead.'),
    coverImage: image('1503177119275-0aa32b3a9368', 'أهرامات دهشور', 'The pyramids at Dahshur'),
    gallery: [
      image('1590133324192-1df305deea6b', 'الصحراء عند دهشور', 'The desert at Dahshur'),
      image('1560859251-d563a49c5e4a', 'هرم سقارة المدرج', 'The Step Pyramid at Saqqara'),
    ],
    startDate: day(38),
    endDate: day(38),
    reservationStartDate: day(-1),
    reservationEndDate: day(35),
    price: 1300,
    currency: 'EGP',
    capacity: 14,
    availableSeats: 14,
    status: 'UPCOMING',
    published: true,
    featured: true,
    displayOrder: 2,
  },
  {
    slug: 'luxor-and-aswan-weekend',
    title: L('الأقصر وأسوان — عطلة نهاية أسبوع', 'Luxor & Aswan Weekend'),
    shortDescription: L(
      'أربعة أيام بين معابد الأقصر وجزر أسوان ورحلة نيلية.',
      'Four days across the temples of Luxor, the islands of Aswan and a Nile cruise.',
    ),
    description: L(
      'رحلة أربعة أيام إلى صعيد مصر.\n\nالكرنك والأقصر والبر الغربي ووادي الملوك، ثم أسوان: معبد فيلة والسد العالي وجولة بالفلوكة حول الجزر عند الغروب.',
      'Four days in Upper Egypt.\n\nKarnak, Luxor Temple, the West Bank and the Valley of the Kings, then Aswan: the Temple of Philae, the High Dam, and a felucca around the islands at sunset.',
    ),
    destination: L('الأقصر وأسوان', 'Luxor & Aswan'),
    location: L('الكرنك، وادي الملوك، فيلة', 'Karnak, Valley of the Kings, Philae'),
    meetingPoint: L('محطة قطار الأقصر.', 'Luxor railway station.'),
    transportation: L('قطار مكيّف + نقل داخلي خاص.', 'Air-conditioned train plus private local transport.'),
    entertainment: LL(
      ['جولة بالفلوكة عند الغروب', 'عشاء على النيل', 'زيارة وادي الملوك'],
      ['A felucca ride at sunset', 'Dinner on the Nile', 'The Valley of the Kings'],
    ),
    includedServices: LL(
      ['الإقامة 3 ليالٍ', 'الإفطار يوميًا', 'المواصلات الداخلية'],
      ['Three nights’ accommodation', 'Daily breakfast', 'All local transport'],
    ),
    excludedServices: LL(['تذاكر القطار', 'الغداء والعشاء'], ['Train tickets', 'Lunch and dinner']),
    importantNotes: LL(['الحد الأدنى 6 أشخاص لتأكيد الرحلة.'], ['A minimum of 6 travellers confirms the trip.']),
    reservationInformation: L('عربون 30% لتأكيد الحجز.', 'A 30% deposit confirms the booking.'),
    coverImage: image('1553913861-c0fddf2619ee', 'معابد الأقصر', 'The temples of Luxor'),
    gallery: [
      image('1544735716-392fe2489ffa', 'النيل عند أسوان', 'The Nile at Aswan'),
      image('1523482580672-f109ba8cb9be', 'فلوكة على النيل', 'A felucca on the Nile'),
    ],
    startDate: day(-46),
    endDate: day(-43),
    reservationStartDate: day(-90),
    reservationEndDate: day(-50),
    price: 11500,
    currency: 'EGP',
    capacity: 20,
    availableSeats: 0,
    status: 'COMPLETED',
    published: true,
    featured: false,
    displayOrder: 3,
  },
];

const socialLinks = [
  { platform: 'whatsapp', url: 'https://wa.me/201012752911', label: '', enabled: true, displayOrder: 1 },
  { platform: 'facebook', url: 'https://facebook.com/twinfortravel', label: '', enabled: true, displayOrder: 2 },
  { platform: 'instagram', url: 'https://instagram.com/twinfortravel', label: '', enabled: true, displayOrder: 3 },
  { platform: 'tiktok', url: 'https://tiktok.com/@twinfortravel', label: '', enabled: true, displayOrder: 4 },
];

const settings = {
  key: 'site',
  companyName: L('توين للسياحة', 'Twin for Travel'),
  tagline: L('اكتشف • استكشف • استمتع', 'Explore • Discover • Enjoy'),
  about: L(
    'شركة سياحة مصرية تنظّم رحلات يومية ومتعددة الأيام إلى أجمل وجهات مصر، بنقل خاص مريح وأسعار واضحة.',
    'An Egyptian travel company running day trips and multi-day journeys to Egypt’s finest destinations, with comfortable private transport and transparent pricing.',
  ),
  whatsappNumber: '+20 101 275 2911',
  whatsappMessage: L('مرحبًا، أود الاستفسار عن رحلاتكم.', 'Hello, I’d like to ask about your trips.'),
  contactPhone: '+20 101 275 2911',
  contactEmail: 'hello@twinfortravel.example',
  address: L('القاهرة، مصر', 'Cairo, Egypt'),
  workingHours: L('يوميًا من 9 صباحًا حتى 9 مساءً', 'Daily, 9 am to 9 pm'),
  mapUrl: '',
  seoTitle: L('', ''),
  seoDescription: L('', ''),
};

if (values.reset) {
  await Promise.all([
    db.collection('trips').deleteMany({}),
    db.collection('sociallinks').deleteMany({}),
    db.collection('sitesettings').deleteMany({}),
  ]);
  console.log('• Cleared trips, social links and settings');
}

const now = new Date();
let insertedTrips = 0;

for (const trip of trips) {
  const result = await db
    .collection('trips')
    .updateOne(
      { slug: trip.slug },
      { $setOnInsert: { ...trip, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  if (result.upsertedCount) insertedTrips += 1;
}

let insertedLinks = 0;
for (const link of socialLinks) {
  const result = await db
    .collection('sociallinks')
    .updateOne(
      { platform: link.platform },
      { $setOnInsert: { ...link, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  if (result.upsertedCount) insertedLinks += 1;
}

await db
  .collection('sitesettings')
  .updateOne({ key: 'site' }, { $setOnInsert: { ...settings, createdAt: now, updatedAt: now } }, { upsert: true });

console.log(`\n✔ Seed complete — ${insertedTrips} trip(s), ${insertedLinks} social link(s), settings ensured.`);
console.log('  Existing documents were left untouched. Use --reset to start clean.\n');

await mongoose.disconnect();
