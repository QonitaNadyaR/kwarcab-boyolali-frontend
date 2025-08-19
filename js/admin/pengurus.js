// frontend/js/admin/pengurus.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';

const pengurusForm = document.getElementById('pengurus-form');
const pengurusIdInput = document.getElementById('pengurus-id');
const pengurusNamaInput = document.getElementById('pengurus-nama');
const pengurusLulusanInput = document.getElementById('pengurus-lulusan');
const pengurusKwarranInput = document.getElementById('pengurus-kwartir-ranting');
const pengurusGolonganInput = document.getElementById('pengurus-golongan-pelatih');
const pengurusSubmitBtn = document.getElementById('pengurus-submit-btn');
const pengurusCancelBtn = document.getElementById('pengurus-cancel-btn');
const pengurusListBody = document.getElementById('pengurus-list');

export const initPengurus = () => {
    if (!pengurusForm) {
        console.warn("Pengurus form not found, skipping Pengurus initialization.");
        return;
    }

    pengurusForm.dataset.entity = 'Pengurus';

    pengurusForm.addEventListener('submit', handlePengurusSubmit);
    pengurusCancelBtn.addEventListener('click', () => {
        resetPengurusForm();
        showAlert('Form Pengurus dibatalkan.', 'info');
    });

    // Event delegation
    pengurusListBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) editPengurus(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deletePengurus(deleteBtn.dataset.id);
    });

    loadPengurus();
};

// === Load Data ===
const loadPengurus = async () => {
    pengurusListBody.innerHTML = '<tr><td colspan="6">Memuat data pengurus...</td></tr>';
    try {
        const pengurusArray = await fetchData('pengurus');
        renderPengurusList(pengurusArray);
    } catch (error) {
        console.error('Error loading pengurus:', error);
        pengurusListBody.innerHTML = `<tr><td colspan="6">Gagal memuat data pengurus: ${error.message}</td></tr>`;
        showAlert(`Gagal memuat pengurus: ${error.message}`, 'error');
    }
};

// === Render ===
const renderPengurusList = (pengurusArray) => {
    if (!pengurusArray || pengurusArray.length === 0) {
        pengurusListBody.innerHTML = '<tr><td colspan="6">Tidak ada data pengurus.</td></tr>';
        return;
    }

    pengurusListBody.innerHTML = pengurusArray.map((p, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${p.nama || ''}</td>
            <td>${p.lulusan || ''}</td>
            <td>${p.kwartir_ranting || ''}</td>
            <td>${p.golongan_pelatih || ''}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${p._id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${p._id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
};

// === Submit ===
const handlePengurusSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!pengurusNamaInput.value.trim()) {
        showAlert('Nama pengurus wajib diisi!', 'error');
        return;
    }
    if (!pengurusKwarranInput.value.trim()) {
        showAlert('Kwartir Ranting wajib dipilih!', 'error');
        return;
    }
    if (!pengurusGolonganInput.value.trim()) {
        showAlert('Golongan Pelatih wajib dipilih!', 'error');
        return;
    }

    const data = {
        nama: pengurusNamaInput.value.trim(),
        lulusan: pengurusLulusanInput.value.trim(),
        kwartirRanting: pengurusKwarranInput.value.trim(),
        golonganPelatih: pengurusGolonganInput.value.trim(),
    };

    let url = 'pengurus';
    let method = 'POST';
    if (pengurusIdInput.value) {
        url = `pengurus/${pengurusIdInput.value}`;
        method = 'PUT';
    }

    try {
        await sendData(url, method, data);
        showAlert(`Data pengurus berhasil ${pengurusIdInput.value ? 'diperbarui' : 'disimpan'}!`, 'success');
        resetPengurusForm();
        loadPengurus();
    } catch (error) {
        console.error('Error saving pengurus:', error);
        showAlert(`Gagal menyimpan data pengurus: ${error.message}`, 'error');
    }
};

// === Edit ===
const editPengurus = async (id) => {
    try {
        const pengurus = await fetchData(`pengurus/${id}`);
        pengurusIdInput.value = pengurus._id;
        pengurusNamaInput.value = pengurus.nama || '';
        pengurusLulusanInput.value = pengurus.lulusan || '';
        pengurusKwarranInput.value = pengurus.kwartirRanting || '';
        pengurusGolonganInput.value = pengurus.golonganPelatih || '';

        pengurusSubmitBtn.textContent = 'Update Pengurus';
        pengurusCancelBtn.style.display = 'inline-block';
        pengurusForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing pengurus:', error);
        showAlert(`Gagal memuat data pengurus untuk diedit: ${error.message}`, 'error');
    }
};

// === Delete ===
const deletePengurus = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pengurus ini?')) return;
    try {
        await deleteData(`pengurus/${id}`);
        showAlert('Data pengurus berhasil dihapus!', 'success');
        loadPengurus();
    } catch (error) {
        console.error('Error deleting pengurus:', error);
        showAlert(`Gagal menghapus data pengurus: ${error.message}`, 'error');
    }
};

// === Reset Form ===
const resetPengurusForm = () => {
    resetForm(pengurusForm, pengurusIdInput, pengurusSubmitBtn, pengurusCancelBtn, "Tambah Pengurus");
};
