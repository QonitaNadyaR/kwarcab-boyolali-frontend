// frontend/js/dokumentasi.js

// Fungsi helper untuk menyembunyikan/menampilkan elemen
function showElement(elementId, display = 'block') {
    const element = document.getElementById(elementId);
    if (element) element.style.display = display;
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
}

// Definisikan API_BASE_URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000/api'
    : 'https://kwarcab-backend.vercel.app/api';

// Fungsi untuk memuat dan menampilkan daftar foto dokumentasi
async function loadFotoDokumentasi() {
    const galeriGridDiv = document.getElementById('galeri-grid');
    if (!galeriGridDiv) return;

    const loadingFoto = document.getElementById('loading-foto');
    const errorFoto = document.getElementById('error-foto');
    const noFoto = document.getElementById('no-foto');

    showElement('loading-foto');
    hideElement('error-foto');
    hideElement('no-foto');
    galeriGridDiv.innerHTML = ''; // Bersihkan konten sebelumnya

    try {
        // PERBAIKAN: Menggunakan rute API yang benar untuk foto
        const response = await fetch(`${API_BASE_URL}/dokumentasi/foto`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fotoData = await response.json();

        hideElement('loading-foto');

        if (fotoData.length === 0) {
            showElement('no-foto');
            if (noFoto) noFoto.textContent = 'Belum ada foto kegiatan yang tersedia.';
            return;
        }

        fotoData.forEach(foto => {
            const date = foto.uploaded_at ? new Date(foto.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Diketahui';
            // PERBAIKAN: Menggunakan properti yang benar
            const filePath = foto.url;

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
        if (errorFoto) errorFoto.textContent = 'Gagal memuat foto. Silakan coba lagi nanti.';
    }
}

// Fungsi untuk memuat dan menampilkan daftar video dokumentasi
async function loadVideoDokumentasi() {
    const videoGridDiv = document.getElementById('video-grid');
    if (!videoGridDiv) return;

    const loadingVideo = document.getElementById('loading-video');
    const errorVideo = document.getElementById('error-video');
    const noVideo = document.getElementById('no-video');

    showElement('loading-video');
    hideElement('error-video');
    hideElement('no-video');
    videoGridDiv.innerHTML = ''; // Bersihkan konten sebelumnya

    try {
        // PERBAIKAN: Menggunakan rute API yang benar untuk video
        const response = await fetch(`${API_BASE_URL}/dokumentasi/video`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videoData = await response.json();

        hideElement('loading-video');

        if (videoData.length === 0) {
            showElement('no-video');
            if (noVideo) noVideo.textContent = 'Belum ada video kegiatan yang tersedia.';
            return;
        }

        videoData.forEach(video => {
            const date = video.uploaded_at ? new Date(video.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Diketahui';
            // PERBAIKAN: Menggunakan properti yang benar
            const videoPath = video.url;

            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.innerHTML = `
                <div class="video-wrapper">
                    <video controls aria-label="${video.judul}" preload="metadata">
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
        if (errorVideo) errorVideo.textContent = 'Gagal memuat video. Silakan coba lagi nanti.';
    }
}

// Panggil semua fungsi yang diperlukan saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadFotoDokumentasi();
    loadVideoDokumentasi();
});