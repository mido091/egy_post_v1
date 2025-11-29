// English translations for Most Visited Offices
// Comprehensive list covering all Cairo and Giza offices
export const mostVisitedOfficesTranslations = {
  // Cairo Offices
  "شبرا فرعي": "Shubra Branch",
  "القاهره الرئيسي": "Cairo Main Office",
  "الحي السادس - مدينة نصر": "Sixth District - Nasr City",
  "باب الخلق": "Bab El-Khalq",
  السعوديه: "Al-Saudiya",
  اسكر: "Askar",
  الافضل: "Al-Afdal",
  "الحي الثاني - هليوبوليس": "Second District - Heliopolis",
  "بانوراما اكتوبر": "Panorama October",
  القطاميه: "Al-Qatamiya",
  "ابو رواش": "Abu Rawash",
  "وحدة مرور حدائق الاهرام": "Giza Pyramids Traffic Unit",
  "مدينة نصر": "Nasr City",
  المعادي: "Maadi",
  حلوان: "Helwan",
  "مصر الجديدة": "Heliopolis",
  الزمالك: "Zamalek",
  المطرية: "Matariya",
  "عين شمس": "Ain Shams",
  الزيتون: "El-Zeitoun",
  "السيدة زينب": "Sayeda Zeinab",
  الموسكي: "El-Mousky",
  العتبة: "Ataba",
  رمسيس: "Ramses",
  الدقي: "Dokki",
  المهندسين: "Mohandessin",
  "الزاوية الحمراء": "Zawya El-Hamra",
  "روض الفرج": "Rod El-Farag",
  الساحل: "El-Sahel",
  "حدائق القبة": "Hadayek El-Qobba",
  الوايلي: "El-Wayli",
  "منشية ناصر": "Manshiet Nasser",
  البساتين: "El-Basatin",
  "دار السلام": "Dar El-Salam",
  المرج: "El-Marg",
  "عزبة النخل": "Ezbet El-Nakhl",
  التبين: "El-Tabbin",
  "15 مايو": "15 May City",
  "القاهرة الجديدة": "New Cairo",
  "التجمع الخامس": "Fifth Settlement",
  الرحاب: "El-Rehab",
  مدينتي: "Madinaty",
  الشروق: "El-Shorouk",

  // Giza Offices
  الجيزة: "Giza",
  الهرم: "Haram",
  فيصل: "Faisal",
  العمرانية: "Omraneya",
  "بولاق الدكرور": "Bolaq El-Dakrour",
  الوراق: "El-Warraq",
  امبابة: "Imbaba",
  كرداسة: "Kerdasa",
  اوسيم: "Ausim",
  البدرشين: "El-Badrashein",
  الصف: "El-Saff",
  اطفيح: "Atfih",
  العياط: "El-Ayat",
  الحوامدية: "El-Hawamdiya",
  "منشأة القناطر": "Manshaat El-Qanater",
  "6 اكتوبر": "6th of October City",
  "الشيخ زايد": "Sheikh Zayed",
  "حدائق الاهرام": "Hadayek El-Ahram",
  المنيب: "El-Mounib",
  الطالبية: "Talbeya",
  "الجيزة الجديدة": "New Giza",
  المريوطية: "Marioutiya",
  ترسا: "Tersa",
  الباويطي: "El-Bawiti",
  الفرافرة: "El-Farafra",
};

/**
 * Checks if an office has an English translation available
 * @param {string} arabicName - The Arabic office name
 * @returns {boolean} - True if English translation exists
 */
export function hasEnglishTranslation(arabicName) {
  if (!arabicName) return false;
  // Trim whitespace to match translateOfficeName behavior
  const trimmedName = arabicName.trim();
  return !!mostVisitedOfficesTranslations[trimmedName];
}

/**
 * Translates office name for Most Visited Offices section
 * @param {string} arabicName - The Arabic office name
 * @param {string} locale - Current locale ('ar' or 'en')
 * @returns {string} - Translated name or original if not found
 */
export function translateOfficeName(arabicName, locale) {
  if (locale === "ar" || !arabicName) {
    return arabicName;
  }

  // Trim whitespace to avoid translation failures
  const trimmedName = arabicName.trim();

  // Return English translation if available, otherwise fallback to Arabic
  return mostVisitedOfficesTranslations[trimmedName] || arabicName;
}
