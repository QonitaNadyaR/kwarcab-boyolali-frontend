export const BASE_URL = 'https://kwarcab-boyolali-backend-nes7-git-main-qonitanadyars-projects.vercel.app';

/**
 * Menampilkan notifikasi sederhana.
 * @param {string} message Pesan yang akan ditampilkan.
 * @param {'success'|'error'|'info'|'warning'} type Tipe pesan.
 */
export function showAlert(message, type = 'success') {
    alert(`[${type.toUpperCase()}] ${message}`);
    console.log(`Alert (${type}): ${message}`);
}

/**
 * Fetch dengan header otentikasi. 
 * Redirect ke login jika token tidak ada.
 * @param {string} url URL lengkap/relatif.
 * @param {object} options Opsi fetch.
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

export async function fetchData(endpoint) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/${endpoint}`);
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

export async function sendData(endpoint, method, data, isFormData = false) {
    const options = { method };
    if (isFormData) {
        options.body = data;
    } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetchWithAuth(`${BASE_URL}/${endpoint}`, options);
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
        console.error(`Error sending data to ${endpoint}:`, error);
        throw new Error(`Gagal menyimpan data: ${error.message}`);
    }
}

export async function deleteData(endpoint, id, queryParams = '') {
    try {
        const url = queryParams
            ? `${BASE_URL}/${endpoint}/${id}?${queryParams}`
            : `${BASE_URL}/${endpoint}/${id}`;

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

export function resetForm(formElement, idInput, submitBtn, cancelBtn) {
    formElement.reset();
    idInput.value = '';
    submitBtn.textContent = `Tambah ${formElement.dataset.entity}`;
    cancelBtn.style.display = 'none';
}
