// frontend/js/dokumentasi.js

// Impor variabel dari utils.js
import { API_BASE_URL, BASE_URL } from './utils.js';

/**
 * Fungsi helper untuk menyembunyikan/menampilkan elemen.
 * @param {string} elementId ID elemen HTML.
 * @param {string} [display='block'] Tipe display CSS.
 */
function showElement(elementId, display = 'block') {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = display;
    }
}

/**
 * Fungsi helper untuk menyembunyikan elemen.
 * @param {string} elementId ID elemen HTML.
 */
function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Fungsi untuk memuat dan menampilkan daftar foto dokumentasi
async function loadFotoDokumentasi() {
    const galeriGridDiv = document.getElementById('galeri-grid');
    const loadingFoto = document.getElementById('loading-foto');
    const errorFoto = document.getElementById('error-foto');
    const noFoto = document.getElementById('no-foto');

    if (!galeriGridDiv || !loadingFoto || !errorFoto || !noFoto) {
        console.error('Missing required photo elements.');
        return;
    }

    showElement('loading-foto');
    hideElement('error-foto');
    hideElement('no-foto');
    galeriGridDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/dokumentasi/foto`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const fotoData = await response.json();

        hideElement('loading-foto');

        if (fotoData.length === 0) {
            showElement('no-foto');
            noFoto.textContent = 'Belum ada foto kegiatan yang tersedia.';
            return;
        }

        fotoData.forEach(foto => {
            const date = foto.uploaded_at ? new Date(foto.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Diketahui';
            // Gunakan BASE_URL untuk membangun path gambar
            const filePath = `${BASE_URL}/images/dokumentasi/${foto.filename}`;

            const photoItem = document.createElement('div');
            photoItem.classList.add('photo-item');
            photoItem.innerHTML = `
                <a href="${filePath}" data-lightbox="galeri-dokumentasi" data-title="${foto.judul}">
                    <div class="photo-wrapper">
                        <img src="${filePath}" alt="${foto.judul}" loading="lazy">
                    </div>
                    <div class="photo-content">
                        <h4>${foto.judul}</h4>
                        <p class="photo-date">${date}</p>
                    </div>
                </a>
            `;
            galeriGridDiv.appendChild(photoItem);
        });

    } catch (error) {
        console.error('Error loading foto dokumentasi:', error);
        hideElement('loading-foto');
        showElement('error-foto');
        errorFoto.textContent = `Gagal memuat foto: ${error.message}. Silakan coba lagi nanti.`;
    }
}

// Fungsi untuk memuat dan menampilkan daftar video dokumentasi
async function loadVideoDokumentasi() {
    const videoGridDiv = document.getElementById('video-grid');
    const loadingVideo = document.getElementById('loading-video');
    const errorVideo = document.getElementById('error-video');
    const noVideo = document.getElementById('no-video');

    if (!videoGridDiv || !loadingVideo || !errorVideo || !noVideo) {
        console.error('Missing required video elements.');
        return;
    }

    showElement('loading-video');
    hideElement('error-video');
    hideElement('no-video');
    videoGridDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/dokumentasi/video`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const videoData = await response.json();

        hideElement('loading-video');

        if (videoData.length === 0) {
            showElement('no-video');
            noVideo.textContent = 'Belum ada video kegiatan yang tersedia.';
            return;
        }

        videoData.forEach(video => {
            const date = video.uploaded_at ? new Date(video.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Diketahui';
            // Gunakan BASE_URL untuk membangun path video
            const videoPath = `${BASE_URL}/videos/dokumentasi/${video.filename}`;
            const posterPath = video.thumbnail_filename ? `${BASE_URL}/videos/dokumentasi/thumbnails/${video.thumbnail_filename}` : '';

            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.innerHTML = `
                <div class="video-wrapper">
                    <video controls aria-label="${video.judul}" preload="metadata" ${posterPath ? `poster="${posterPath}"` : ''}>
                        <source src="${videoPath}" type="video/mp4">
                        Maaf, browser Anda tidak mendukung pemutaran video ini.
                    </video>
                </div>
                <div class="video-content">
                    <h4>${video.judul}</h4>
                    <p class="video-date">${date}</p>
                </div>
            `;
            videoGridDiv.appendChild(videoItem);
        });

    } catch (error) {
        console.error('Error loading video dokumentasi:', error);
        hideElement('loading-video');
        showElement('error-video');
        errorVideo.textContent = `Gagal memuat video: ${error.message}. Silakan coba lagi nanti.`;
    }
}

// Panggil semua fungsi yang diperlukan saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadFotoDokumentasi();
    loadVideoDokumentasi();
});