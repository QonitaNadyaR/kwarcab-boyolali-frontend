document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://kwarcab-boyolali-backend-nes7-git-main-qonitanadyars-projects.vercel.app/api';
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDotsContainer = document.querySelector('.carousel-dots');
    const newsGrid = document.querySelector('.news-grid');
    const expandBtn = document.querySelector('.expand-btn');
    const eventDesc = document.querySelector('.event-desc');

    let latestNewsData = [];
    let currentCarouselSlideIndex = 0;
    let slideInterval;

    async function fetchAndInitializeWebsite() {
        try {
            const response = await fetch(`${API_BASE_URL}/warta`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
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

                if (slideInterval) {
                    clearInterval(slideInterval);
                }
                slideInterval = setInterval(() => {
                    nextCarouselSlide();
                }, 5000); // Otomatis ganti slide setiap 5 detik
            } else {
                if (carouselTrack) carouselTrack.innerHTML = '<p>Tidak ada warta terbaru yang tersedia saat ini.</p>';
                if (carouselDotsContainer) carouselDotsContainer.innerHTML = '';
            }

            if (oldNewsData.length === 0) {
                if (newsGrid) newsGrid.innerHTML = '<p>Tidak ada warta lama yang tersedia saat ini.</p>';
            }
            setupExpandCollapse();

        } catch (error) {
            console.error('Error fetching data:', error);
            if (carouselTrack) carouselTrack.innerHTML = '<p>Gagal memuat warta terbaru. Mohon coba lagi nanti.</p>';
            if (newsGrid) newsGrid.innerHTML = '<p>Gagal memuat warta lainnya. Mohon coba lagi nanti.</p>';
        }
    }

    // Fungsi untuk memformat tanggal ke format lokal Indonesia
    function formatDate(dateString) {
        if (!dateString) return 'Tanggal tidak tersedia';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) { // Periksa apakah tanggal valid
                return 'Tanggal tidak valid';
            }
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Error tanggal';
        }
    }

    // Fungsi untuk mendapatkan URL gambar yang benar untuk ditampilkan
    function getImageUrlForDisplay(imageUrlFromApi) {
        if (!imageUrlFromApi || imageUrlFromApi.trim() === '') {
            return '/images/placeholder.png';
        }
        if (imageUrlFromApi.startsWith('http://') || imageUrlFromApi.startsWith('https://')) {
            return imageUrlFromApi;
        }
        return `/images/warta/${imageUrlFromApi}`;
    }

    function createMainWartaSlide(article) {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');

        slide.innerHTML = `
            <img src="${getImageUrlForDisplay(article.imageUrl)}" alt="${article.title}" class="slide-image">
            <a href="detail-berita.html?id=${article.id}" class="carousel-content">
                <h3>${article.title}</h3>
                <p>${formatDate(article.created_at)}</p> </a>
        `;
        return slide;
    }

    function createOldWartaCard(article) {
        const cardLink = document.createElement('a');
        cardLink.classList.add('news-card');
        cardLink.href = `detail-berita.html?id=${article.id}`;

        cardLink.innerHTML = `
            <div class="news-image">
                <img src="${getImageUrlForDisplay(article.imageUrl)}" alt="${article.title}">
            </div>
            <div class="news-text-container">
                <h4 class="news-title">${article.title}</h4>
                <p class="news-date">${formatDate(article.created_at)}</p> </div>
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
        newsItems.forEach((news) => {
            const slideElement = createMainWartaSlide(news);
            carouselTrack.appendChild(slideElement);
        });
    }

    // Fungsi untuk merender berita lama ke DOM
    function renderOldNews(newsItems) {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        if (newsItems.length === 0) {
            newsGrid.innerHTML = '<p>Tidak ada warta lainnya yang tersedia.</p>';
            return;
        }
        newsItems.forEach(news => {
            const cardElement = createOldWartaCard(news);
            newsGrid.appendChild(cardElement);
        });
    }


    // === FUNGSI FUNGSIONALITAS CAROUSEL WARTA UTAMA ===
    function updateDots() {
        if (!carouselDotsContainer || !latestNewsData || latestNewsData.length === 0) return;
        carouselDotsContainer.innerHTML = '';
        latestNewsData.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === currentCarouselSlideIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                currentCarouselSlideIndex = index;
                showCarouselSlide(currentCarouselSlideIndex);
                clearInterval(slideInterval);
                slideInterval = setInterval(() => {
                    nextCarouselSlide();
                }, 5000);
            });
            carouselDotsContainer.appendChild(dot);
        });
    }

    function showCarouselSlide(index) {
        if (!carouselTrack || !latestNewsData || latestNewsData.length === 0) return;

        // Hitung posisi geser (setiap slide mengambil 100% lebar carousel-container)
        const offset = -index * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;

        updateDots();
    }

    function nextCarouselSlide() {
        if (!latestNewsData || latestNewsData.length === 0) return;
        currentCarouselSlideIndex = (currentCarouselSlideIndex + 1) % latestNewsData.length;
        showCarouselSlide(currentCarouselSlideIndex);
    }


    // === FUNGSI FUNGSIONALITAS NAVIGASI BERITA LAMA (GRID) ===
    function setupNewsGridNavigation() {

    }

    function setupExpandCollapse() {
        if (expandBtn && eventDesc) {
            expandBtn.addEventListener('click', () => {
                eventDesc.classList.toggle('expanded');
                if (eventDesc.classList.contains('expanded')) {
                    expandBtn.textContent = 'Tutup Deskripsi';
                } else {
                    expandBtn.textContent = 'Baca Selengkapnya';
                }
            });
        }
    }

    fetchAndInitializeWebsite();

}); 