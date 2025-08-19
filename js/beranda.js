// frontend/js/beranda.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:4000/api'
        : 'https://kwarcab-backend.vercel.app/api';

    const carouselTrack = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const oldNewsContainer = document.querySelector('.news-grid');
    const wartaCarouselSection = document.getElementById('wartaCarouselSection');

    let allWartaDataGlobal = [];
    let currentCarouselSlideIndex = 0;
    let slideInterval;

    // === Fetch Data ===
    async function fetchWarta() {
        try {
            const res = await fetch(`${API_BASE_URL}/warta`);
            const data = await res.json();
            allWartaDataGlobal = data;
            initializeCarouselAndNews(data);
        } catch (err) {
            console.error("Gagal fetch warta:", err);
        }
    }

    // === Render Carousel ===
    function renderCarousel(data) {
        carouselTrack.innerHTML = "";
        dotsContainer.innerHTML = "";

        data.slice(0, 3).forEach((warta, index) => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-slide');
            slide.innerHTML = `
                <img src="${warta.image}" alt="${warta.title}">
                <div class="carousel-caption">
                    <h3>${warta.title}</h3>
                    <p>${warta.content.substring(0, 100)}...</p>
                </div>
            `;
            carouselTrack.appendChild(slide);

            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showCarouselSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    function showCarouselSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.dot');

        if (slides.length === 0) return;

        currentCarouselSlideIndex = (index + slides.length) % slides.length;

        carouselTrack.style.transform = `translateX(-${currentCarouselSlideIndex * 100}%)`;

        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentCarouselSlideIndex]) {
            dots[currentCarouselSlideIndex].classList.add('active');
        }
    }

    function nextCarouselSlide() {
        showCarouselSlide(currentCarouselSlideIndex + 1);
    }

    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentCarouselSlideIndex]) {
            dots[currentCarouselSlideIndex].classList.add('active');
        }
    }

    // === Render Old News ===
    function renderOldNews(data) {
        oldNewsContainer.innerHTML = "";
        if (data.length === 0) {
            oldNewsContainer.innerHTML = "<p>Tidak ada berita ditemukan.</p>";
            return;
        }
        data.forEach(warta => {
            const card = document.createElement('div');
            card.classList.add('news-card');
            card.innerHTML = `
                <img src="${warta.image}" alt="${warta.title}">
                <h4>${warta.title}</h4>
                <p>${warta.content.substring(0, 80)}...</p>
            `;
            oldNewsContainer.appendChild(card);
        });
    }

    // === Init ===
    function initializeCarouselAndNews(data) {
        if (!data || data.length === 0) return;

        renderCarousel(data);
        renderOldNews(data.slice(3));
        showCarouselSlide(0);

        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextCarouselSlide, 5000);
    }

    // === Search ===
    function setupWartaSearch() {
        const searchInput = document.getElementById('wartaSearchInput');
        if (!searchInput) return;

        function handleSearch(event) {
            const searchTerm = event.target.value.toLowerCase().trim();

            if (searchTerm === "") {
                // Kosong → tampilkan lagi carousel + berita lama
                wartaCarouselSection.style.display = "block";
                initializeCarouselAndNews(allWartaDataGlobal);
            } else {
                // Ada keyword → sembunyikan carousel
                wartaCarouselSection.style.display = "none";

                const filteredWarta = allWartaDataGlobal.filter(warta =>
                    warta.title.toLowerCase().includes(searchTerm) ||
                    warta.content.toLowerCase().includes(searchTerm)
                );

                renderOldNews(filteredWarta);
            }
        }

        // realtime dengan debounce
        let debounceTimeout;
        searchInput.addEventListener("input", (event) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => handleSearch(event), 300);
        });

        // tekan Enter
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSearch(event);
            }
        });
    }

    // === Jalankan ===
    fetchWarta();
    setupWartaSearch();
});
