document.addEventListener('DOMContentLoaded', async () => {
    // Pastikan API_BASE_URL sesuai dengan port backend Anda
    const API_BASE_URL = 'http://localhost:4000/api';

    const newsDetailSection = document.getElementById('news-detail-section');
    const pageTitle = document.getElementById('pageTitle'); // Ini biasanya untuk <title> halaman HTML
    // Elemen spesifik untuk detail berita
    const detailImage = document.getElementById('detail-image');
    const detailTitle = document.getElementById('detail-title');
    const detailDate = document.getElementById('detail-date');
    const detailContentDiv = document.getElementById('detail-content');

    // Fungsi untuk memformat tanggal ke format lokal Indonesia
    function formatDate(dateString) {
        if (!dateString) {
            console.warn('Date string is null or empty, returning "Tanggal tidak tersedia".');
            return 'Tanggal tidak tersedia';
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) { // Memeriksa apakah tanggal valid setelah parsing
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

    // Fungsi untuk mendapatkan ID berita dari URL
    const getNewsIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const newsId = getNewsIdFromUrl();

    // Jika ID berita tidak ditemukan di URL
    if (!newsId) {
        if (detailContentDiv) {
            detailContentDiv.innerHTML = '<p>ID Berita tidak ditemukan. Silakan kembali ke beranda.</p>';
        } else if (newsDetailSection) {
            newsDetailSection.innerHTML = '<p>ID Berita tidak ditemukan. Silakan kembali ke beranda.</p>';
        }
        if (pageTitle) {
            pageTitle.textContent = 'Berita Tidak Ditemukan';
        }
        return; // Hentikan eksekusi lebih lanjut
    }

    // Tampilkan pesan loading awal
    if (detailContentDiv) {
        detailContentDiv.innerHTML = '<p>Memuat detail berita...</p>';
    } else if (newsDetailSection) {
        newsDetailSection.innerHTML = '<p>Memuat detail berita...</p>';
    }

    try {
        // Mengambil data berita dari API backend
        const response = await fetch(`${API_BASE_URL}/warta/${newsId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Berita tidak ditemukan.');
            }
            throw new Error(`Gagal memuat berita: ${response.status} ${response.statusText}`);
        }

        const news = await response.json();
        console.log('Detail Berita diterima dari API:', news);

        // Menentukan URL gambar yang akan digunakan
        let imageUrlToUse = news.imageUrl;
        if (!imageUrlToUse || imageUrlToUse.trim() === '') {
            imageUrlToUse = '/images/placeholder.png'; // Fallback ke gambar placeholder
        } else {
            // Pastikan URL selalu diawali dengan /images/ jika itu adalah nama file lokal
            // Cek apakah bukan URL eksternal lengkap
            if (!imageUrlToUse.startsWith('http://') && !imageUrlToUse.startsWith('https://') && !imageUrlToUse.startsWith('/images/')) {
                imageUrlToUse = `/images/${imageUrlToUse}`;
            }
        }

        // Perbarui judul halaman (tab browser)
        if (pageTitle) {
            pageTitle.textContent = news.title;
        }

        // --- Logika untuk memproses dan menampilkan konten teks ---
        let contentHtml = '';
        const rawContent = news.content || ''; // Pastikan tidak null
        const lines = rawContent.split('\n');
        let currentParagraph = '';

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine === '') {
                // Jika baris kosong (mengindikasikan paragraf baru)
                if (currentParagraph !== '') {
                    contentHtml += `<p>${currentParagraph}</p>`;
                    currentParagraph = ''; // Reset untuk paragraf berikutnya
                }
            } else {
                // Jika bukan baris kosong, tambahkan ke paragraf saat ini
                if (currentParagraph !== '') {
                    currentParagraph += '<br>'; // Tambahkan <br> untuk single enter di dalam paragraf
                }
                currentParagraph += trimmedLine;
            }

            // Jika ini baris terakhir dan ada sisa konten di currentParagraph, tambahkan sebagai paragraf
            if (index === lines.length - 1 && currentParagraph !== '') {
                contentHtml += `<p>${currentParagraph}</p>`;
            }
        });

        // Jika contentHtml masih kosong setelah loop (misal, news.content kosong atau hanya spasi), berikan fallback
        if (contentHtml.trim() === '') {
            contentHtml = '<p>Konten berita tidak tersedia.</p>';
        }
        // --- Akhir logika konten teks ---

        // Memasukkan data ke elemen-elemen HTML
        if (detailImage) {
            detailImage.src = imageUrlToUse;
            detailImage.alt = news.title;
            detailImage.style.display = 'block'; // Pastikan gambar ditampilkan
        }
        if (detailTitle) {
            detailTitle.textContent = news.title;
        }
        if (detailDate) {
            // Menggunakan created_at yang dikirim dari backend
            detailDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(news.created_at)}`;
        }
        if (detailContentDiv) {
            detailContentDiv.innerHTML = contentHtml; // Sisipkan HTML paragraf yang sudah diproses
        }

    } catch (error) {
        console.error('Error fetching news detail:', error);
        // Tampilkan pesan error di tempat yang sesuai
        if (detailContentDiv) {
            detailContentDiv.innerHTML = `<p>${error.message}</p><p>Mohon coba lagi nanti.</p>`;
        } else if (newsDetailSection) {
            newsDetailSection.innerHTML = `<p>${error.message}</p><p>Mohon coba lagi nanti.</p>`;
        }
        if (pageTitle) {
            pageTitle.textContent = 'Error Memuat Berita';
        }
    }
});