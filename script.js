document.addEventListener('DOMContentLoaded', function () {

    let map;
    let allMarkers = [];
    let markersLayer; 
    let currentView = 'origin', currentTheme = 'light', currentLang = 'tr', currentViewType = 'map';
    let tileLayer;
    
    // DOM Elementleri
    
    const settingsDropdown = document.getElementById('settings-dropdown');
    const filterModal = document.getElementById('filter-modal');
    const introTourOverlay = document.getElementById('intro-tour-overlay');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const modelViewerModal = document.getElementById('model-viewer-modal');
    const artifactModelViewer = document.getElementById('artifact-model');
    const closeModelViewerBtn = document.getElementById('close-model-viewer');
    const quizPanel = document.getElementById('quiz-panel');
    const quizToggleBtn = document.getElementById('quiz-toggle-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const endQuizBtn = document.getElementById('end-quiz-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const quizStartScreen = document.getElementById('quiz-start-screen');
    const quizGameScreen = document.getElementById('quiz-game-screen');
    const quizEndScreen = document.getElementById('quiz-end-screen');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizQuestionCounterEl = document.getElementById('quiz-question-counter');
    const quizQuestionTextEl = document.getElementById('quiz-question-text');
    const quizHintTextEl = document.getElementById('quiz-hint-text'); 
    const debugCounter = document.getElementById('debug-counter');
    
    // Hoş Geldiniz Ekranı Elementleri
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const closeWelcomeButton = document.getElementById('close-welcome');
    const openHelpButton = document.getElementById('open-help');
    const startGameButton = document.getElementById('start-game');

    let gameState = {
        isActive: false, score: 0, currentQuestionIndex: 0, questions: [],
        totalQuestions: 5, targetLocation: null, targetEserId: null 
    };

    const GreenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

    const translations = {
        tr: {
            pageTitle: "Yurduna Dönen Kültürel Miras Haritası", mapView: "Harita Görünümü", originLabel: "Ait Olduğu Yer", returnedLabel: "Getirildiği Yer", viewType: "Görünüm Türü", map: "Harita", satellite: "Uydu", theme: "Tema", light: "Açık", dark: "Koyu", language: "Dil", 
            filterTitle: "Eserleri Filtrele", filterReturnedCountry: "Getirildiği Ülke:", filterOriginCity: "Ait Olduğu Şehir (TR):", filterExhibitionCity: "Sergilendiği Şehir (TR):", filterPeriod: "Eserin Dönemi:", 
            applyFilterBtn: "Filtrele", resetFilterBtn: "Sıfırla", 
            museum: "Sergilendiği Müze:", exhibitionPlace: "Sergilendiği Yer:", originPlace: "Ait Olduğu Yer (Köken):", returnedFrom: "Getirildiği Yer:", 
            period: "Dönem:", returnDate: "İade Tarihi:", academicInfo: "Akademik Özet:",
            searchPlaceholder: "Eser veya müze ara...", 
            quizTitle: "Konum Bulma Oyunu", quizDescription: "Rastgele seçilen 5 eserin konumunu haritada tahmin et. Her doğru tahmin 20 puan, her yanlış tahmin -5 puandır!", quizStartBtn: "Oyuna Başla", quizScoreLabel: "Puan:", quizQuestionLabel: "Soru:", quizEndBtn: "Oyunu Bitir", quizGameOver: "Oyun Bitti!", quizFinalScoreLabel: "Toplam Puan:", quizPlayAgainBtn: "Tekrar Oyna", 
            quizQuestionTemplateOrigin: "'{eserAdi}' adlı eserin kökeni (ait olduğu yer) neresidir?", quizQuestionTemplateReturned: "'{eserAdi}' adlı eser nereden getirilmiştir?", quizHintLabel: "İpucu: ",
            hintTemplate: "{distance} km {direction} yönünde.",
            wrongGuess: "Yanlış tahmin!",
            directions: ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'],
            introStep1Title: "Hoş Geldiniz!", introStep1Text: "Bu harita, yurduna dönen eserlerimizi keşfetmeniz için hazırlandı. Kısaca özellikleri tanıyalım.", tutorialNext: "İleri", introStep2Title: "Konum Bulma Oyunu", introStep2Text: "Bu buton ile eserlerin yerini tahmin etmeye dayalı eğlenceli bir oyun oynayabilirsiniz.", introStep3Title: "Detaylı Yardım", introStep3Text: "Tüm özellikleri ve detayları öğrenmek isterseniz, dilediğiniz zaman bu yardım butonuna tıklayabilirsiniz.", introStep4Title: "Keşfe Başla!", introStep4Text: "Artık haritayı keşfetmeye hazırsınız. İyi eğlenceler!", tutorialEnd: "Haritayı Keşfet", tutorialSkip: "Turu Atla",
            helpStep1Title: "Detaylı Yardım", helpStep1Text: "Bu interaktif harita, yurt dışından Türkiye'ye iadesi başarıyla sağlanmış kültürel mirasımızı keşfetmeniz için tasarlandı. Gelin, tüm özellikleri detaylıca inceleyelim.", helpStep2Title: "Harita ve Eserler", helpStep2Text: "Haritadaki yeşil daireler, o bölgedeki eser gruplarını gösterir. Yaklaştıkça veya tıkladıkça eserlerin tekil imleçleri görünür. Her imlece tıklayarak eserin kökeni, sergilendiği müze ve iade edildiği yer gibi detaylara ulaşabilirsiniz.", helpStep3Title: "Arama", helpStep3Text: "Belirli bir eseri, müzeyi veya şehri bulmak için üstteki arama çubuğunu kullanabilirsiniz.", helpStep4Title: "Filtreleme", helpStep4Text: "Eserleri; getirildiği ülkeye, Türkiye'deki köken şehrine, sergilendiği şehre veya ait olduğu döneme göre filtreleyerek aramanızı daraltabilirsiniz.", helpStep5Title: "Konum Bulma Oyunu", helpStep5Text: "Oyunun amacı, sorulan eserin o anki harita görünümüne göre yerini tahmin etmektir. Eğer harita \"Ait Olduğu Yer\" modundaysa eserin kökenini, \"Getirildiği Yer\" modundaysa yurt dışındaki eski yerini tahmin etmeniz istenir. Doğru tahmin +20, yanlış tahmin -5 puandır.", helpStep6Title: "Ayarlar", helpStep6Text: "Bu menüden harita görünümünü (Ait Olduğu Yer / Getirildiği Yer), harita türünü (Harita / Uydu), temayı (Açık / Koyu) ve dili (TR / EN) değiştirebilirsiniz.", helpStep7Title: "Harita Kontrolleri", helpStep7Text: "Haritaya yakınlaşmak ve uzaklaşmak için bu kontrol butonlarını kullanabilirsiniz."
        },
        en: { 
            pageTitle: "Map of Returned Cultural Heritage", mapView: "Map View", originLabel: "Place of Origin", returnedLabel: "Place Returned From", viewType: "View Type", map: "Map", satellite: "Satellite", theme: "Theme", light: "Light", dark: "Dark", language: "Language", filterTitle: "Filter Artifacts", filterReturnedCountry: "Country Returned From:", filterOriginCity: "City of Origin (TR):", filterExhibitionCity: "City of Exhibition (TR):", filterPeriod: "Period of Artifact:", applyFilterBtn: "Apply Filter", resetFilterBtn: "Reset Filters", museum: "Exhibited at:", exhibitionPlace: "Exhibition Place:", originPlace: "Place of Origin:", returnedFrom: "Returned From:", period: "Period:", returnDate: "Date of Return:", academicInfo: "Academic Summary:", searchPlaceholder: "Search for artifact or museum...", quizTitle: "Location Guessing Game", quizDescription: "Guess the location of 5 randomly selected artifacts on the map. Each correct guess is 20 points, each wrong guess is -5 points!", quizStartBtn: "Start Game", quizScoreLabel: "Score:", quizQuestionLabel: "Question:", quizEndBtn: "End Game", quizGameOver: "Game Over!", quizFinalScoreLabel: "Final Score:", quizPlayAgainBtn: "Play Again", 
            quizQuestionTemplateOrigin: "What is the origin (original place) of the artifact '{eserAdi}'?", quizQuestionTemplateReturned: "From where was the artifact '{eserAdi}' returned?", quizHintLabel: "Hint: ",
            hintTemplate: "{distance} km to the {direction}.", wrongGuess: "Wrong guess!",
            directions: ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'],
            introStep1Title: "Welcome!", introStep1Text: "This map is designed for you to explore our cultural heritage that has been returned home. Let's get to know the features briefly.", tutorialNext: "Next", introStep2Title: "Location Guessing Game", introStep2Text: "With this button, you can play a fun game based on guessing the location of the artifacts.", introStep3Title: "Detailed Help", introStep3Text: "If you want to learn all the features and details, you can click this help button at any time.", introStep4Title: "Start Exploring!", introStep4Text: "You are now ready to explore the map. Have fun!", tutorialEnd: "Explore the Map", tutorialSkip: "Skip Tour",
            helpStep1Title: "Detailed Help", helpStep1Text: "This interactive map is designed for you to explore our cultural heritage that has been successfully returned to Turkey from abroad. Let's take a detailed look at all the features.", helpStep2Title: "Harita ve Eserler", helpStep2Text: "Haritadaki yeşil daireler, o bölgedeki eser gruplarını gösterir. Yaklaştıkça veya tıkladıkça eserlerin tekil imleçleri görünür. Her imlece tıklayarak eserin kökeni, sergilendiği müze ve iade edildiği yer gibi detaylara ulaşabilirsiniz.", helpStep3Title: "Search", helpStep3Text: "You can use the search bar at the top to find a specific artifact, museum, or city.", helpStep4Title: "Filtering", helpStep4Text: "You can narrow your search by filtering artifacts by the country they were returned from, their city of origin in Turkey, the city of exhibition, or their historical period.", helpStep5Title: "Location Guessing Game", helpStep5Text: "The goal of the game is to guess the location of the asked artifact according to the current map view. If the map is in \"Place of Origin\" mode, you'll be asked to guess its origin; if it's in \"Place Returned From\" mode, you'll guess its former location abroad. A correct guess is +20 points, a wrong guess is -5 points.", helpStep6Title: "Settings", helpStep6Text: "From this menu, you can change the map view (Place of Origin / Place Returned From), map type (Map / Satellite), theme (Light / Dark), and language (TR / EN) değiştirebilirsiniz.", helpStep7Title: "Map Controls", helpStep7Text: "You can use these control buttons to zoom in and out of the map."
        }
    };
    
    // YENİ ESERLER DİZİSİ - Bronz İmparator Heykeli (id: 15) KALDIRILDI.
    const eserler = [
        { id: 1, title: "Lahit Parçası", title_en: "Sarcophagus Fragment", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Isparta", kokenSehirTR_en: "Isparta", kokenLatTR: 37.7648, kokenLngTR: 30.5566, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2020", image: "lahitparcasi.jpg", description: "Isparta Göksöğüt kökenli Sidamara tipi lahdin 1980'lerde çalınan ve Londra'daki müzayede evinde tespit edilen iki eksik parçasından biridir.", description_en: "One of two missing fragments of the Isparta-Göksöğüt Sidamara type sarcophagus, stolen in the 1980s and traced to a London auction house. Returned after a long legal process to be reunited with the main artifact.", academicDescription: "M.S. 3. yüzyıla tarihlenen, yüksek kabartmalı Sidamara tipi lahdin parçasıdır. Eser, 1987 ve 1988 yılları arasında çalındığı tespit edilmiş, KTB'nin titiz takibi sonucu İngiltere'den geri getirilmiştir. <a href='https://kvmgm.ktb.gov.tr/TR-247050/isparta-kokenli-lahit-parcasi-ve-tunc-boga-arabasi-figuru-yurduna-donuyor.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A fragment of a high-relief Sidamara type sarcophagus, dated to the 3rd century AD. The piece was determined to be stolen between 1987 and 1988 and was repatriated from the UK due to meticulous tracking by the Ministry of Culture and Tourism. <a href='https://kvmgm.ktb.gov.tr/TR-247050/isparta-kokenli-lahit-parcasi-ve-tunc-boga-arabasi-figuru-yurduna-donuyor.html' target='_blank'>(More Info)</a>", },
        { id: 2, title: "Tunç Boğa Arabası", title_en: "Bronze Bull Cart", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Tunç Çağı", donem_en: "Bronze Age", iadeYili: "2020", image: "tuncbogaarabasi.jpg", description: "Londra'daki Bonham's Müzayede Evi'nde satışa çıkarılan, M.Ö. 2-3. bine tarihlenen iki boğa tarafından çekilen Anadolu kökenli araba modelidir.", description_en: "An Anatolian-origin cart model pulled by two bulls, dated to the 3rd-2nd millennium BC, and put up for sale at Bonham's Auction House in London.", academicDescription: "M.Ö. 2-3. bine (Erken Tunç Çağı) tarihlenen, Şanlıurfa Müzesi koleksiyonundakilere benzerliği kanıtlanmış, dini veya ritüel amaçlı kullanıldığı düşünülen tunç araba modeli. <a href='https://kvmgm.ktb.gov.tr/TR-247050/isparta-kokenli-lahit-parcasi-ve-tunc-boga-arabasi-figuru-yurduna-donuyor.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A bronze cart model dated to the 3rd-2nd millennium BC (Early Bronze Age), proven to be similar to pieces in the Şanlıurfa Museum collection, and thought to be used for religious or ritual purposes. <a href='https://kvmgm.ktb.gov.tr/TR-247050/isparta-kokenli-lahit-parcasi-ve-tunc-boga-arabasi-figuru-yurduna-donuyor.html' target='_blank'>(More Info)</a>", },
        { id: 3, title: "Lidya Yazıtı", title_en: "Lydian Inscription", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Roma", iadeSehir_en: "Rome", iadeUlke: "İtalya", iadeUlke_en: "Italy", iadeLat: 41.9028, iadeLng: 12.4964, donem: "Lidya Dönemi", donem_en: "Lydian Period", iadeYili: "2020", image: "lidyayaziti.jpg", description: "Yaklaşık 1800 yıllık Lidya dönemine ait yazıt, İtalya'dan titiz takip sonucu Anadolu Medeniyetleri Müzesi'ne getirilmiştir.", description_en: "An approximately 1800-year-old Lydian period inscription, returned from Italy after meticulous tracking and brought to the Museum of Anatolian Civilizations.", academicDescription: "M.S. 2. yüzyıla (Lidya dönemi) tarihlenen, büyük boyutlu bir yazıttır. Anadolu'nun kültürel mirası açısından önemli bir epigrafi belgesidir ve Bakanlık takibi sonucu iadesi sağlanmıştır. <a href='https://kvmgm.ktb.gov.tr/TR-274815/italya-dan-iadesi-saglanan-lidya-yaziti-ana-vataninda.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A large-scale inscription dated to the 2nd century AD (Lydian period). It is an important epigraphic document for Anatolian cultural heritage and its repatriation was secured through Ministry efforts. <a href='https://kvmgm.ktb.gov.tr/TR-274815/italya-dan-iadesi-saglanan-lidya-yaziti-ana-vataninda.html' target='_blank'>(More Info)</a>", },
        { id: 4, title: "Adak Heykeli 'Kybele'", title_en: "Votive Statue 'Cybele'", model: null, sergiLat: 38.7753, sergiLng: 30.5401, sergiSehir: "Afyonkarahisar", sergiSehir_en: "Afyonkarahisar", museum: "Afyonkarahisar Müzesi", museum_en: "Afyonkarahisar Museum", kokenSehirTR: "Afyonkarahisar", kokenSehirTR_en: "Afyonkarahisar", kokenLatTR: 38.7567, kokenLngTR: 30.5280, iadeSehir: "New York", iadeSehir_en: "New York", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2020", image: "adakheykelikybele.jpg", description: "60 yıl sonra ABD'den iadesi sağlanan, Anadolu'nun Ana Tanrıçası Kybele'ye adanmış mermer adak heykelidir. New York'ta ele geçirilmiştir.", description_en: "A marble votive statue dedicated to Cybele, the Mother Goddess of Anatolia, returned from the USA after 60 years. It was seized in New York.", academicDescription: "M.S. 3. yüzyıl başlarına tarihlenen mermer Kybele heykeli. Eser, ABD'de dava başlamadan uzlaşmacı yollarla iade edilmiştir. Kybele kültü ve Roma dönemi adak gelenekleri hakkında bilgi sunar. <a href='https://kvmgm.ktb.gov.tr/TR-278567/adak-heykeli-kybele-60-yil-sonra-yeniden-turkiye39de.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A marble Cybele statue dated to the early 3rd century AD. The artifact was returned amicably before court proceedings in the USA. It offers insight into the Cybele cult and Roman votive traditions. <a href='https://kvmgm.ktb.gov.tr/TR-278567/adak-heykeli-kybele-60-yil-sonra-yeniden-turkiye39de.html' target='_blank'>(More Info)</a>", },
        { id: 5, title: "Pişmiş Toprak Figürü ve Figürün Başı", title_en: "Terracotta Figurine and Figurine Head", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Hatay", kokenSehirTR_en: "Hatay", kokenLatTR: 36.4019, kokenLngTR: 36.3501, iadeSehir: "Paris", iadeSehir_en: "Paris", iadeUlke: "Fransa", iadeUlke_en: "France", iadeLat: 48.8566, iadeLng: 2.3522, donem: "Orta Tunç Çağı", donem_en: "Middle Bronze Age", iadeYili: "2021", image: "pismistoprakfiguruvefigurunbasi.jpg", description: "Paris'teki bir müzayede evinden satın alınan, Hatay/Amik Ovası kökenli pişmiş toprak figürinler gönüllü olarak iade edilmiştir.", description_en: "Terracotta figurines originating from Hatay/Amik Plain, purchased at a Paris auction house and voluntarily returned.", academicDescription: "Orta Tunç Çağı II (M.Ö. 1800-1600) dönemine ait bu eserler, Doğu Kilikya ve Amik Ovası'nda yaygın olan, yassı formlu ve bereketi temsil eden tanrıça kültüyle ilişkili dini nesnelerdir. <a href='https://kvmgm.ktb.gov.tr/TR-289162/116-fransadan-gonullu-iade-alinan-pismis-toprak-figurin-ve-figurin-basi-2-adet-2021.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "Dated to the Middle Bronze Age II (1800-1600 BC), these objects are flat-form religious items associated with the fertility goddess cult, common in East Cilicia and the Amik Plain. <a href='https://kvmgm.ktb.gov.tr/TR-289162/116-fransadan-gonullu-iade-alinan-pismis-toprak-figurin-ve-figurin-basi-2-adet-2021.html' target='_blank'>(More Info)</a>", },
        { id: 6, title: "Sinop Amphorası", title_en: "Sinop Amphora", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Sinop", kokenSehirTR_en: "Sinop", kokenLatTR: 42.0270, kokenLngTR: 35.1507, iadeSehir: "San Diego", iadeSehir_en: "San Diego", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 32.7157, iadeLng: -117.1611, donem: "Bizans Dönemi", donem_en: "Byzantine Period", iadeYili: "2021", image: "sinopamphroasi.jpg", description: "San Diego'da yaşayan bir kişi tarafından gönüllü iade edilen iki amforadan biri. Karadeniz ticaretine ait önemli bir buluntudur.", description_en: "One of two amphorae voluntarily returned by a resident in San Diego, USA. It is an important finding related to Black Sea trade.", academicDescription: "M.S. 7. yüzyıla tarihlenen, Karadeniz bölgesinde şarap, zeytinyağı ve balık sosu taşımacılığında yaygın olarak kullanılan bir Bizans amfora tipidir. <a href='https://kvmgm.ktb.gov.tr/TR-289261/118-abdden-gonullu-iade-alinan-amphoralar-2-adet-2021.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A Byzantine amphora type, dated to the 7th century AD, commonly used in the Black Sea region for transporting wine, olive oil, and fish sauce. <a href='https://kvmgm.ktb.gov.tr/TR-289261/118-abdden-gonullu-iade-alinan-amphoralar-2-adet-2021.html' target='_blank'>(More Info)</a>", },
        { id: 7, title: "Günsenin Amphorası", title_en: "Günzensen Amphora", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Tekirdağ", kokenSehirTR_en: "Tekirdağ", kokenLatTR: 40.9859, kokenLngTR: 27.5147, iadeSehir: "Washington D.C.", iadeSehir_en: "Washington D.C.", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 38.9072, iadeLng: -77.0369, donem: "Bizans Dönemi", donem_en: "Byzantine Period", iadeYili: "2014", image: "gunseninamphorasi.jpg", description: "1965 yılında Türkiye'de edinilen, Tekirdağ/Günsenin kökenli amfora, ABD'deki bir şahıs tarafından gönüllü olarak iade edilmiştir.", description_en: "An amphora originating from Tekirdağ/Günzensen, acquired in Turkey in 1965, and voluntarily returned by an individual in the USA.", academicDescription: "M.S. 7. yüzyıla tarihlenen, özellikle zeytinyağı ticareti için kullanılan bir Bizans amfora tipidir. Merhum eşinin koleksiyonundaki eseri iade etmek isteyen bir Amerikalı tarafından teslim edilmiştir. <a href='https://kvmgm.ktb.gov.tr/TR-102909/79-abdden-gonullu-iade-alinan-amphoralar-2-adet-2014.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A Byzantine amphora type, dated to the 7th century AD, primarily used for olive oil trade. It was voluntarily returned by an American individual whose late spouse had acquired the item. <a href='https://kvmgm.ktb.gov.tr/TR-102909/79-abdden-gonullu-iade-alinan-amphoralar-2-adet-2014.html' target='_blank'>(More Info)</a>", },
        { id: 8, title: "Gaga Ağızlı Testi", title_en: "Beak-Spouted Jug", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Erken Tunç Çağı", donem_en: "Early Bronze Age", iadeYili: "2021", image: "gagaagizlitesti.jpg", description: "Hattilere ait olduğu tespit edilen ve İngiltere'deki Gilbert Vakfı Koleksiyonu'ndan gönüllü olarak iade edilen seramik eserdir.", description_en: "A ceramic artifact identified as belonging to the Hattians, voluntarily returned from the Gilbert Trust Collection in the UK.", academicDescription: "M.Ö. 3. bine, Erken Tunç Çağı'na ve Hattilere ait karakteristik 'Gaga Ağızlı Testi' formundadır. Metal bileşen analizleri ile Anadolu kökeni bilimsel olarak kesinleştirilmiştir. <a href='https://kvmgm.ktb.gov.tr/TR-296749/120-ingiltereden-gilbert-sanat-vakfi-koleksiyonu-iadesi-saglanan-gaga-agizli-testi-1-adet-2021.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "In the characteristic 'Beak-Spouted Jug' form, belonging to the Hattians and dated to the 3rd millennium BC, Early Bronze Age. Its Anatolian origin was scientifically confirmed through metal component analysis. <a href='https://kvmgm.ktb.gov.tr/TR-296749/120-ingiltereden-gilbert-sanat-vakfi-koleksiyonu-iadesi-saglanan-gaga-agizli-testi-1-adet-2021.html' target='_blank'>(More Info)</a>", },
        { id: 9, title: "Eros Başı", title_en: "Head of Eros", model: null, sergiLat: 41.0082, sergiLng: 28.9784, sergiSehir: "İstanbul", sergiSehir_en: "Istanbul", museum: "İstanbul Arkeoloji Müzesi", museum_en: "Istanbul Archaeological Museum", kokenSehirTR: "Karaman", kokenSehirTR_en: "Karaman", kokenLatTR: 37.1771, kokenLngTR: 33.2207, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2022", image: "erosbasi.jpg", description: "Karaman/Sidamara Antik Kenti'nden çalınan ve ünlü Sidamara Lahdi'nin eksik parçası olan Eros başı, Victoria-Albert Müzesi'nden iade edilmiştir.", description_en: "The Head of Eros, a missing fragment of the famous Sidamara Sarcophagus stolen from the ancient city of Sidamara in Karaman, was returned from the Victoria and Albert Museum.", academicDescription: "M.S. 250'li yıllara tarihlenen, Roma Dönemi Sidamara Lahdi'nin kapağında yer alan heykel başı. İadesi sayesinde lahit orijinal haline kavuşturulmuştur. <a href='https://kvmgm.ktb.gov.tr/TR-323880/129-ingiltereden-victoria--albert-muzesi-iadesi-saglanan-eros-basi-1-adet-2022.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "The statue head from the lid of the Roman Period Sidamara Sarcophagus, dated to the 250s AD. Its return enabled the sarcophagus to be restored to its original form. <a href='https://kvmgm.ktb.gov.tr/TR-323880/129-ingiltereden-victoria--albert-muzesi-iadesi-saglanan-eros-basi-1-adet-2022.html' target='_blank'>(More Info)</a>", },
        { id: 10, title: "Şile Bozgoca Camii Kitabesi", title_en: "Şile Bozgoca Mosque Inscription", model: null, sergiLat: 41.0082, sergiLng: 28.9784, sergiSehir: "İstanbul", sergiSehir_en: "Istanbul", museum: "İstanbul Türk ve İslam Eserleri Müzesi", museum_en: "Istanbul Museum of Turkish and Islamic Arts", kokenSehirTR: "İstanbul", kokenSehirTR_en: "Istanbul", kokenLatTR: 41.1762, kokenLngTR: 29.5701, iadeSehir: "Amsterdam", iadeSehir_en: "Amsterdam", iadeUlke: "Hollanda", iadeUlke_en: "Netherlands", iadeLat: 52.3676, iadeLng: 4.9041, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2022", image: "kitabe.jpg", description: "İstanbul'un Şile ilçesindeki Bozgoca Camii'nden çalınan ve Hollanda'da satılmak istenen 'El-Hacc İbrahimzade Hurşid Beğ' kitabesidir.", description_en: "The 'El-Hacc İbrahimzade Hurşid Beğ' inscription, stolen from the Bozgoca Mosque in Şile, Istanbul, and intended for sale in the Netherlands.", academicDescription: "H. 1324 (M. 1906) tarihli kitabe, cami restorasyonu sırasında çalınmıştır. Adalet Bakanlığı'nın hukuki takibi sonucu Hollanda adli makamlarınca iadesine karar verilmiştir. <a href='https://kvmgm.ktb.gov.tr/TR-330787/131-hollanda39dan-iadesi-saglanan-sile-bozgoca-camii-kitabesi-1-adet-2022.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "The inscription, dated H. 1324 (1906 AD), was stolen during mosque restoration. Its return was decided by Dutch judicial authorities following legal action by the Ministry of Justice. <a href='https://kvmgm.ktb.gov.tr/TR-330787/131-hollanda39dan-iadesi-saglanan-sile-bozgoca-camii-kitabesi-1-adet-2022.html' target='_blank'>(More Info)</a>", },
        { id: 11, title: "Adana Ulu Camii Çinisi", title_en: "Adana Ulu Mosque Tile", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Ankara Vakıf Eserleri Müzesi", museum_en: "Ankara Museum of Foundation Works", kokenSehirTR: "Adana", kokenSehirTR_en: "Adana", kokenLatTR: 37.0000, kokenLngTR: 35.3213, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2022", image: "adanacinisi.jpg", description: "2002'de Adana Ulu Camii'nden çalınan ve Londra'da bir müzayedede tespit edilen İznik çini karosudur. İadesi sağlanan iki parçadan biridir.", description_en: "An Iznik tile fragment stolen from Adana Ulu Mosque in 2002 and traced in a London auction. It is one of two pieces repatriated.", academicDescription: "Yaklaşık M. 1575 tarihli, Osmanlı dönemi İznik seramik karosu olup, lotus palmette ve saz yaprakları gibi klasik motiflerle bezenmiştir. <a href='https://kvmgm.ktb.gov.tr/TR-335250/133-ingiltere39den-iadesi-saglanan-adana-ulu-camii-cinisi-1-adet-2022.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "An Ottoman Iznik ceramic tile fragment, dated approximately to 1575 AD, decorated with classic motifs such as lotus palmette and reed leaves. <a href='https://kvmgm.ktb.gov.tr/TR-335250/133-ingiltere39den-iadesi-saglanan-adana-ulu-camii-cinisi-1-adet-2022.html' target='_blank'>(More Info)</a>", },
        { id: 12, title: "Pişmiş Toprak Kandil", title_en: "Terracotta Lamp", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Miami", iadeSehir_en: "Miami", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 25.7617, iadeLng: -80.1918, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2023", image: "toprakkandil.jpg", description: "ABD'deki Miami Başkonsolosluğu tarafından gönüllü teslim alınan, Roma dönemine ait iki pişmiş toprak kandilden biridir.", description_en: "One of two Roman-era terracotta lamps voluntarily delivered to the Miami Consulate General in the USA.", academicDescription: "M.S. 1-4. yüzyıllara tarihlenen Roma Dönemi kandilidir. Dairesel gövdeli, disk şekilli seramik eser, dönemin aydınlatma teknolojisini yansıtır. <a href='https://kvmgm.ktb.gov.tr/TR-335751/135-abd39den-gonullu-iade-alinan-pismis-toprak-kandiller-2-adet-2023.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A Roman Period lamp dated to the 1st-4th centuries AD. The circular-bodied, disc-shaped ceramic object reflects the lighting technology of the period. <a href='https://kvmgm.ktb.gov.tr/TR-335751/135-abd39den-gonullu-iade-alinan-pismis-toprak-kandiller-2-adet-2023.html' target='_blank'>(More Info)</a>", },
        { id: 13, title: "Bronz Kılıç", title_en: "Bronze Sword", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Doğu Anadolu", kokenSehirTR_en: "Eastern Anatolia", kokenLatTR: 39.8027, kokenLngTR: 40.8529, iadeSehir: "New York", iadeSehir_en: "New York", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Tunç Çağı", donem_en: "Bronze Age", iadeYili: "2023", image: "bronzkilic.jpg", description: "M.Ö. 2000'in sonuna tarihlenen, 60 cm uzunluğunda bronz kılıç, ABD'den iadesi sağlanan önemli eserlerdendir.", description_en: "A bronze sword, 60 cm long and dated to the end of the 2nd millennium BC, among the significant artifacts returned from the USA.", academicDescription: "M.Ö. 2. binin sonlarına tarihlenen, Doğu Anadolu kökenli olduğu tespit edilen bu kılıç, bölgenin Tunç Çağı savaş ve metal işleme teknolojisi hakkında bilgi sunar. <a href='https://kvmgm.ktb.gov.tr/TR-339111/137-abd39den-iadesi-saglanan-bronz-kilic-1-adet-2023.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "This bronze sword, dated to the late 2nd millennium BC and identified as originating from Eastern Anatolia, offers insights into the region's warfare tools and metalworking art. <a href='https://kvmgm.ktb.gov.tr/TR-339111/137-abd39den-iadesi-saglanan-bronz-kilic-1-adet-2023.html' target='_blank'>(More Info)</a>", },
        { id: 14, title: "Zeugma Kökenli Stel", title_en: "Zeugma-Origin Stele", model: null, sergiLat: 37.0706, sergiLng: 37.3802, sergiSehir: "Gaziantep", sergiSehir_en: "Gaziantep", museum: "Zeugma Mozaik Müzesi", museum_en: "Zeugma Mosaic Museum", kokenSehirTR: "Gaziantep", kokenSehirTR_en: "Gaziantep", kokenLatTR: 37.0662, kokenLngTR: 37.3833, iadeSehir: "Roma", iadeSehir_en: "Rome", iadeUlke: "İtalya", iadeUlke_en: "Italy", iadeLat: 41.9028, iadeLng: 12.4964, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2023", image: "stel.jpg", description: "M.S. 2. yüzyıla tarihlenen ve üzerinde 'kocasını seven eş, Satornila, elveda!' yazıtı bulunan Zeugma kökenli mezar steli, İtalya'dan iade edilmiştir.", description_en: "A burial stele from Zeugma, dated to the 2nd century AD, bearing the inscription 'Satornila, wife who loved her husband, farewell!', returned from Italy.", academicDescription: "M.S. 2. yüzyıla tarihlenen, yerel taş işçiliğinin ve Roma dönemi ölü kültünün önemli bir örneği olan stel. Zeugma Antik Kenti'nin sosyal ve dini yapısına ışık tutar. <a href='https://kvmgm.ktb.gov.tr/TR-342746/139-italya39dan-iadesi-saglanan-roma-donemi-zeugma-kokenli-stel-1-adet-2023.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A significant example of local stonework and the Roman period death cult, dated to the 2nd century AD. It sheds light on the social and religious structure of the ancient city of Zeugma. <a href='https://kvmgm.ktb.gov.tr/TR-342746/139-italya39dan-iadesi-saglanan-roma-donemi-zeugma-kokenli-stel-1-adet-2023.html' target='_blank'>(More Info)</a>", },
        { id: 15, title: "Bronz İmparator Heykeli", title_en: "Bronze Emperor Statue", model: null, sergiLat: 36.8841, sergiLng: 30.7056, sergiSehir: "Antalya", sergiSehir_en: "Antalya", museum: "Antalya Müzesi", museum_en: "Antalya Museum", kokenSehirTR: "Antalya", kokenSehirTR_en: "Antalya", kokenLatTR: 36.8841, kokenLngTR: 30.7056, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2024", image: "imparator.jpg", description: "Burdur Boubon Antik Kenti kökenli olduğu düşünülen ve İngiltere'den gönüllü iade alınan, M.S. 2-3. yüzyıla tarihlenen anıtsal bronz imparator heykelidir.", description_en: "A monumental bronze emperor statue dated to the 2nd-3rd centuries AD, believed to originate from the ancient city of Boubon in Burdur, voluntarily returned from the UK.", academicDescription: "M.S. 2. yüzyıl sonu ve 3. yüzyıl başına tarihlenen, gerçek boyutlu bronz heykeldir. Boubon Antik Kenti Sebasteion yapısından kaçırıldığı değerlendirilmektedir. <a href='https://kvmgm.ktb.gov.tr/TR-365607/148-ingiltereden-gonullu-iade-alinan-bronz-imparator-heykeli-1-adet-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A life-size bronze statue dated to the late 2nd and early 3rd centuries AD. It is assessed to have been smuggled from the Sebasteion structure of the Boubon Ancient City. <a href='https://kvmgm.ktb.gov.tr/TR-365607/148-ingiltereden-gonullu-iade-alinan-bronz-imparator-heykeli-1-adet-2024.html' target='_blank'>(More Info)</a>", },
        { id: 16, title: "Mustafa Dede Tarafından İstinsah Edilen Kuran-I Kerim", title_en: "Holy Quran Manuscript Copied by Mustafa Dede", model: null, sergiLat: 41.0082, sergiLng: 28.9784, sergiSehir: "İstanbul", sergiSehir_en: "Istanbul", museum: "İstanbul Türk ve İslam Eserleri Müzesi", museum_en: "Istanbul Museum of Turkish and Islamic Arts", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2024", image: "kuran.jpg", description: "Mustafa Dede tarafından istinsah edilen ve yasa dışı yollarla ülkeden çıkarılan 16. yüzyıl eseri el yazması Kuran-ı Kerim'dir.", description_en: "A 16th-century handwritten Holy Quran manuscript, copied by Mustafa Dede and illegally removed from the country.", academicDescription: "16. yüzyıl Osmanlı dönemine ait, hat sanatı ve tezhip açısından büyük değere sahip, dönemin önemli hattatlarından Mustafa Dede'ye atfedilen el yazmasıdır. <a href='https://kvmgm.ktb.gov.tr/TR-370211/152-ingiltereden-iadesi-saglanan-mustafa-dede-tarafindan-istinsah-edilen-kuran-i-kerim-1-adet-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A handwritten manuscript from the 16th-century Ottoman period, attributed to Mustafa Dede, a prominent calligrapher of the era, and highly valued for its calligraphy and illumination. <a href='https://kvmgm.ktb.gov.tr/TR-370211/152-ingiltereden-iadesi-saglanan-mustafa-dede-tarafindan-istinsah-edilen-kuran-i-kerim-1-adet-2024.html' target='_blank'>(More Info)</a>", },
        { id: 17, title: "Heykel Başı (Büyük İskender)", title_en: "Sculpture Head (Alexander the Great)", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "New York", iadeSehir_en: "New York", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Helenistik Dönem", donem_en: "Hellenistic Period", iadeYili: "2024", image: "heykelbasi.jpg", description: "ABD'de vefat eden bir koleksiyoncunun varislerince Anadolu kökenli olduğu düşünülerek gönüllü iade edilen Büyük İskender'e ait mermer heykel başıdır.", description_en: "A marble sculpture head of Alexander the Great, voluntarily returned by the heirs of a deceased collector in the USA who believed it to be of Anatolian origin.", academicDescription: "M.Ö. 4. yüzyıl sonlarına tarihlenen, Helenistik Dönem'in geçiş stilini yansıtan mermer portre başı. Büyük İskender'in karakteristik 'anastole' saç stiline sahiptir. <a href='https://kvmgm.ktb.gov.tr/TR-374749/153-abdden-gonullu-iade-alinan-heykel-basi-1-adet-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A marble portrait head dated to the late 4th century BC, reflecting the transitional style of the Hellenistic Period. It features Alexander the Great's characteristic 'anastole' hairstyle. <a href='https://kvmgm.ktb.gov.tr/TR-374749/153-abdden-gonullu-iade-alinan-heykel-basi-1-adet-2024.html' target='_blank'>(More Info)</a>", },
        { id: 18, title: "Bintepeler Nekropol Alanı Kökenli Kolye", title_en: "Necklace from Bintepeler Necropolis", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Manisa", kokenSehirTR_en: "Manisa", kokenLatTR: 38.6189, kokenLngTR: 27.4093, iadeSehir: "Boston", iadeSehir_en: "Boston", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Arkaik Dönem (Lidya)", donem_en: "Archaic Period (Lydian)", iadeYili: "2024", image: "altinkolye.jpg", description: "Manisa Bintepeler Nekropol Alanı kökenli, yaklaşık 2700 yıl öncesine tarihlenen altın ve akik boncuklardan oluşan Lidya kolyesidir. Boston Güzel Sanatlar Müzesi'nden iade edilmiştir.", description_en: "A Lydian necklace from the Bintepeler Necropolis Area in Manisa, dating back approximately 2700 years, made of gold and carnelian beads. Returned from the Museum of Fine Arts, Boston.", academicDescription: "M.Ö. 6. veya 5. yüzyıla (Arkaik Dönem) tarihlenen kolye, Lidya sanatının incelikli altın işçiliğini gösterir. Nar motifli boncuklar, dönemin dini ve estetik anlayışını yansıtır. <a href='http://www.kulturvarliklari.gov.tr/TR-378872/156-abdden-iadesi-saglanan-bintepeler-nekropol-alani-kokenli-kolye1-adet-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "Dated to the 6th or 5th century BC (Archaic Period), the necklace showcases the intricate gold craftsmanship of Lydian art. Pomegranate-motif beads reflect the religious and aesthetic understanding of the era. <a href='http://www.kulturvarliklari.gov.tr/TR-378872/156-abdden-iadesi-saglanan-bintepeler-nekropol-alani-kokenli-kolye1-adet-2024.html' target='_blank'>(More Info)</a>", },
        { id: 19, title: "Bronz Septimius Severus Başı", title_en: "Bronze Head of Septimius Severus", model: null, sergiLat: 36.8841, sergiLng: 30.7056, sergiSehir: "Antalya", sergiSehir_en: "Antalya", museum: "Antalya Arkeoloji Müzesi", museum_en: "Antalya Archeology Museum", kokenSehirTR: "Burdur", kokenSehirTR_en: "Burdur", kokenLatTR: 37.5833, kokenLngTR: 30.2972, iadeSehir: "Kopenhag", iadeSehir_en: "Copenhagen", iadeUlke: "Danimarka", iadeUlke_en: "Denmark", iadeLat: 55.6761, iadeLng: 12.5683, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2024", image: "severusbasi.jpg", description: "Burdur Boubon Antik Kenti kökenli, Roma İmparatoru Septimius Severus'un bronz portresi. Danimarka Glyptotek Müzesi tarafından gönüllü olarak iade edilmiştir.", description_en: "A bronze portrait of Roman Emperor Septimius Severus, originating from Boubon Ancient City, Burdur. Voluntarily returned by the Glyptotek Museum in Denmark.", academicDescription: "M.S. 145-211 yılları arasına tarihlenen, Roma İmparatorluk Dönemi'ne ait yüksek kaliteli bronz portre. İadesi, 48 adet pişmiş toprak mimari levhayla birlikte sağlanmıştır. <a href='https://kvmgm.ktb.gov.tr/TR-393351/159-danimarkadan-iadesi-saglanan-burdur-ili-boubon-antik-kenti-kokenli-bronz-septimius-severus-basi-ve-duver-koyu-kokenli-pismis-toprak-mimari-levhalar-49-adet-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A high-quality bronze portrait from the Roman Imperial Period, dated between 145-211 AD. Its return, along with 48 terracotta architectural plaques, was secured from Denmark. <a href='https://kvmgm.ktb.gov.tr/TR-393351/159-danimarkadan-iadesi-saglanan-burdur-ili-boubon-antik-kenti-kokenli-bronz-septimius-severus-basi-ve-duver-koyu-kokenli-pismis-toprak-mimari-levhalar-49-adet-2024.html' target='_blank'>(More Info)</a>", },
        { id: 20, title: "Bronz Marcus Aurelius Heykeli", title_en: "Bronze Statue of Marcus Aurelius", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Anadolu Medeniyetleri Müzesi", museum_en: "Museum of Anatolian Civilizations", kokenSehirTR: "Burdur", kokenSehirTR_en: "Burdur", kokenLatTR: 37.7667, kokenLngTR: 30.2833, iadeSehir: "Cleveland", iadeSehir_en: "Cleveland", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2025", image: "marcusheykeli.jpg", description: "Burdur Boubon Antik Kenti'nden 65 yıl önce kaçırılan ve 'Filozof İmparator' olarak bilinen Roma İmparatoru Marcus Aurelius'un bronz heykelidir. ABD'den iade edilmiştir.", description_en: "The bronze statue of Roman Emperor Marcus Aurelius, known as the 'Philosopher Emperor', stolen 65 years ago from Boubon Ancient City, Burdur, and returned from the USA.", academicDescription: "M.S. 2. yüzyıla tarihlenen, Roma İmparatorluk Dönemi'nin en önemli bronz heykellerinden biri. Eserin kökeni, içindeki toprak kalıntıları ile Burdur Boubon Antik Kenti'ne bağlanmıştır. <a href='https://kvmgm.ktb.gov.tr/TR-403529/165-amerika-birlesik-devletlerinden-iadesi-saglanan-bronz-marcus-aurelius-heykeli-1-adet-2025.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "One of the most significant bronze statues of the Roman Imperial Period, dated to the 2nd century AD. The artifact's origin was linked to the Boubon Ancient City, Burdur, through soil remnants found inside. <a href='https://kvmgm.ktb.gov.tr/TR-403529/165-amerika-birlesik-devletlerinden-iadesi-saglanan-bronz-marcus-aurelius-heykeli-1-adet-2025.html' target='_blank'>(More Info)</a>", },
        { id: 21, title: "Bronz Kline", title_en: "Bronze Kline", model: null, sergiLat: 39.0000, sergiLng: 35.0000, sergiSehir: "Anadolu", sergiSehir_en: "Anatolia", museum: "-", museum_en: "-", kokenSehirTR: "Manisa", kokenSehirTR_en: "Manisa", kokenLatTR: 38.6189, kokenLngTR: 27.4093, iadeSehir: "Los Angeles", iadeSehir_en: "Los Angeles", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Lidya Dönemi", donem_en: "Lydian Period", iadeYili: "2024", image: "bronzkline.jpg", description: "Manisa'da 1979'da bulunan ve yasa dışı yollarla ABD'ye kaçırılan, M.Ö. 530 yılına tarihlenen bronz kline (sedir/ziyafet kanepesi).", description_en: "A bronze kline (couch/banquet sofa) dating to 530 BC, found in Manisa in 1979 and illegally smuggled to the USA.", academicDescription: "M.Ö. 6. yüzyıla ait, dökme bronz ayaklı ve bakır levha yüzeyli nadir bir Lidya mobilyasıdır. Mezar odasında hem sedir hem de cenaze yatağı olarak kullanıldığı düşünülmektedir. <a href='https://kvmgm.ktb.gov.tr/TR-378849/154-abdden-iadesi-saglanan-bronz-kline-2024.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A rare Lydian furniture piece from the 6th century BC with cast bronze legs and copper sheet surface. It is thought to have been used as both a couch and a funeral bed in the burial chamber. <a href='https://kvmgm.ktb.gov.tr/TR-378849/154-abdden-iadesi-saglanan-bronz-kline-2024.html' target='_blank'>(More Info)</a>", },
        { id: 22, title: "İznik Çini", title_en: "Iznik Tile", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Ankara Etnografya Müzesi", museum_en: "Ankara Ethnography Museum", kokenSehirTR: "Adana", kokenSehirTR_en: "Adana", kokenLatTR: 37.0000, kokenLngTR: 35.3333, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2025", image: "iznikcini.jpg", description: "2003 yılında Adana Ulu Camii'nden çalınan ve 2024'te İngiltere'de bir müzayedede tespit edilerek iadesi sağlanan 16. yüzyıl İznik çini karosu.", description_en: "A 16th-century Iznik tile stolen from Adana Ulu Mosque in 2003, identified in an auction in the UK in 2024, and returned.", academicDescription: "16. yüzyıla tarihlenen, altı köşeli ve bitkisel motifli İznik çinisi. Adana Ulu Camii'nin bezeme programının önemli bir parçasıdır. <a href='https://kvmgm.ktb.gov.tr/TR-392755/162-ingiltereden-iadesi-saglanan-iznik-cini-1-adet-2025.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "Hexagonal Iznik tile with floral motifs, dated to the 16th century. It is an important part of the decoration program of Adana Ulu Mosque. <a href='https://kvmgm.ktb.gov.tr/TR-392755/162-ingiltereden-iadesi-saglanan-iznik-cini-1-adet-2025.html' target='_blank'>(More Info)</a>", },
        { id: 23, title: "Seccade", title_en: "Prayer Rug", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Ankara Etnografya Müzesi", museum_en: "Ankara Ethnography Museum", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Alabama", iadeSehir_en: "Alabama", iadeUlke: "ABD", iadeUlke_en: "USA", iadeLat: 40.7128, iadeLng: -74.0060, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2022", image: "seccade.jpg", description: "ABD'nin Alabama eyaletindeki bir müze tarafından Türkiye kökenli olduğu belirlenerek gönüllü iade edilen 19. yüzyıl Osmanlı seccadesi.", description_en: "A 19th-century Ottoman prayer rug voluntarily returned by a museum in Alabama, USA, after determining it was of Turkish origin.", academicDescription: "19. yüzyıla tarihlenen, suzeni tekniğiyle işlenmiş, ipek ve keten kumaş katmanlarından oluşan dikdörtgen formlu seccade örtüsü. <a href='https://kvmgm.ktb.gov.tr/TR-309242/124-abd39nin-gonullu-iade-alinan-seccade-ortusu-1-adet-2022.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "Rectangular prayer rug cover dated to the 19th century, embroidered with suzeni technique, consisting of silk and linen fabric layers. <a href='https://kvmgm.ktb.gov.tr/TR-309242/124-abd39nin-gonullu-iade-alinan-seccade-ortusu-1-adet-2022.html' target='_blank'>(More Info)</a>", },
        { id: 24, title: "Gladyatör Figürini", title_en: "Gladiator Figurine", model: null, sergiLat: 37.9488, sergiLng: 27.3678, sergiSehir: "İzmir", sergiSehir_en: "Izmir", museum: "Selçuk Efes Müzesi", museum_en: "Selçuk Efes Museum", kokenSehirTR: "İzmir", kokenSehirTR_en: "Izmir", kokenLatTR: 37.9488, kokenLngTR: 27.3678, iadeSehir: "Viyana", iadeSehir_en: "Vienna", iadeUlke: "Avusturya", iadeUlke_en: "Austria", iadeLat: 48.2082, iadeLng: 16.3738, donem: "Roma Dönemi", donem_en: "Roman Period", iadeYili: "2018", image: "gladyator.jpg", description: "Efes Antik Kenti kökenli olduğu belirlenen ve Avusturya'dan gönüllü olarak iade edilen pişmiş toprak gladyatör figürini.", description_en: "Terracotta gladiator figurine identified as originating from the Ancient City of Ephesus and voluntarily returned from Austria.", academicDescription: "Roma Dönemi'ne ait pişmiş toprak gladyatör figürini. Efes'teki gladyatör oyunları ve popüler kültür hakkında bilgi veren önemli bir küçük buluntudur. <a href='https://kvmgm.ktb.gov.tr/TR-269746/104-avusturyadan-gonullu-iade-alinan-efes-kokenli-gladyator-figurini-1-adet2018.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "Terracotta gladiator figurine from the Roman Period. It is an important small find providing information about gladiator games and popular culture in Ephesus. <a href='https://kvmgm.ktb.gov.tr/TR-269746/104-avusturyadan-gonullu-iade-alinan-efes-kokenli-gladyator-figurini-1-adet2018.html' target='_blank'>(More Info)</a>", },
        { id: 25, title: "İpek Sarık", title_en: "Silk Turban", model: null, sergiLat: 39.9255, sergiLng: 32.8663, sergiSehir: "Ankara", sergiSehir_en: "Ankara", museum: "Ankara Etnografya Müzesi", museum_en: "Ankara Ethnography Museum", kokenSehirTR: "Anadolu", kokenSehirTR_en: "Anatolia", kokenLatTR: 39.0000, kokenLngTR: 35.0000, iadeSehir: "Londra", iadeSehir_en: "London", iadeUlke: "İngiltere", iadeUlke_en: "UK", iadeLat: 51.5074, iadeLng: -0.1278, donem: "Osmanlı Dönemi", donem_en: "Ottoman Period", iadeYili: "2017", image: "sarik.jpg", description: "Londra'da bir müzayedede satışa çıkarılan ve Bakanlık girişimleriyle iadesi sağlanan Osmanlı Dönemi'ne ait ipek sarık.", description_en: "An Ottoman Period silk turban put up for auction in London and returned through Ministry initiatives.", academicDescription: "Osmanlı Dönemi tekstil sanatının nadide örneklerinden biri olan ipek sarık. Korunmuşluk durumu ve dokuma tekniğiyle dönemin giyim kültürünü yansıtır. <a href='https://kvmgm.ktb.gov.tr/TR-269743/99-ingiltereden-iadesi-saglanan-osmanli-donemi39ne-ait-ipek-sarik-1-adet-2017.html' target='_blank'>(Detaylı Bilgi)</a>", academicDescription_en: "A rare example of Ottoman Period textile art, this silk turban reflects the clothing culture of the era with its preservation status and weaving technique. <a href='https://kvmgm.ktb.gov.tr/TR-269743/99-ingiltereden-iadesi-saglanan-osmanli-donemi39ne-ait-ipek-sarik-1-adet-2017.html' target='_blank'>(More Info)</a>", }
    ];

    // Marker konumunu veren yardımcı fonksiyon (offset olmadan)
    function getEserLocation(data) {
        let lat, lng;
        
        if (currentView === 'returned') {
            lat = data.iadeLat;
            lng = data.iadeLng;
        } else {
            // Köken koordinatlarını kullan (Özel bölgeler için atama yapılır)
            if (data.kokenSehirTR === 'Anadolu') {
                data.kokenLatTR = 39.0000; data.kokenLngTR = 35.0000;
            } else if (data.kokenSehirTR === 'Doğu Anadolu') {
                data.kokenLatTR = 39.8027; data.kokenLngTR = 40.8529;
            }
            lat = data.kokenLatTR;
            lng = data.kokenLngTR;
        }
        return [lat, lng];
    }

    function initMap() { 
        if (map) { map.remove(); } 
        map = L.map('map', { zoomControl: false, maxZoom: 18 }).setView([39, 35], 5); 
        L.control.zoom({ position: 'topright' }).addTo(map); 
        markersLayer = L.markerClusterGroup(); // Cluster özelliği geri getirildi
        map.addLayer(markersLayer); 
        updateMapTiles(); 
        createMarkers(); 
        applyLanguage(currentLang); 
        updateSwitchLabels(); 
        setupEventListeners(); 
        
        if (welcomeOverlay.style.display !== 'none' && !localStorage.getItem('hasVisited')) {
            setTimeout(() => {
                startIntroTour();
                localStorage.setItem('hasVisited', 'true');
            }, 50);
        }
    }
    
    function updateMapTiles() { if (tileLayer) { tileLayer.remove(); } let tileUrl, attribution; if (currentViewType === 'satellite') { tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; attribution = 'Tiles &copy; Esri'; } else { tileUrl = currentTheme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'; } tileLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 20 }).addTo(map); }
    
    function createMarkers() { 
        allMarkers = []; 
        eserler.forEach(eser => { 
            const marker = L.marker(getEserLocation(eser), { icon: GreenIcon, data: eser }); // Markera veriyi ata
            allMarkers.push({ marker, data: eser }); 
        }); 
        resetMarkersToDefault(); 
    }

    function resetMarkersToDefault() {
        markersLayer.clearLayers();
        
        allMarkers.forEach(m => {
            if (map.hasLayer(m.marker)) {
                m.marker.remove();
            }
            m.marker.off('click');
            m.marker.unbindPopup();
            
            const [lat, lng] = getEserLocation(m.data);
            m.marker.setLatLng([lat, lng]);

            const eser = m.data;
            const t = translations[currentLang];
            const displayTitle = currentLang === 'en' ? eser.title_en : eser.title;
            const displayMuseum = currentLang === 'en' ? eser.museum_en : eser.museum;
            const displayOriginCity = currentLang === 'en' ? eser.kokenSehirTR_en : eser.kokenSehirTR;
            const displayReturnedCountry = currentLang === 'en' ? eser.iadeUlke_en : eser.iadeUlke;
            const displayPeriod = currentLang === 'en' ? eser.donem_en : eser.donem;
            const displayAcademicDescription = currentLang === 'en' ? eser.academicDescription_en : eser.academicDescription;
            
            const popupContent = `<div class="popup-image-container"><img src="${eser.image}" alt="${displayTitle}" class="popup-image">${eser.model ? `<div class="popup-3d-icon" data-model-src="${eser.model}"><i class="fas fa-cube"></i></div>` : ''}</div><h3>${displayTitle}</h3><p><strong>${t.originPlace}</strong> ${displayOriginCity}</p><p><strong>${t.exhibitionPlace}</strong> ${eser.sergiSehir} (${displayMuseum})</p><p><strong>${t.returnedFrom}</strong> ${eser.iadeSehir}, ${displayReturnedCountry}</p><p><strong>${t.period}</strong> ${displayPeriod}</p><p><strong>${t.returnDate}</strong> ${eser.iadeYili}</p><p><strong>${t.academicInfo}</strong> ${displayAcademicDescription}</p>`;
            
            m.marker.bindPopup(popupContent);
            markersLayer.addLayer(m.marker); 
        });

        if (!map.hasLayer(markersLayer)) {
            map.addLayer(markersLayer);
        }

        updateDebugCounter();
    }
    
    function handleMapViewChange(e) { currentView = e.target.checked ? 'returned' : 'origin'; resetMarkersToDefault(); updateSwitchLabels(); }
    
    function setupEventListeners() {
        document.getElementById('help-icon').addEventListener('click', startTutorial);
        document.getElementById('map-view-switch').addEventListener('change', handleMapViewChange);
        document.getElementById('quiz-toggle-btn').addEventListener('click', () => { quizPanel.classList.toggle('hidden'); if (quizPanel.classList.contains('hidden') && gameState.isActive) { endQuiz(); } else { quizGameScreen.classList.add('hidden'); quizEndScreen.classList.add('hidden'); quizStartScreen.classList.remove('hidden'); } });
        startQuizBtn.addEventListener('click', startQuiz);
        endQuizBtn.addEventListener('click', endQuiz);
        playAgainBtn.addEventListener('click', startQuiz);
        closeModelViewerBtn.addEventListener('click', closeModelViewer);
        document.getElementById('settings-icon').addEventListener('click', (e) => { settingsDropdown.classList.toggle('hidden'); e.stopPropagation(); });
        document.getElementById('filter-icon').addEventListener('click', (e) => { filterModal.classList.toggle('hidden'); e.stopPropagation(); });
        document.getElementById('apply-filter-btn').addEventListener('click', applyFilters);
        document.getElementById('reset-filter-btn').addEventListener('click', resetFilters);
        document.getElementById('view-type-switch').addEventListener('change', handleViewTypeChange);
        document.getElementById('theme-switch').addEventListener('change', handleThemeChange);
        document.getElementById('lang-switch').addEventListener('change', handleLangChange);
        searchInput.addEventListener('input', handleSearch);
        searchResultsContainer.addEventListener('click', handleSearchResultClick);
        introTourOverlay.addEventListener('click', handleIntroTourClick);
        tutorialOverlay.addEventListener('click', handleTutorialClick);
        
        map.on('popupopen', (e) => { 
            const popupNode = e.popup.getElement(); 
            const icon3d = popupNode.querySelector('.popup-3d-icon'); 
            if (icon3d) { 
                icon3d.addEventListener('click', () => { 
                    openModelViewer(icon3d.dataset.modelSrc); 
                }); 
            } 
        });

        if (closeWelcomeButton && welcomeOverlay) {
            closeWelcomeButton.addEventListener('click', () => {
                welcomeOverlay.style.display = 'none';
                if (map) { map.invalidateSize(); } 
            });
        }

        if (openHelpButton) {
            openHelpButton.addEventListener('click', () => {
                if (welcomeOverlay) {
                    welcomeOverlay.style.display = 'none';
                }
                startTutorial();
            });
        }

        if (startGameButton) {
            startGameButton.addEventListener('click', () => {
                if (welcomeOverlay) {
                    welcomeOverlay.style.display = 'none';
                }
                quizPanel.classList.remove('hidden'); 
                quizGameScreen.classList.add('hidden'); 
                quizEndScreen.classList.add('hidden'); 
                quizStartScreen.classList.remove('hidden');
                if (map) { map.invalidateSize(); } 
            });
        }

        // Quiz için marker tıklama olayını MarkerCluster'a ata (bu en güvenli yöntemdir)
        markersLayer.on('click', (e) => {
            if (gameState.isActive) {
                // Tıklanan marker'ın verisini doğrudan al (bu tekil marker olmalı)
                if (e.layer && e.layer.options && e.layer.options.data) {
                    handleMarkerGuess({ latlng: e.latlng, targetEserData: e.layer.options.data });
                }
            }
        });

        // Cluster'a tıklandığında quiz için olayı elle tetikle
        markersLayer.on('clusterclick', (a) => {
            if (gameState.isActive) {
                // Cluster'ın merkez koordinatını kullan
                handleMarkerGuess({ latlng: a.latlng, targetEserData: a.layer.getAllChildMarkers()[0].options.data });
            }
        });

        // Harita boş alan tıklaması
        map.on('click', handleMapGuess); 
    }
    
    function updateSwitchLabels() {
        const update = (switchId, condition, labels) => {
            const switchEl = document.getElementById(switchId);
            if (switchEl && labels && labels.length === 2) {
                switchEl.checked = condition;
                labels[0].classList.toggle('active', !condition);
                labels[1].classList.toggle('active', condition);
            }
        };
        update('map-view-switch', currentView === 'returned', document.querySelectorAll('.setting-group:nth-child(1) .switch-label'));
        update('view-type-switch', currentViewType === 'satellite', document.querySelectorAll('.setting-group:nth-child(2) .switch-label'));
        update('theme-switch', currentTheme === 'dark', document.querySelectorAll('.setting-group:nth-child(3) .switch-label'));
        update('lang-switch', currentLang === 'en', document.querySelectorAll('.setting-group:nth-child(4) .switch-label'));
    }

    function startQuiz() {
        gameState.isActive = true; 
        gameState.score = 0; 
        gameState.currentQuestionIndex = 0;
        
        // QUIZ RASTGELE SEÇİM
        gameState.questions = [...eserler].sort(() => 0.5 - Math.random()).slice(0, gameState.totalQuestions);
        
        quizStartScreen.classList.add('hidden'); quizEndScreen.classList.add('hidden'); quizGameScreen.classList.remove('hidden');
        document.body.classList.add('quiz-active'); quizPanel.classList.remove('hidden');
        
        // Quiz sırasında Cluster aktif kalır, bu sayede çakışan marker'lar tek bir daire olur.
        resetMarkersToDefault();
        
        nextQuestion();
    }

    function endQuiz() {
        gameState.isActive = false;
        quizGameScreen.classList.add('hidden'); quizEndScreen.classList.remove('hidden');
        document.getElementById('quiz-final-score').textContent = gameState.score;
        document.body.classList.remove('quiz-active');
        quizHintTextEl.classList.add('hidden');
        
        // Normal görünüm ve olayları geri yükle
        resetMarkersToDefault(); 
    }
    
    function nextQuestion() {
        if (gameState.currentQuestionIndex >= gameState.totalQuestions) { endQuiz(); return; }
        map.closePopup();
        
        const questionData = gameState.questions[gameState.currentQuestionIndex];
        gameState.targetEserId = questionData.id;

        // Hedef konumu ayarla (ofsetsiz orijinal konum)
        const [targetLat, targetLng] = getEserLocation(questionData);
        gameState.targetLocation = { lat: targetLat, lng: targetLng };
        
        const t = translations[currentLang];
        const eserAdi = currentLang === 'en' ? questionData.title_en : questionData.title;
        let questionText;
        
        if (currentView === 'returned') {
            questionText = t.quizQuestionTemplateReturned.replace('{eserAdi}', eserAdi);
        } else {
            questionText = t.quizQuestionTemplateOrigin.replace('{eserAdi}', eserAdi);
        }
        
        quizQuestionTextEl.textContent = questionText;
        const hintDescriptionTR = questionData.description;
        const hintDescriptionEN = questionData.description_en;
        
        quizHintTextEl.textContent = t.quizHintLabel + (currentLang === 'en' ? hintDescriptionEN : hintDescriptionTR);
        quizHintTextEl.classList.remove('hidden');
        quizScoreEl.textContent = gameState.score;
        quizQuestionCounterEl.textContent = `${gameState.currentQuestionIndex + 1} / ${gameState.totalQuestions}`;
        
        // Haritayı Türkiye genel sınırlarına odakla
        map.flyToBounds([[36, 26], [42, 45]]);
    }
    
    // YENİ MERKEZİ TIKLAMA İŞLEYİCİSİ (Hem Cluster hem tekil marker için)
    function handleMarkerGuess(e) {
        if (!gameState.isActive) return; 
        
        // Tıklanan koordinatı al
        const clickedLatLng = e.latlng;

        // Tıklanan konumdaki eserlerin koordinatları, hedef eserin koordinatları ile eşleşiyor mu kontrol et.
        // Cluster'a tıklandığında bile, Leaflet latlng bilgisini doğru verir.
        const targetLat = gameState.targetLocation.lat;
        const targetLng = gameState.targetLocation.lng;
        
        // Aynı koordinat kümesi içinde olup olmadığını kontrol et (küçük bir toleransla)
        // Bu tolerans, çakışan marker'lar için bile doğru kabul etmeyi sağlar.
        const isCorrectLocation = (Math.abs(clickedLatLng.lat - targetLat) < 0.0001) && 
                                  (Math.abs(clickedLatLng.lng - targetLng) < 0.0001);


        if (isCorrectLocation) {
            gameState.score += 20; 
            quizScoreEl.textContent = gameState.score; 
            const t = translations[currentLang]; 
            
            L.popup()
                .setLatLng(clickedLatLng)
                .setContent(`<h3>🎉 Tebrikler, doğru tahmin! 🎉</h3>`)
                .openOn(map); 
                
            gameState.currentQuestionIndex++; 
            setTimeout(nextQuestion, 2000); 
        } else {
            gameState.score -= 5;
            quizScoreEl.textContent = gameState.score;
            const t = translations[currentLang];
            
            L.popup()
                .setLatLng(clickedLatLng)
                .setContent(`<h3>${t.wrongGuess}</h3>`)
                .openOn(map);
        }
    }

    function handleMapGuess(e) { 
        if (!gameState.isActive) return; 
        // MarkerCluster/Marker dışındaki boş alana tıklandığında uzaklık ipucu ver
        
        gameState.score -= 5; 
        quizScoreEl.textContent = gameState.score; 
        
        const distance = calculateDistance(e.latlng, gameState.targetLocation); 
        const bearing = calculateBearing(e.latlng, gameState.targetLocation); 
        const direction = bearingToDirection(bearing, currentLang); 
        const t = translations[currentLang]; 
        
        const hint = t.hintTemplate
            .replace('{distance}', Math.round(distance))
            .replace('{direction}', direction); 
            
        L.popup()
            .setLatLng(e.latlng)
            .setContent(hint)
            .openOn(map); 
    }
    
    function calculateDistance(from, to) { const R = 6371; const dLat = (to.lat - from.lat) * Math.PI / 180; const dLon = (to.lng - from.lng) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }
    function calculateBearing(from, to) { const lat1 = from.lat * Math.PI / 180; const lon1 = from.lng * Math.PI / 180; const lat2 = to.lat * Math.PI / 180; const lon2 = to.lng * Math.PI / 180; const y = Math.sin(lon2 - lon1) * Math.cos(lat2); const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1); const brng = Math.atan2(y, x) * 180 / Math.PI; return (brng + 360) % 360; }
    function bearingToDirection(bearing, lang) { const t = translations[lang]; const index = Math.round(bearing / 45) % 8; return t.directions[index]; }
    function openModelViewer(modelSrc) { modelViewerModal.classList.remove('hidden'); setTimeout(() => { artifactModelViewer.src = modelSrc; }, 50); }
    function closeModelViewer() { modelViewerModal.classList.add('hidden'); artifactModelViewer.pause(); artifactModelViewer.src = ''; }
    function handleViewTypeChange(e) { currentViewType = e.target.checked ? 'satellite' : 'map'; updateMapTiles(); updateSwitchLabels(); }
    function handleThemeChange(e) { currentTheme = e.target.checked ? 'dark' : 'light'; document.body.classList.toggle('dark-mode', currentTheme === 'dark'); updateMapTiles(); updateSwitchLabels(); }
    function handleLangChange(e) { currentLang = e.target.checked ? 'en' : 'tr'; updateSwitchLabels(); applyLanguage(currentLang); }
    function applyLanguage(lang) { currentLang = lang; document.querySelectorAll('[data-lang-key]').forEach(el => { const key = el.getAttribute('data-lang-key'); if(translations[lang][key]) el.textContent = translations[lang][key]; }); populateFilters(); resetMarkersToDefault(); }
    function handleSearch(event) { const searchTerm = event.target.value.toLowerCase().trim(); searchResultsContainer.innerHTML = ''; if (searchTerm.length < 2) { searchResultsContainer.classList.add('hidden'); return; } const matches = eserler.map(eser => { let score = 0; if ((eser.title.toLowerCase().includes(searchTerm)) || (eser.title_en.toLowerCase().includes(searchTerm))) score += 10; if ((eser.museum.toLowerCase().includes(searchTerm)) || (eser.museum_en.toLowerCase().includes(searchTerm))) score += 5; if ((eser.sergiSehir.toLowerCase().includes(searchTerm)) || (eser.sergiSehir_en.toLowerCase().includes(searchTerm))) score += 2; return { eser, score }; }).filter(item => item.score > 0).sort((a, b) => b.score - a.score); if (matches.length > 0) { matches.forEach(item => { const displayTitle = currentLang === 'en' ? item.eser.title_en : item.eser.title; const displayMuseum = currentLang === 'en' ? item.eser.museum_en : item.eser.museum; const resultDiv = document.createElement('div'); resultDiv.className = 'search-result-item'; resultDiv.dataset.eserId = item.eser.id; resultDiv.innerHTML = `<h4>${displayTitle}</h4><p>${displayMuseum}</p>`; searchResultsContainer.appendChild(resultDiv); }); searchResultsContainer.classList.remove('hidden'); } else { searchResultsContainer.classList.add('hidden'); } }
    function handleSearchResultClick(event) { const resultItem = event.target.closest('.search-result-item'); if (!resultItem) return; const eserId = parseInt(resultItem.dataset.eserId); const found = allMarkers.find(item => item.data.id === eserId); if (found) { const displayTitle = currentLang === 'en' ? found.data.title_en : found.data.title; if (gameState.isActive) { map.flyTo(found.marker.getLatLng(), 15); found.marker.openPopup(); } else { markersLayer.zoomToShowLayer(found.marker, () => { found.marker.openPopup(); }); } searchInput.value = displayTitle; searchResultsContainer.classList.add('hidden'); } }
    function populateFilters() { const lang = currentLang; const uniqueCountries = [...new Set(eserler.map(e => lang === 'en' ? e.iadeUlke_en : e.iadeUlke))].sort(); document.getElementById('country-filter-container').innerHTML = uniqueCountries.map(c => `<div><input type="checkbox" id="country-${c.replace(/\s+/g, '-')}" value="${c}"><label for="country-${c.replace(/\s+/g, '-')}">${c}</label></div>`).join(''); const uniqueOriginCities = [...new Set(eserler.map(e => lang === 'en' ? e.kokenSehirTR_en : e.kokenSehirTR))].sort(); document.getElementById('origin-city-filter-container').innerHTML = uniqueOriginCities.map(c => `<div><input type="checkbox" id="origin-city-${c.replace(/\s+/g, '-')}" value="${c}"><label for="origin-city-${c.replace(/\s+/g, '-')}">${c}</label></div>`).join(''); const uniqueExhibitionCities = [...new Set(eserler.map(e => lang === 'en' ? e.sergiSehir_en : e.sergiSehir))].sort(); document.getElementById('exhibition-city-filter-container').innerHTML = uniqueExhibitionCities.map(c => `<div><input type="checkbox" id="exhibition-city-${c.replace(/\s+/g, '-')}" value="${c}"><label for="exhibition-city-${c.replace(/\s+/g, '-')}">${c}</label></div>`).join(''); const uniquePeriods = [...new Set(eserler.map(e => lang === 'en' ? e.donem_en : e.donem))].sort(); document.getElementById('period-filter-container').innerHTML = uniquePeriods.map(p => `<div><input type="checkbox" id="period-${p.replace(/\s+/g, '-')}" value="${p}"><label for="period-${p.replace(/\s+/g, '-')}">${p}</label></div>`).join(''); }
    function applyFilters() { const lang = currentLang; const selectedCountries = Array.from(document.querySelectorAll('#country-filter-container input:checked')).map(cb => cb.value); const selectedOriginCities = Array.from(document.querySelectorAll('#origin-city-filter-container input:checked')).map(cb => cb.value); const selectedExhibitionCities = Array.from(document.querySelectorAll('#exhibition-city-filter-container input:checked')).map(cb => cb.value); const selectedPeriods = Array.from(document.querySelectorAll('#period-filter-container input:checked')).map(cb => cb.value); markersLayer.clearLayers(); const filteredMarkers = allMarkers.filter(item => { const data = item.data; const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(lang === 'en' ? data.iadeUlke_en : data.iadeUlke); const originCityMatch = selectedOriginCities.length === 0 || selectedOriginCities.includes(lang === 'en' ? data.kokenSehirTR_en : data.kokenSehirTR); const exhibitionCityMatch = selectedExhibitionCities.length === 0 || selectedExhibitionCities.includes(lang === 'en' ? data.sergiSehir_en : data.sergiSehir); const periodMatch = selectedPeriods.length === 0 || selectedPeriods.includes(lang === 'en' ? data.donem_en : data.donem); return countryMatch && originCityMatch && exhibitionCityMatch && periodMatch; }); filteredMarkers.forEach(item => markersLayer.addLayer(item.marker)); if (filteredMarkers.length > 0 && markersLayer.getBounds().isValid()) { map.flyToBounds(markersLayer.getBounds().pad(0.2)); } filterModal.classList.add('hidden'); updateDebugCounter(); }
    function resetFilters() { document.querySelectorAll('#filter-modal input[type="checkbox"]').forEach(cb => cb.checked = false); resetMarkersToDefault(); if (markersLayer.getBounds().isValid()){ map.flyToBounds(markersLayer.getBounds().pad(0.2)); } filterModal.classList.add('hidden'); }
    
    let currentIntroStep = 0;
    function startIntroTour() { currentIntroStep = 1; introTourOverlay.classList.remove('hidden'); showIntroStep(currentIntroStep); }
    function showIntroStep(step) { tutorialOverlay.querySelectorAll('.tutorial-step').forEach(s => s.style.display = 'none'); const el = introTourOverlay.querySelector(`.tutorial-step[data-step="${step}"]`); if (el) el.style.display = 'block'; }
    function handleIntroTourClick(event) { if (event.target.classList.contains('tutorial-next')) { currentIntroStep++; showIntroStep(currentIntroStep); } else if (event.target.classList.contains('tutorial-end') || event.target.id === 'intro-skip-btn') { introTourOverlay.classList.add('hidden'); } }
    
    let currentTutorialStep = 0;
    function startTutorial() { currentTutorialStep = 1; tutorialOverlay.classList.remove('hidden'); showTutorialStep(currentTutorialStep); }
    function showTutorialStep(step) { tutorialOverlay.querySelectorAll('.tutorial-step').forEach(s => s.style.display = 'none'); const el = tutorialOverlay.querySelector(`.tutorial-step[data-step="${step}"]`); if (el) el.style.display = 'block'; }
    function handleTutorialClick(event) { if (event.target.classList.contains('tutorial-next')) { currentTutorialStep++; showTutorialStep(currentTutorialStep); } else if (event.target.classList.contains('tutorial-end') || event.target.id === 'tutorial-skip-btn') { tutorialOverlay.classList.add('hidden'); } }
    
    function updateDebugCounter() { const visibleMarkers = gameState.isActive ? (map.getPane('markerPane')?.children.length || 0) : markersLayer.getLayers().length; const totalMarkers = allMarkers.length; if(debugCounter) { debugCounter.textContent = `Görünen Eser: ${visibleMarkers} / ${totalMarkers}`; } }

    initMap();
});