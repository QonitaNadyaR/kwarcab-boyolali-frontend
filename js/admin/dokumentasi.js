import { fetchData, sendData, deleteData, showAlert, resetForm, BASE_URL } from '../utils.js';

const dokumentasiForm = document.getElementById('dokumentasiForm');
const galeriFotoGrid = document.getElementById('galeri-grid');
const videoKegiatanGrid = document.getElementById('video-grid');
const loadingFoto = document.getElementById('loading-foto');
const errorFoto = document.getElementById('error-foto');
const noFoto = document.getElementById('no-foto');
const loadingVideo = document.getElementById('loading-video');
const errorVideo = document.getElementById('error-video');
const noVideo = document.getElementById('no-video');

function showElement(element) {
    if (element) element.style.display = 'block';
}

function hideElement(element) {
    if (element) element.style.display = 'none';
}

export const initDokumentasi = () => {
    if (dokumentasiForm) {
        dokumentasiForm.addEventListener('submit', handleDokumentasiSubmit);
    } else {
        console.warn("Dokumentasi form not found, skipping Dokumentasi form initialization.");
    }
    loadDokumentasi();
};

const handleDokumentasiSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(dokumentasiForm);
    try {
        const result = await sendData('dokumentasi', 'POST', formData, true);
        showAlert(result.message || 'Berhasil upload dokumentasi');
        dokumentasiForm.reset();
        loadDokumentasi();
    } catch (err) {
        console.error('Upload dokumentasi gagal:', err);
        showAlert(`Terjadi kesalahan saat mengunggah dokumentasi: ${err.message}`, 'error');
    }
};

export const loadDokumentasi = async () => {
    showElement(loadingFoto);
    hideElement(errorFoto);
    hideElement(noFoto);
    if (galeriFotoGrid) galeriFotoGrid.innerHTML = '';

    showElement(loadingVideo);
    hideElement(errorVideo);
    hideElement(noVideo);
    if (videoKegiatanGrid) videoKegiatanGrid.innerHTML = '';

    try {
        // Sekarang backend hanya akan mengembalikan filename untuk video (tidak ada 'link')
        const data = await fetchData('dokumentasi');

        const fotoData = data.filter(item => item.jenis === 'foto');
        const videoData = data.filter(item => item.jenis === 'video');

        // Render Foto
        hideElement(loadingFoto);
        if (fotoData.length === 0) {
            showElement(noFoto);
            noFoto.textContent = 'Belum ada foto kegiatan yang tersedia.';
        } else {
            hideElement(noFoto);
            fotoData.forEach(item => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                photoItem.setAttribute('data-id', item.id);

                const date = item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Tanggal tidak tersedia';

                photoItem.innerHTML = `
                    <a href="/images/dokumentasi/${item.filename}" data-lightbox="galeri" data-title="${item.judul}">
                        <div class="photo-wrapper">
                            <img src="/images/dokumentasi/${item.filename}" alt="${item.judul}" loading="lazy">
                            <div class="photo-overlay">
                                <h4>${item.judul}</h4>
                                <p class="photo-date">${date}</p>
                            </div>
                        </div>
                    </a>
                    <button class="delete-btn" data-id="${item.id}" data-jenis="foto">Hapus</button>
                `;
                if (galeriFotoGrid) galeriFotoGrid.appendChild(photoItem);
            });
        }

        // Render Video 
        hideElement(loadingVideo);
        if (videoData.length === 0) {
            showElement(noVideo);
            noVideo.textContent = 'Belum ada video kegiatan yang tersedia.';
        } else {
            hideElement(noVideo);
            videoData.forEach(item => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.setAttribute('data-id', item.id);

                const date = item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Tanggal tidak tersedia';

                let videoEmbedHtml = '';

                if (item.filename) {
                    const videoPathMP4 = `/videos/dokumentasi/${item.filename}`;
                    // Jika ada thumbnail terpisah untuk video lokal
                    const posterPath = item.thumbnail_filename ? `/videos/dokumentasi/thumbnails/${item.thumbnail_filename}` : '';

                    videoEmbedHtml = `
                        <video controls ${posterPath ? `poster="${posterPath}"` : ''} aria-label="${item.judul}">
                            <source src="${videoPathMP4}" type="video/mp4">
                            Maaf, browser Anda tidak mendukung pemutaran video ini.
                        </video>
                    `;
                } else {
                    videoEmbedHtml = `<p>Video tidak tersedia.</p>`;
                }

                videoItem.innerHTML = `
                    <div class="video-wrapper">
                        ${videoEmbedHtml}
                        <div class="video-overlay">
                            <h4>${item.judul}</h4>
                            <p class="video-date">${date}</p>
                        </div>
                    </div>
                    <button class="delete-btn" data-id="${item.id}" data-jenis="video">Hapus</button>
                `;
                if (videoKegiatanGrid) videoKegiatanGrid.appendChild(videoItem);
            });
        }

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const jenis = e.target.dataset.jenis;
                deleteDokumentasi(id, jenis);
            });
        });

    } catch (err) {
        console.error('Gagal load dokumentasi:', err);
        hideElement(loadingFoto);
        showElement(errorFoto);
        errorFoto.textContent = `Gagal memuat dokumentasi: ${err.message}`;
        hideElement(loadingVideo);
        hideElement(errorVideo);
        hideElement(noVideo);
        showAlert(`Gagal memuat dokumentasi: ${err.message}`, 'error');
    }
};

const deleteDokumentasi = async (id, jenis) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumentasi ini?')) {
        return;
    }

    const queryParams = `jenis=${jenis}`;

    try {
        const result = await deleteData('dokumentasi', id, queryParams);
        showAlert(result.message || 'Dokumentasi berhasil dihapus!');
        loadDokumentasi();
    } catch (err) {
        console.error('Gagal menghapus dokumentasi:', err);
        showAlert(`Gagal menghapus dokumentasi: ${err.message}`, 'error');
    }
};