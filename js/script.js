/* 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ */
const DEEZER_API = 'https://api.deezer.com';
const PROXY = 'https://corsproxy.io/?';

let chartsLimit = 6; 
const CHARTS_STEP = 6;
let currentGenreId = '0';
let searchQuery = ''; 

const GENRE_IDS = {
    'pop': '132',
    'rap': '116',
    'rock': '152',
};

/* 2. ЛОГИКА ПЛЕЕРА */
function playDeezerTrack(trackId) {
    const playerContainer = document.getElementById('music-player-container');
    const iframeTarget = document.getElementById('embed-iframe-target');
    
    if (!playerContainer || !iframeTarget) return;

    iframeTarget.innerHTML = `
        <iframe 
            src="https://widget.deezer.com/widget/dark/track/${trackId}" 
            width="100%" height="150" frameborder="0" 
            allowtransparency="true" allow="encrypted-media; clipboard-write">
        </iframe>
    `;
    
    playerContainer.style.display = 'block';
    playerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* 3. ГЕНЕРАЦИЯ КАРТОЧЕК */
function generateTrackCardsHTML(tracksArray) {
    return tracksArray.map(track => {
        const cleanTitle = track.title.replace(/['"]/g, "");
        const artistName = track.artist ? track.artist.name.replace(/['"]/g, "") : "Артист";
        return `
            <div class="track-card">
                <img src="${track.album.cover_medium}" alt="${cleanTitle}">
                <h4>${cleanTitle}</h4>
                <p>${artistName}</p>
                <button class="play-btn" data-id="${track.id}">Слушать</button>
            </div>
        `;
    }).join('');
}

/* 4. ЗАГРУЗКА ДАННЫХ С API */
async function loadMusicData(isFirstLoad = false) {
    const container = document.getElementById('charts-list');
    const loader = document.getElementById('charts-loader');
    
    if (loader && isFirstLoad) loader.style.display = 'block';
    
    try {
        let url = '';
        if (searchQuery) {
            url = `${PROXY}${encodeURIComponent(`${DEEZER_API}/search?q=${searchQuery}&limit=${chartsLimit}`)}`;
        } else {
            const endpoint = currentGenreId === '0' ? '/chart/0/tracks' : `/chart/${currentGenreId}/tracks`;
            url = `${PROXY}${encodeURIComponent(`${DEEZER_API}${endpoint}?limit=${chartsLimit}`)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (loader) loader.style.display = 'none';
        const tracks = data.data || data.tracks?.data || [];
        
        if (tracks.length === 0) {
            container.innerHTML = searchQuery ? `<p>Ничего не найдено...</p>` : `<p>Нет активного чарта :(</p>`;
            return;
        }

        container.innerHTML = generateTrackCardsHTML(tracks);
        if (isFirstLoad) document.getElementById('charts').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error("Ошибка:", err);
    }
}

/* 5. УПРАВЛЕНИЕ СПИСКОМ */
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
        chartsLimit += CHARTS_STEP; 
        loadMusicData(false); 
    };
}

const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.onclick = () => {
        chartsLimit = 6; 
        searchQuery = ''; 
        document.querySelector('#charts .section_title').innerText = 'Мировые чарты';
        loadMusicData(false); 
        document.getElementById('charts').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
}

document.getElementById('charts-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('play-btn')) {
        playDeezerTrack(e.target.getAttribute('data-id'));
    }
});

/* 6. КАРТА ЖАНРОВ */
function initGenreMap() {
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.onclick = () => {
            genreCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const genreText = card.querySelector('h3').innerText.toLowerCase();
            document.querySelector('#charts .section_title').innerText = `Жанр: ${card.querySelector('h3').innerText}`;
            
            searchQuery = ''; 
            chartsLimit = 6;  
            
            if (genreText.includes('cloud') || genreText.includes('hyperpop')) {
                searchQuery = 'bladee'; 
            } else {
                if (genreText.includes('pop')) currentGenreId = GENRE_IDS.pop;
                else if (genreText.includes('rap') || genreText.includes('hip-hop')) currentGenreId = GENRE_IDS.rap;
                else if (genreText.includes('rock')) currentGenreId = GENRE_IDS.rock;
            }
            loadMusicData(true);
        };
    });
}

/* 7. ПОИСК */
function searchMusic() {
    const query = document.querySelector('.search-input').value.trim();
    if (!query) return;
    searchQuery = query; 
    chartsLimit = 6; 
    document.querySelector('#charts .section_title').innerText = `Поиск: "${searchQuery}"`;
    loadMusicData(true); 
}

document.getElementById('search-btn').onclick = searchMusic;
document.querySelector('.search-input').onkeypress = (e) => { if (e.key === 'Enter') searchMusic(); };
document.querySelector('#clear-btn').onclick = () => document.querySelector('.search-input').value = '';

/* 8. ПЛЕЙЛИСТЫ И НАСТРОЕНИЯ */
const myPlaylists = [
    { 
        text: "Можешь послушать мощный хеви-метал - просто кликай по карточке ниже:",
        title: "Heavy metal",
        img: "assets/images/heavymetal.jpg",
        genreId: "464" 
    },
    { 
        text: "Или переключайся на классическую музыку, если хочется спокойствия и глубокого погружения:",
        title: "Classic",
        img: "assets/images/classic.jpg",
        genreId: "98" 
    }  
];

const myMoods = [
    { id: 'workout', title: 'Для тренировки', img: "assets/images/workout.jpg", genres: ["116", "464", "152", "113"] },
    { id: 'chill', title: 'Отдохнуть', img: "assets/images/chill.jpg", genres: ["144", "129", "165"] },
    { id: 'focus', title: 'Для учебы', img: "assets/images/study.jpg", genres: ["98", "129", "185"] },
    { id: 'party', title: 'На вечеринку', img: "assets/images/party.jpg", genres: ["113", "106", "132"] },
    { id: 'sad', title: 'Когда грустно', img: "assets/images/sad.jpg", genres: ["132", "165", "85"] },
    { id: 'gaming', title: 'Под игры', img: "assets/images/gaming.jpg", genres: ["152", "132", "185"] }
];

function renderPlaylists() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = myPlaylists.map(p => `
        <div class="playlist-wrapper">
            <p class="playlist-hint">${p.text}</p>
            <div class="playlist-card" data-genre="${p.genreId}">
                <img src="${p.img}" alt="${p.title}">
                <h3>${p.title}</h3>
            </div>
        </div>
    `).join('');
}

function renderMoods() {
    const container = document.getElementById('mood-container');
    if (!container) return;
    container.innerHTML = myMoods.map(m => `
        <div class="playlist-card mood-card" data-mood="${m.id}">
            <img src="${m.img}" alt="${m.title}">
            <h3>${m.title}</h3>
        </div>
    `).join('');
}

document.getElementById('playlist-container').addEventListener('click', async (e) => {
    const card = e.target.closest('.playlist-card');
    if (!card) return;
    const url = `${PROXY}${encodeURIComponent(`${DEEZER_API}/chart/${card.getAttribute('data-genre')}/tracks?limit=50`)}`;
    const data = await (await fetch(url)).json();
    const tracks = data.data || data.tracks?.data || [];
    if (tracks.length > 0) playDeezerTrack(tracks[Math.floor(Math.random() * tracks.length)].id);
});

document.getElementById('mood-container').addEventListener('click', async (e) => {
    const card = e.target.closest('.mood-card');
    if (!card) return;
    const mood = myMoods.find(m => m.id === card.getAttribute('data-mood'));
    const genre = mood.genres[Math.floor(Math.random() * mood.genres.length)];
    const url = `${PROXY}${encodeURIComponent(`${DEEZER_API}/chart/${genre}/tracks?limit=50`)}`;
    const data = await (await fetch(url)).json();
    const tracks = data.data || data.tracks?.data || [];
    if (tracks.length > 0) playDeezerTrack(tracks[Math.floor(Math.random() * tracks.length)].id);
});

/* 9. ФОРМА ОБРАТНОЙ СВЯЗИ */
document.getElementById('email-link').onclick = () => {
    const email = "irunella.dav@gmail.com";
    navigator.clipboard.writeText(email).then(() => alert("Email скопирован!"));
};

document.getElementById('contactForm').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        alert('Введите корректный email.');
        return;
    }
    console.log('Email:', input.value.trim());
    alert('Готово!');
    input.value = '';
};

/* 10. ЗАПУСК */
loadMusicData(false);
renderPlaylists();
renderMoods();
initGenreMap();