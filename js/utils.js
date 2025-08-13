// frontend/js/utils.js

// Tentukan BASE_URL sesuai environment (localhost / production)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000/api'
    : 'https://kwarcab-boyolali-backend-nes7-git-main-qonitanadyars-projects.vercel.app/api';

// Versi tanpa /api untuk URL gambar dan frontend
const BASE_URL_NO_API = API_BASE_URL.replace('/api', '');

export const BASE_URL = API_BASE_URL.replace('/api', '');

/**
 * Menampilkan notifikasi sederhana.
 * @param {string} message Pesan notifikasi
 * @param {string} [type='success'] Tipe notifikasi: success, error, info, dll.
 */
export function showAlert(message, type = 'success') {
    alert(`[${type.toUpperCase()}] ${message}`);
    console.log(`Alert (${type}): ${message}`);
}

/**
 * Fetch dengan header otentikasi (Bearer token).
 * Redirect ke halaman login jika token tidak ditemukan.
 * @param {string} url URL endpoint lengkap
 * @param {object} options Options fetch tambahan
 * @returns {Promise<Response>}
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
        window.location.href = 'login.html';
        throw new Error('No authentication token found.');
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    return fetch(url, { ...options, headers });
}

/**
 * GET data dari API dengan otentikasi.
 * @param {string} endpoint Endpoint API tanpa base URL (misal: 'warta')
 * @returns {Promise<any>}
 */
export async function fetchData(endpoint) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `Server merespons dengan status ${response.status}.`);
            } catch {
                throw new Error(`Server merespons dengan status ${response.status}. Respons: ${errorText}`);
            }
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw new Error(`Gagal memuat data: ${error.message}`);
    }
}

/**
 * POST atau PUT data ke API dengan otentikasi.
 * @param {string} endpoint Endpoint API tanpa base URL
 * @param {string} method 'POST' atau 'PUT'
 * @param {object|FormData} data Data yang akan dikirim
 * @param {boolean} isFormData Apakah data berupa FormData (true) atau JSON (false)
 * @returns {Promise<any>}
 */
export async function sendData(endpoint, method, data, isFormData = false) {
    const authToken = localStorage.getItem('authToken');
    const headers = {
        Authorization: `Bearer ${authToken}`
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
        body: isFormData ? data : JSON.stringify(data)
    };

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gagal menyimpan data: Server merespons dengan status ${response.status}. Respons: ${JSON.stringify(errorData)}`);
    }
    return await response.json();
}

/**
 * DELETE data di API dengan otentikasi.
 * @param {string} endpoint Endpoint API tanpa base URL
 * @param {string} id ID data yang akan dihapus
 * @param {string} [queryParams] Parameter query tambahan jika ada
 * @returns {Promise<any>}
 */
export async function deleteData(endpoint, id, queryParams = '') {
    try {
        const url = queryParams
            ? `${API_BASE_URL}/${endpoint}/${id}?${queryParams}`
            : `${API_BASE_URL}/${endpoint}/${id}`;

        const response = await fetchWithAuth(url, { method: 'DELETE' });
        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `Gagal menghapus: Server merespons dengan status ${response.status}.`);
            } catch {
                throw new Error(`Gagal menghapus: Server merespons dengan status ${response.status}. Respons: ${errorText}`);
            }
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return { message: 'Operasi berhasil (tidak ada konten)' };
    } catch (error) {
        console.error(`Error deleting data from ${endpoint}/${id}:`, error);
        throw new Error(`Gagal menghapus data: ${error.message}`);
    }
}

/**
 * Reset form ke kondisi default.
 * @param {HTMLFormElement} formElement Elemen form
 * @param {HTMLInputElement} idInput Input hidden ID
 * @param {HTMLElement} submitBtn Tombol submit form
 * @param {HTMLElement} cancelBtn Tombol batal/ cancel
 */
export function resetForm(formElement, idInput, submitBtn, cancelBtn) {
    formElement.reset();
    idInput.value = '';
    submitBtn.textContent = `Tambah ${formElement.dataset.entity}`;
    cancelBtn.style.display = 'none';
}

/**
 * Membentuk URL gambar lengkap untuk ditampilkan di frontend.
 * Jika path sudah URL lengkap, return langsung.
 * Jika path relatif, tambahkan base URL.
 * @param {string} imagePath Path gambar dari API (relatif atau lengkap)
 * @returns {string} URL gambar lengkap
 */
export function getImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${BASE_URL_NO_API}${imagePath}`;
}
