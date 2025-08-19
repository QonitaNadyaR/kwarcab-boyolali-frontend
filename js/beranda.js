// frontend/js/beranda.js

document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:4000/api'
        : 'https://kwarcab-backend.vercel.app/api';

    const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

    // Element references
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDotsContainer = document.querySelector('.carousel-dots');
    const newsGrid = document.querySelector('.news-grid');
    const expandBtn = document.querySelector('.expand-btn');
    const eventDesc = document.querySelector('.event-desc');

    let latestNewsData = [];
    let currentCarouselSlideIndex = 0;
    let slideInterval;

    // =======================
    // Utility Functions
    // =======================
    function getImageUrlForDisplay(imageUrlFromApi) {
        // Jika imageUrlFromApi adalah URL lengkap (dari Cloudinary), gunakan langsung.
        if (imageUrlFromApi && (imageUrlFromApi.startsWith('http://') || imageUrlFromApi.startsWith('https://'))) {
            return imageUrlFromApi;
        }

        // Jika tidak, gunakan gambar placeholder.
        return '/images/placeholder.png';
    }

    function formatDate(dateString) {
        if (!dateString) return 'Tanggal tidak tersedia';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Tanggal tidak valid';
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Error tanggal';
        }
    }

    // =======================
    // Render Functions
    // =======================
    function createMainWartaSlide(article) {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        slide.innerHTML = `
            <img src="${getImageUrlForDisplay(article.imageUrl)}" alt="${article.title}" class="slide-image">
            <a href="detail-berita.html?id=${article._id}" class="carousel-content">
                <h3>${article.title}</h3>
                <p>${formatDate(article.created_at)}</p>
            </a>
        `;
        return slide;
    }

    function createOldWartaCard(article) {
        const cardLink = document.createElement('a');
        cardLink.classList.add('news-card');
        cardLink.href = `detail-berita.html?id=${article._id}`;
        cardLink.innerHTML = `
            <div class="news-image">
                <img src="${getImageUrlForDisplay(article.imageUrl)}" alt="${article.title}">
            </div>
            <div class="news-text-container">
                <h4 class="news-title">${article.title}</h4>
                <p class="news-date">${formatDate(article.created_at)}</p>
            </div>
        `;
        return cardLink;
    }

    function renderLatestNews(newsItems) {
        if (!carouselTrack) return;
        carouselTrack.innerHTML = '';
        if (newsItems.length === 0) {
            carouselTrack.innerHTML = '<p>Tidak ada warta terbaru yang tersedia.</p>';
            return;
        }
        newsItems.forEach(news => carouselTrack.appendChild(createMainWartaSlide(news)));
    }

    function renderOldNews(newsItems) {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        if (newsItems.length === 0) {
            newsGrid.innerHTML = '<p>Tidak ada warta lainnya yang tersedia.</p>';
            return;
        }
        newsItems.forEach(news => newsGrid.appendChild(createOldWartaCard(news)));
    }

    function updateDots() {
        if (!carouselDotsContainer || !latestNewsData || latestNewsData.length === 0) return;
        carouselDotsContainer.innerHTML = '';
        latestNewsData.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === currentCarouselSlideIndex) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentCarouselSlideIndex = index;
                showCarouselSlide(currentCarouselSlideIndex);
                clearInterval(slideInterval);
                slideInterval = setInterval(nextCarouselSlide, 5000);
            });
            carouselDotsContainer.appendChild(dot);
        });
    }

    function showCarouselSlide(index) {
        if (!carouselTrack || !latestNewsData || latestNewsData.length === 0) return;
        const offset = -index * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;
        updateDots();
    }

    function nextCarouselSlide() {
        if (!latestNewsData || latestNewsData.length === 0) return;
        currentCarouselSlideIndex = (currentCarouselSlideIndex + 1) % latestNewsData.length;
        showCarouselSlide(currentCarouselSlideIndex);
    }

    function setupExpandCollapse() {
        if (expandBtn && eventDesc) {
            expandBtn.addEventListener('click', () => {
                eventDesc.classList.toggle('expanded');
                expandBtn.textContent = eventDesc.classList.contains('expanded') ? 'Tutup Deskripsi' : 'Baca Selengkapnya';
            });
        }
    }

    function setupWartaSearch() {
        const searchInput = document.getElementById('wartaSearchInput');
        if (!searchInput) return;

        // Gunakan debounce untuk mencegah terlalu banyak pemfilteran
        let debounceTimeout;
        searchInput.addEventListener('input', (event) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = event.target.value.toLowerCase().trim();

                if (searchTerm === '') {
                    // Jika input kosong, tampilkan seperti semula
                    wartaCarouselSection.style.display = 'block';
                    renderLatestNews(allWartaDataGlobal.slice(0, 3));
                    renderOldNews(allWartaDataGlobal.slice(3));
                    if (allWartaDataGlobal.length > 0) {
                        updateDots();
                        showCarouselSlide(currentCarouselSlideIndex);
                        if (slideInterval) clearInterval(slideInterval);
                        slideInterval = setInterval(nextCarouselSlide, 5000);
                    }
                } else {
                    // Jika ada pencarian, sembunyikan carousel dan tampilkan semua hasil di grid
                    wartaCarouselSection.style.display = 'none';
                    const filteredWarta = allWartaDataGlobal.filter(warta =>
                        warta.title.toLowerCase().includes(searchTerm)
                    );
                    renderOldNews(filteredWarta);
                }
            }, 300); // Tunda 300ms
        });
    }

    // =======================
    // Fetch Data & Initialize
    // =======================
    async function fetchAndInitializeWebsite() {
        try {
            const response = await fetch(`${API_BASE_URL}/warta`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            const allWartaData = await response.json();
            console.log('Data Warta diterima dari API:', allWartaData);

            const carouselLimit = 3;
            latestNewsData = allWartaData.slice(0, carouselLimit);
            const oldNewsData = allWartaData.slice(carouselLimit);

            renderLatestNews(latestNewsData);
            renderOldNews(oldNewsData);

            if (latestNewsData.length > 0) {
                updateDots();
                showCarouselSlide(currentCarouselSlideIndex);
                if (slideInterval) clearInterval(slideInterval);
                slideInterval = setInterval(nextCarouselSlide, 5000);
            } else {
                if (carouselTrack) carouselTrack.innerHTML = '<p>Tidak ada warta terbaru yang tersedia saat ini.</p>';
                if (carouselDotsContainer) carouselDotsContainer.innerHTML = '';
            }

            if (oldNewsData.length === 0 && newsGrid) {
                newsGrid.innerHTML = '<p>Tidak ada warta lama yang tersedia saat ini.</p>';
            }

            setupExpandCollapse();
        } catch (error) {
            console.error('Error fetching data:', error);
            if (carouselTrack) carouselTrack.innerHTML = '<p>Gagal memuat warta terbaru. Mohon coba lagi nanti.</p>';
            if (newsGrid) newsGrid.innerHTML = '<p>Gagal memuat warta lainnya. Mohon coba lagi nanti.</p>';
        }
    }

    // Jalankan inisialisasi
    fetchAndInitializeWebsite();
});
