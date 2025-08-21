// frontend/js/admin/dokumentasi.js
import { fetchData, sendData, deleteData, showAlert, API_BASE_URL, BASE_URL_MEDIA } from '../utils.js';

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

    // Menggunakan event delegation pada elemen induk
    document.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const jenis = deleteBtn.dataset.jenis;
            deleteDokumentasi(id, jenis);
        }
    });

    loadDokumentasi();
};

const handleDokumentasiSubmit = async (e) => {
    e.preventDefault();

    const jenisInput = dokumentasiForm.querySelector('select[name="jenis"]');
    const fileInput = dokumentasiForm.querySelector('input[name="file"]');
    const judulInput = dokumentasiForm.querySelector('input[name="judul"]');

    if (!jenisInput || !jenisInput.value) {
        showAlert('Jenis dokumentasi (foto/video) harus dipilih.', 'error');
        return;
    }
    if (!fileInput.files.length) {
        showAlert('File (foto/video) harus diunggah.', 'error');
        return;
    }
    if (!judulInput.value) {
        showAlert('Judul harus diisi.', 'error');
        return;
    }

    const jenis = jenisInput.value;
    const formData = new FormData();
    formData.append('judul', judulInput.value);

    if (jenis === 'foto') {
        formData.append('image', fileInput.files[0]);
    } else if (jenis === 'video') {
        formData.append('video', fileInput.files[0]);
    } else {
        showAlert('Jenis dokumentasi tidak valid.', 'error');
        return;
    }

    try {
        const endpoint = `dokumentasi/${jenis}`;
        const result = await sendData(endpoint, 'POST', formData, true);
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
        const fotoData = await fetchData('dokumentasi/foto');
        const videoData = await fetchData('dokumentasi/video');

        hideElement(loadingFoto);
        if (fotoData.length === 0) {
            showElement(noFoto);
            noFoto.textContent = 'Belum ada foto kegiatan yang tersedia.';
        } else {
            hideElement(noFoto);
            fotoData.forEach(item => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';

                const date = item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Tanggal tidak tersedia';

                const imageUrl = item.url;
                if (!imageUrl) return;

                photoItem.innerHTML = `
                    <a href="${imageUrl}" data-lightbox="galeri" data-title="${item.judul}">
                        <div class="photo-wrapper">
                            <img src="${imageUrl}" alt="${item.judul}" loading="lazy">
                            <div class="photo-overlay">
                                <h4>${item.judul}</h4>
                                <p class="photo-date">${date}</p>
                            </div>
                        </div>
                    </a>
                    <div class="action-buttons-wrapper">
                        <button class="delete-btn" data-id="${item._id}" data-jenis="foto"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                if (galeriFotoGrid) galeriFotoGrid.appendChild(photoItem);
            });
        }

        hideElement(loadingVideo);
        if (videoData.length === 0) {
            showElement(noVideo);
            noVideo.textContent = 'Belum ada video kegiatan yang tersedia.';
        } else {
            hideElement(noVideo);
            videoData.forEach(item => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                const date = item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Tanggal tidak tersedia';

                let videoEmbedHtml = '';
                if (item.url) {
                    const videoPathMP4 = item.url;

                    videoEmbedHtml = `
                        <video controls aria-label="${item.judul}">
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
                    <div class="action-buttons-wrapper">
                        <button class="delete-btn" data-id="${item._id}" data-jenis="video"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                if (videoKegiatanGrid) videoKegiatanGrid.appendChild(videoItem);
            });
        }

    } catch (err) {
        console.error('Gagal load dokumentasi:', err);
        hideElement(loadingFoto);
        showElement(errorFoto);
        errorFoto.textContent = `Gagal memuat dokumentasi: ${err.message}`;
        hideElement(loadingVideo);
        showElement(errorVideo);
        errorVideo.textContent = `Gagal memuat video: ${err.message}`;
        showAlert(`Gagal memuat dokumentasi: ${err.message}`, 'error');
    }
};

const deleteDokumentasi = async (id, jenis) => {
    if (!id || !jenis) {
        console.error('ID or jenis is undefined:', { id, jenis });
        showAlert('Gagal menghapus: ID atau jenis tidak valid.', 'error');
        return;
    }

    // Tambahkan konfirmasi
    if (!window.confirm(`Apakah Anda yakin ingin menghapus dokumentasi ${jenis} ini?`)) {
        return;
    }

    try {
        const endpoint = `dokumentasi/${jenis}`;
        const result = await deleteData(endpoint, id);

        showAlert(result.message || 'Dokumentasi berhasil dihapus!');
        loadDokumentasi();
    } catch (err) {
        console.error('Gagal menghapus dokumentasi:', err);
        showAlert(`Gagal menghapus dokumentasi: ${err.message}`, 'error');
    }
};