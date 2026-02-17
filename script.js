// Temel Ayarlar ve Sabitler
const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const prayerNamesTR = { 'Fajr': 'İmsak', 'Sunrise': 'Güneş', 'Dhuhr': 'Öğle', 'Asr': 'İkindi', 'Maghrib': 'Akşam', 'Isha': 'Yatsı' };
// 1. 81 İL LİSTESİ (En üste, sabitlerin yanına ekle)
const turkeyCities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın",
    "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
    "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
    "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
    "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya",
    "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
    "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
    "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

// 2. SAYFA YÜKLENDİĞİNDE ŞEHİRLERİ LİSTELE
document.addEventListener("DOMContentLoaded", () => {
    populateCityList(); // Yeni fonksiyon
    startRealTimeClock();
    fetchMonthlyData(currentCity);
    renderReligiousDaysTable();
});

// Şehirleri Listeye Dolduran Fonksiyon
function populateCityList() {
    const listContainer = document.getElementById('cityList');
    listContainer.innerHTML = ''; // Temizle

    turkeyCities.forEach(city => {
        const a = document.createElement('a');
        a.href = "#";
        a.innerText = city;
        // İngilizce karakter sorunu olmasın diye ID'yi düzeltiyoruz (İstanbul -> Istanbul)
        const cityId = city.replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');
        
        a.onclick = (e) => {
            e.preventDefault();
            changeCity(cityId, city);
            // Mobilde menüyü kapatmak istersen buraya ekleme yapılabilir
        };
        listContainer.appendChild(a);
    });
}

// Şehir Arama Fonksiyonu (Input içine yazıldıkça çalışır)
function filterCities() {
    const input = document.getElementById('citySearch');
    const filter = input.value.toLocaleUpperCase('tr-TR'); // Türkçe karakter duyarlı büyük harf
    const list = document.getElementById('cityList');
    const cities = list.getElementsByTagName('a');

    for (let i = 0; i < cities.length; i++) {
        const txtValue = cities[i].innerText;
        if (txtValue.toLocaleUpperCase('tr-TR').indexOf(filter) > -1) {
            cities[i].style.display = "";
        } else {
            cities[i].style.display = "none";
        }
    }
}

// 3. TARİHLERİ TÜRKÇE YAPMAK İÇİN "renderTables" GÜNCELLEMESİ
// Mevcut renderTables fonksiyonunu bununla tamamen değiştir:

function renderTables() {
    const weeklyBody = document.getElementById('weeklyTableBody');
    const monthlyBody = document.getElementById('monthlyTableBody');
    
    weeklyBody.innerHTML = '';
    monthlyBody.innerHTML = '';

    const today = new Date().getDate();

    monthlyData.forEach((dayData, index) => {
        const dateNum = index + 1;
        
        // --- TARİH DÜZELTME KISMI ---
        // API'den gelen gün, ay, yıl bilgisini alıyoruz
        const d = dayData.date.gregorian; 
        // JavaScript tarih objesi oluşturuyoruz (Ay 0'dan başladığı için -1 yapıyoruz)
        const dateObj = new Date(d.year, d.month.number - 1, d.day);
        
        // currentLang değişkenine göre tarihi formatla (Örn: 17 Şubat 2026 veya 17 February 2026)
        const miladiStr = dateObj.toLocaleDateString(currentLang === 'en' ? 'en-US' : (currentLang === 'ar' ? 'ar-SA' : 'tr-TR'), {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long' // Gün ismini de ekleyelim (Pazartesi vb.)
        });

        // Hicri Ay Çevirisi
        const hijriMonth = hijriMonthsTR[dayData.date.hijri.month.en] || dayData.date.hijri.month.en;
        const hicriStr = `${dayData.date.hijri.day} ${hijriMonth} ${dayData.date.hijri.year}`;
        
        const tr = document.createElement('tr');
        if(dateNum === today) tr.classList.add('today-row');

        tr.innerHTML = `
            <td>${miladiStr}</td>
            <td>${hicriStr}</td>
            <td>${dayData.timings.Fajr.split(' ')[0]}</td>
            <td>${dayData.timings.Sunrise.split(' ')[0]}</td>
            <td>${dayData.timings.Dhuhr.split(' ')[0]}</td>
            <td>${dayData.timings.Asr.split(' ')[0]}</td>
            <td>${dayData.timings.Maghrib.split(' ')[0]}</td>
            <td>${dayData.timings.Isha.split(' ')[0]}</td>
        `;

        monthlyBody.appendChild(tr.cloneNode(true));
        if(dateNum >= today && dateNum < today + 7) {
            weeklyBody.appendChild(tr);
        }
    });
}
// İngilizce Hicri ayları Türkçeye çevirmek için sözlük
const hijriMonthsTR = {
    "Muharram": "Muharrem", "Safar": "Safer", "Rabi' al-awwal": "Rebiülevvel", "Rabi' al-thani": "Rebiülahir",
    "Jumada al-awwal": "Cemaziyelevvel", "Jumada al-thani": "Cemaziyelahir", "Rajab": "Recep",
    "Sha'ban": "Şaban", "Ramadan": "Ramazan", "Shawwal": "Şevval",
    "Dhu al-Qi'dah": "Zilkade", "Dhu al-Hijjah": "Zilhicce"
};

let currentCity = 'Istanbul';
let monthlyData = [];
let countdownTimer;
let realTimeTimer;

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener("DOMContentLoaded", () => {
    startRealTimeClock();
    fetchMonthlyData(currentCity);
    renderReligiousDaysTable(); // 2026 Dini günler statik tablosu
});

// --- API VERİ ÇEKME İŞLEMİ ---
async function fetchMonthlyData(city) {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Aladhan API - method=13 (Diyanet İşleri Başkanlığı)
       const url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=Turkey&method=13&timezone=Europe/Istanbul`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            monthlyData = data.data;
            updateUI();
        } else {
            console.error("API Hatası:", data.status);
        }
    } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
    }
}

// Şehir Değiştirme Fonksiyonu
function changeCity(cityId, cityName) {
    currentCity = cityId;
    document.getElementById('selectedCityLabel').innerText = cityName;
    document.getElementById('cityDisplay').innerText = cityName.toUpperCase() + " İÇİN NAMAZ VAKİTLERİ";
    document.getElementById('tableTitleCity').innerText = cityName;
    document.getElementById('tableTitleCityMonthly').innerText = cityName;
    
    // Yeni şehrin verilerini çek
    fetchMonthlyData(currentCity);
}

// --- ARAYÜZ GÜNCELLEME ---
function updateUI() {
    const today = new Date().getDate(); // Bugünün günü (1-31)
    
    // API verisi 0. index = 1. gün şeklindedir
    const todayData = monthlyData[today - 1]; 
    const tomorrowData = monthlyData[today] || monthlyData[0]; // Ayın son günüyse hata vermesin

    // 1. Üst Dashboard Kartlarını Doldur
    renderTodayCards(todayData);

    // 2. Geri Sayımı Başlat
    startCountdown(todayData.timings, tomorrowData.timings);

    // 3. Tarih bilgisini yazdır
 const miladiDate = new Date().toLocaleDateString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

    const hijriMonthEn = todayData.date.hijri.month.en;
    const hijriDate = `${todayData.date.hijri.day} ${hijriMonthsTR[hijriMonthEn] || hijriMonthEn} ${todayData.date.hijri.year}`;
    document.getElementById('currentDateFull').innerText = `${miladiDate} | ${hijriDate}`;

    // 4. Tabloları Doldur
    renderTables();
}

function renderTodayCards(dayData) {
    const grid = document.getElementById('todayCards');
    grid.innerHTML = '';

    prayerKeys.forEach(key => {
        const timeVal = dayData.timings[key].split(' ')[0]; 
        const card = document.createElement('div');
        card.className = 'time-card';
        card.id = `card-${key}`;
        
        // translations nesnesindeki küçük harfli anahtarları (fajr, dhuhr vb.) kullanır
        const localizedName = translations[currentLang][key.toLowerCase()] || prayerNamesTR[key];

        card.innerHTML = `
            <div class="time-name">${localizedName}</div>
            <div class="time-val">${timeVal}</div>
        `;
        grid.appendChild(card);
    });
}

// --- GERİ SAYIM MANTIĞI ---
function startCountdown(todayTimings, tomorrowTimings) {
    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
);

        let nextPrayer = null;

        // Bugünün vakitlerini kontrol et
        for (let key of prayerKeys) {
            let timeStr = todayTimings[key].split(' ')[0];
            let [hours, minutes] = timeStr.split(':');
            
            let prayerTime = new Date();
            prayerTime.setHours(hours, minutes, 0, 0);

            if (prayerTime > now) {
                nextPrayer = { name: key, time: prayerTime };
                break;
            }
        }

        // Eğer bugünün tüm vakitleri geçtiyse (Yatsıdan sonra), YARININ İmsak vaktini al
        if (!nextPrayer) {
            let timeStr = tomorrowTimings['Fajr'].split(' ')[0];
            let [hours, minutes] = timeStr.split(':');
            
            let prayerTime = new Date();
            prayerTime.setDate(now.getDate() + 1); // Yarına geç
            prayerTime.setHours(hours, minutes, 0, 0);
            
            nextPrayer = { name: 'Fajr', time: prayerTime };
        }

        // Süre farkını hesapla
        const diff = nextPrayer.time - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Ekrana yazdır
        document.getElementById('countdown').innerText = 
            `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
       // startCountdown fonksiyonunun içindeki setInterval kısmında bu satırı bul ve değiştir:
document.getElementById('nextPrayerLabel').innerText = translations[currentLang].nextPrayer;

        // Aktif kartı renklendir
        document.querySelectorAll('.time-card').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById(`card-${nextPrayer.name}`);
        if(activeCard) activeCard.classList.add('active');

    }, 1000);
}

// Canlı Saat
function startRealTimeClock() {
    realTimeTimer = setInterval(() => {

        const turkeyNow = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
        );

        document.getElementById('realTimeClock').innerText =
            turkeyNow.toLocaleTimeString('tr-TR');

    }, 1000);
}


// --- TABLOLARI OLUŞTURMA ---
function renderTables() {
    const weeklyBody = document.getElementById('weeklyTableBody');
    const monthlyBody = document.getElementById('monthlyTableBody');
    
    weeklyBody.innerHTML = '';
    monthlyBody.innerHTML = '';

    const today = new Date().getDate();

    monthlyData.forEach((dayData, index) => {
        const dateNum = index + 1;
        
        // 1. Miladi Tarihi Seçilen Dile Göre Formatla
        const d = dayData.date.gregorian; 
        const dateObj = new Date(d.year, d.month.number - 1, d.day);
        
        const miladiStr = dateObj.toLocaleDateString(currentLang === 'en' ? 'en-US' : (currentLang === 'ar' ? 'ar-SA' : 'tr-TR'), {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });

        // 2. Hicri Ayı Türkçeleştir (Sadece TR seçiliyse)
        const hijriMonth = (currentLang === 'tr') ? (hijriMonthsTR[dayData.date.hijri.month.en] || dayData.date.hijri.month.en) : dayData.date.hijri.month.en;
        const hicriStr = `${dayData.date.hijri.day} ${hijriMonth} ${dayData.date.hijri.year}`;
        
        const tr = document.createElement('tr');
        if(dateNum === today) tr.classList.add('today-row');

        tr.innerHTML = `
            <td>${miladiStr}</td>
            <td>${hicriStr}</td>
            <td>${dayData.timings.Fajr.split(' ')[0]}</td>
            <td>${dayData.timings.Sunrise.split(' ')[0]}</td>
            <td>${dayData.timings.Dhuhr.split(' ')[0]}</td>
            <td>${dayData.timings.Asr.split(' ')[0]}</td>
            <td>${dayData.timings.Maghrib.split(' ')[0]}</td>
            <td>${dayData.timings.Isha.split(' ')[0]}</td>
        `;

        monthlyBody.appendChild(tr.cloneNode(true));
        if(dateNum >= today && dateNum < today + 7) {
            weeklyBody.appendChild(tr);
        }
    });
}

// --- DİNİ GÜNLER TABLOSU (2026 İçin Örnek Veri) ---
function renderReligiousDaysTable() {
    // 2026 yılı önemli dini günler listesi (Diyanet takvimine göre tahmini/kesin tarihler)
    const religiousDays2026 = [
        { name: "Üç Ayların Başlangıcı", miladi: "19 Şubat 2026 Perşembe", hicri: "1 Receb 1447" },
        { name: "Regaib Kandili", miladi: "19 Şubat 2026 Perşembe", hicri: "1 Receb 1447" },
        { name: "Mirac Kandili", miladi: "13 Mart 2026 Cuma", hicri: "24 Receb 1447" },
        { name: "Berat Kandili", miladi: "31 Mart 2026 Salı", hicri: "14 Şaban 1447" },
        { name: "Ramazan Başlangıcı", miladi: "17 Nisan 2026 Cuma", hicri: "1 Ramazan 1447" },
        { name: "Kadir Gecesi", miladi: "13 Mayıs 2026 Çarşamba", hicri: "27 Ramazan 1447" },
        { name: "Ramazan Bayramı (1. Gün)", miladi: "17 Mayıs 2026 Pazar", hicri: "1 Şevval 1447" },
        { name: "Kurban Bayramı (1. Gün)", miladi: "24 Temmuz 2026 Cuma", hicri: "10 Zilhicce 1447" }
    ];

    const tbody = document.getElementById('religiousDaysBody');
    religiousDays2026.forEach(day => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:bold; color:var(--primary-dark);">${day.name}</td>
            <td>${day.miladi}</td>
            <td>${day.hicri}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- SEKME (TAB) DEĞİŞTİRME MANTIĞI ---
window.switchTab = function(tabId) {
    // Tüm içerikleri gizle
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    // Tüm butonlardan active sınıfını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Seçileni aktif et
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`btn-${tabId}`).classList.add('active');
}
const translations = {
    tr: {
        weekly: "Haftalık Namaz Vakti",
        monthly: "Aylık Namaz Vakitleri",
        religiousDays: "2026 Dini Günler",
        qibla: "Kıble",
        fajr: "İmsak", sunrise: "Güneş", dhuhr: "Öğle", asr: "İkindi", maghrib: "Akşam", isha: "Yatsı",
        nextPrayer: "SIRADAKİ VAKTE KALAN SÜRE",
        currentTime: "ŞU ANKİ SAAT",
        miladiDate: "Miladi Tarih", hicriDate: "Hicri Tarih"
    },
    en: {
        weekly: "Weekly Prayer Times",
        monthly: "Monthly Prayer Times",
        religiousDays: "2026 Religious Days",
        qibla: "Qibla",
        fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
        nextPrayer: "TIME REMAINING TO NEXT PRAYER",
        currentTime: "CURRENT TIME",
        miladiDate: "Gregorian Date", hicriDate: "Hijri Date"
    },
    ar: {
        weekly: "أوقات الصلاة الأسبوعية",
        monthly: "أوقات الصلاة الشهرية",
        religiousDays: "الأيام الدينية 2026",
        qibla: "القبلة",
        fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء",
        nextPrayer: "الوقت المتبقي للصلاة القادمة",
        currentTime: "الوقت الحالي",
        miladiDate: "التاريخ الميلادي", hicriDate: "التاريخ الهجري"
    }
};

let currentLang = 'tr'; // Seçili dili takip etmek için

function changeLanguage(lang) {
    currentLang = lang;
    
    // 1. data-i18n olan yerleri değiştir (Navbar vb.)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // 2. Sayfa yönünü ayarla (Arapça için sağdan sola)
    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // 3. EKRANI YENİLE (En önemli kısım burası)
    updateUI(); 
    renderTables();
    if (typeof updateDailyContentUI === "function") {
    updateDailyContentUI();
}
}
/* -------------------------------------------------------------------------- */
/* GELİŞMİŞ MANEVİYAT KARTI (AYET + ESMA + GÖRSEL)                            */
/* -------------------------------------------------------------------------- */

let dailyContentData = null;

// Esmaül Hüsna Listesi (Örnek olarak bir kısmını ekledim, döngüyle döner)
const esmaList = [
    { name: "Er-Rahmân", meaning: "Dünyada bütün mahlûkata merhamet eden." },
    { name: "Er-Rahîm", meaning: "Ahirette sadece müminlere merhamet eden." },
    { name: "El-Melik", meaning: "Mülkün, kâinatın sahibi, mülk ve saltanatı devamlı olan." },
    { name: "El-Kuddûs", meaning: "Her noksanlıktan uzak ve her türlü takdîse lâyık olan." },
    { name: "Es-Selâm", meaning: "Her türlü tehlikelerden selamete erdiren." },
    { name: "El-Mü’min", meaning: "Güven veren, emin kılan, koruyan." },
    { name: "El-Müheymin", meaning: "Her şeyi görüp gözeten." },
    { name: "El-Azîz", meaning: "İzzet sahibi, her şeye galip olan." },
    { name: "El-Cebbâr", meaning: "Azamet ve kudret sahibi. Dilediğini yapan ve yaptıran." },
    { name: "El-Mütekebbir", meaning: "Büyüklükte eşi, benzeri olmayan." },
    { name: "El-Hâlık", meaning: "Yaratan, yoktan var eden." },
    { name: "El-Bâri", meaning: "Her şeyi kusursuz ve uyumlu yaratan." },
    { name: "El-Musavvir", meaning: "Varlıklara şekil veren." },
    { name: "El-Gaffâr", meaning: "Günahları örten ve çok mağfiret eden." },
    { name: "El-Kahhâr", meaning: "Her şeye, her istediğini yapacak surette galip ve hakim olan." },
    { name: "El-Vehhâb", meaning: "Karşılıksız hibeler veren, çok fazla ihsan eden." },
    { name: "Er-Rezzâk", meaning: "Bütün mahlûkatın rızkını veren ve ihtiyacını karşılayan." },
    { name: "El-Fettâh", meaning: "Her türlü müşkülleri açan ve kolaylaştıran." },
    { name: "El-Alîm", meaning: "Her şeyi en ince noktasına kadar bilen." },
    { name: "El-Vedûd", meaning: "İyi kullarını seven, onları rahmet ve rızasına erdiren." }
];

document.addEventListener("DOMContentLoaded", () => {
    // Diğer başlangıç fonksiyonların...
    loadSpiritualCard();
});

async function loadSpiritualCard() {
    // 1. Günün Sayısını Bul (Yılın kaçıncı günü)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // --- A. GÖRSEL AYARLA ---
    // Her gün değişen ama gün içinde sabit kalan doğa/huzur görseli (Picsum Seed)
    // Boyut: 600x800 (Dikey/Kareye yakın)
    const imgElement = document.getElementById('dailyImage');
    if(imgElement) {
        imgElement.src = `https://picsum.photos/seed/${dayOfYear}/600/800?grayscale&blur=1`; 
        // Not: Grayscale ve blur ekledim ki yazı daha iyi okunsun, istersen kaldırabilirsin.
        // Renkli istiyorsan: `https://picsum.photos/seed/${dayOfYear}/600/800`
    }

    // --- B. ESMAÜL HÜSNA AYARLA ---
    // Listeden günü mod alarak seç
    const esmaIndex = dayOfYear % esmaList.length;
    const selectedEsma = esmaList[esmaIndex];
    
    document.getElementById('esmaTitle').innerText = selectedEsma.name;
    document.getElementById('esmaMeaning').innerText = selectedEsma.meaning;

    // --- C. AYET ÇEK (API) ---
    fetchDailyVerse(dayOfYear);
}

async function fetchDailyVerse(daySeed) {
    const infoText = document.getElementById('infoText');
    const infoSource = document.getElementById('infoSource');

    // Kuran 6236 ayet.
    const ayahIndex = (daySeed % 6236) + 1;
    const apiUrl = `https://api.alquran.cloud/v1/ayah/${ayahIndex}/editions/quran-uthmani,tr.diyanet,en.sahih`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.code === 200) {
            dailyContentData = {
                ar: { text: data.data[0].text, source: `Surah ${data.data[0].surah.englishName}, ${data.data[0].numberInSurah}` },
                tr: { text: data.data[1].text, source: `${data.data[1].surah.name} Suresi, ${data.data[1].numberInSurah}. Ayet` },
                en: { text: data.data[2].text, source: `Surah ${data.data[2].surah.englishName}, Verse ${data.data[2].numberInSurah}` }
            };
            updateDailyContentUI();
        }
    } catch (error) {
        console.error("API Error:", error);
        infoText.innerText = "İnternet bağlantısı kontrol ediliyor...";
    }
}

function updateDailyContentUI() {
    if (!dailyContentData) return;

    const lang = currentLang || 'tr'; 
    const infoText = document.getElementById('infoText');
    const infoSource = document.getElementById('infoSource');
    const title = document.querySelector('[data-i18n="dailyInfoTitle"]');
    const shareSpan = document.querySelector('[data-i18n="share"]');

    // Başlık ve Buton Çevirileri
    const uiText = {
        tr: { title: "Günün Ayeti", share: "Paylaş" },
        en: { title: "Verse of the Day", share: "Share" },
        ar: { title: "آية اليوم", share: "مشاركة" }
    };

    if(title) title.innerText = uiText[lang].title;
    if(shareSpan) shareSpan.innerText = uiText[lang].share;

    // İçerik
    infoText.style.opacity = 0;
    setTimeout(() => {
        infoText.innerText = `"${dailyContentData[lang].text}"`;
        infoSource.innerText = dailyContentData[lang].source;
        
        if (lang === 'ar') {
            infoText.style.fontFamily = "'Amiri', serif";
            infoText.style.fontSize = "1.6rem";
            infoText.dir = "rtl";
        } else {
            infoText.style.fontFamily = "inherit";
            infoText.style.fontSize = "1.3rem";
            infoText.dir = "ltr";
        }
        infoText.style.opacity = 1;
    }, 200);
}

// Paylaş Butonu Özelliği
function shareContent() {
    const dayIndex = new Date().getDay();
    const msg = weeklyMessages[dayIndex];
    const shareUrl = window.location.origin + window.location.pathname + "#spiritualCard";

    // WhatsApp formatına uygun (boldlar ve emojiler eklenmiş)
    const fullMessage = `*${msg.title}*\n\n"${msg.text}"\n\n_${msg.viral}_\n\n👇 Detaylı Vakitler ve Ayetler İçin:\n${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: msg.title,
            text: fullMessage,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(fullMessage);
        alert("Mesaj kopyalandı! Şimdi WhatsApp gruplarında paylaşabilirsin.");
    }
}
/* --- HAFTALIK OTOMATİK MESAJ SİSTEMİ --- */
const weeklyMessages = {
    0: { // Pazar
        title: "Hayırlı Pazarlar",
        text: "Yeni bir güne, yeni bir haftaya huzurla başlamayı nasip et Allah'ım. Sevdiklerinizle mutlu bir gün dileriz.",
        viral: "Bu huzuru paylaşmak için 5 kişiye gönderin, gönüller bir olsun."
    },
    1: { // Pazartesi
        title: "Hayırlı Haftalar",
        text: "Pazartesi bereketidir. Rızkınız bol, işleriniz asan, haftanız aydınlık olsun.",
        viral: "Haftaya dua ile başlamak için sevdiklerinizle paylaşın."
    },
    2: { // Salı
        title: "Günün Duası",
        text: "Allah'ım, kalbimize inşirah, ömrümüze bereket ver. Bizleri darda koyma.",
        viral: "Bir dua bin şifadır. Paylaşalım, vesile olalım."
    },
    3: { // Çarşamba
        title: "Huzur Vakti",
        text: "Gününüz hayırla dolsun. Rabbim dualarınızı kabul, niyetlerinizi makbul eylesin.",
        viral: "Hayra vesile olan, hayrı yapan gibidir. Paylaşın."
    },
    4: { // Perşembe
        title: "Cuma Gecesi (Mübarek Gün)",
        text: "Rahmetin ve bereketin sağanak olduğu bu kutlu geceye bizleri ulaştıran Rabbimize hamd olsun.",
        viral: "Cuma'nın müjdesini sevdiklerinize şimdiden ulaştırın."
    },
    5: { // Cuma
        title: "Hayırlı Cumalar",
        text: "Bugün duaların kabul olduğu mübarek Cuma günüdür. Rabbim sizi ve ailenizi her türlü kaza ve beladan korusun.",
        viral: "Bu mübarek günde 10 kişiye selam gönderin, meleklerin duasına ortak olun! ✨"
    },
    6: { // Cumartesi
        title: "Hafta Sonu Selamı",
        text: "Dinlenmek ve tefekkür etmek için ne güzel bir gün. Sağlık ve afiyetle geçecek bir hafta sonu dileriz.",
        viral: "Sevdiklerinize bir selam gönderin, bağlarımızı kuvvetlendirelim."
    }
};

function loadWeeklyInspiration() {
    const dayIndex = new Date().getDay(); // 0-6 arası gün kodu
    const messageData = weeklyMessages[dayIndex];
    
    // HTML'deki ilgili alanları güncelle (ID'lerin index.html ile uyumlu olması lazım)
    const titleElement = document.getElementById('esmaTitle');
    const textElement = document.getElementById('infoText');
    const viralElement = document.getElementById('esmaMeaning'); // Viral teşviği buraya yazalım
    const badge = document.querySelector('.badge-esma');

    if(titleElement) titleElement.innerText = messageData.title;
    if(textElement) textElement.innerText = `"${messageData.text}"`;
    if(viralElement) viralElement.innerText = messageData.viral;
    if(badge) badge.innerText = "Günün Mesajı";
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", loadWeeklyInspiration);
// Sayfa yüklendiğinde mesajları basar
window.onload = function() {
    if (typeof loadWeeklyInspiration === "function") {
        loadWeeklyInspiration();
    }
};
