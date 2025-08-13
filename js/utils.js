let API_BASE_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_BASE_URL = 'http://localhost:4000';
} else {
    API_BASE_URL = 'https://kwarcab-boyolali-backend-nes7-git-main-qonitanadyars-projects.vercel.app';
}

export const BASE_URL = API_BASE_URL;

/**
 * Menampilkan notifikasi sederhana.
 */
export function showAlert(message, type = 'success') {
    alert(`[${type.toUpperCase()}] ${message}`);
    console.log(`Alert (${type}): ${message}`);
}

/**
 * Fetch dengan header otentikasi.
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
 * GET data dari API.
 */
export async function fetchData(endpoint) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/api/${endpoint}`);
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
 * POST / PUT data ke API.
 */
export async function sendData(endpoint, method, data, isFormData = false) {
    const authToken = localStorage.getItem('authToken');
    const headers = {
        'Authorization': `Bearer ${authToken}`
    };

    // Jika data bukan FormData, tambahkan Content-Type 'application/json'
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method: method,
        headers: headers,
        body: isFormData ? data : JSON.stringify(data)
    };

    // Ganti API_URL dengan BASE_URL dan tambahkan /api/
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, options);
    if (!response.ok) {
        // Mengambil respons error dari server
        const errorData = await response.json();
        throw new Error(`Gagal menyimpan data: Server merespons dengan status ${response.status}. Respons: ${JSON.stringify(errorData)}`);
    }
    return await response.json();
}

/**
 * DELETE data di API.
 */
export async function deleteData(endpoint, id, queryParams = '') {
    try {
        const url = queryParams
            ? `${BASE_URL}/api/${endpoint}/${id}?${queryParams}`
            : `${BASE_URL}/api/${endpoint}/${id}`;

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
 */
export function resetForm(formElement, idInput, submitBtn, cancelBtn) {
    formElement.reset();
    idInput.value = '';
    submitBtn.textContent = `Tambah ${formElement.dataset.entity}`;
    cancelBtn.style.display = 'none';
}
