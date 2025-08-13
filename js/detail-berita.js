document.addEventListener('DOMContentLoaded', async () => {
    // Tentukan URL backend secara dinamis
    const API_BASE_URL =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:4000/api'
            : 'https://kwarcab-backend.vercel.app/api';

    const newsDetailSection = document.getElementById('news-detail-section');
    const pageTitle = document.getElementById('pageTitle');
    const detailImage = document.getElementById('detail-image');
    const detailTitle = document.getElementById('detail-title');
    const detailDate = document.getElementById('detail-date');
    const detailContentDiv = document.getElementById('detail-content');

    function formatDate(dateString) {
        if (!dateString) {
            console.warn('Date string is null or empty.');
            return 'Tanggal tidak tersedia';
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error('Invalid date string provided:', dateString);
                return 'Tanggal tidak valid';
            }
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        } catch (e) {
            console.error('Error formatting date:', e, 'for dateString:', dateString);
            return 'Error tanggal';
        }
    }

    const getNewsIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const newsId = getNewsIdFromUrl();

    if (!newsId) {
        if (newsDetailSection) {
            newsDetailSection.innerHTML = '<p>ID Berita tidak ditemukan. Silakan kembali ke beranda.</p>';
        }
        if (pageTitle) {
            pageTitle.textContent = 'Berita Tidak Ditemukan';
        }
        return;
    }

    // Tampilkan pesan loading
    if (newsDetailSection) {
        newsDetailSection.innerHTML = '<p class="loading-message">Memuat detail berita...</p>';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/warta/${newsId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Berita tidak ditemukan.');
            }
            throw new Error(`Gagal memuat berita: ${response.status} ${response.statusText}`);
        }

        const news = await response.json();
        console.log('Detail Berita diterima dari API:', news);

        // Logika URL gambar disederhanakan karena menggunakan Cloudinary
        let imageUrlToUse = news.imageUrl;
        if (!imageUrlToUse || imageUrlToUse.trim() === '') {
            imageUrlToUse = '/images/placeholder.png';
        }

        if (pageTitle) {
            pageTitle.textContent = news.title;
        }

        // Logika untuk memproses dan menampilkan konten teks
        const rawContent = news.content || '';
        const contentWithParagraphs = rawContent.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

        // Masukkan data ke elemen-elemen HTML
        if (detailImage) {
            detailImage.src = imageUrlToUse;
            detailImage.alt = news.title;
            detailImage.style.display = 'block';
        }
        if (detailTitle) {
            detailTitle.textContent = news.title;
        }
        if (detailDate) {
            detailDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(news.created_at)}`;
        }
        if (detailContentDiv) {
            detailContentDiv.innerHTML = contentWithParagraphs || '<p>Konten berita tidak tersedia.</p>';
        }

    } catch (error) {
        console.error('Error fetching news detail:', error);
        if (newsDetailSection) {
            newsDetailSection.innerHTML = `<p class="error-message">${error.message}</p><p>Mohon coba lagi nanti.</p>`;
        }
        if (pageTitle) {
            pageTitle.textContent = 'Error Memuat Berita';
        }
    }
});