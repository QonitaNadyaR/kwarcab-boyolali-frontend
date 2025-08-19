// frontend/js/admin/pengurus.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';

const pengurusForm = document.getElementById('pengurus-form');
const pengurusIdInput = document.getElementById('pengurus-id');
const pengurusNamaInput = document.getElementById('pengurus-nama');
const pengurusLulusanInput = document.getElementById('pengurus-lulusan');
const pengurusKwartirRantingInput = document.getElementById('pengurus-kwartir-ranting');
const pengurusGolonganPelatihInput = document.getElementById('pengurus-golongan-pelatih');
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

    loadPengurus();

    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) editPengurus(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deletePengurus(deleteBtn.dataset.id);
    });
};

const loadPengurus = async () => {
    pengurusListBody.innerHTML = '<tr><td colspan="6">Memuat data pengurus...</td></tr>';
    try {
        const pengurus = await fetchData('pengurus');
        renderPengurusList(pengurus);
    } catch (error) {
        console.error('Error loading pengurus:', error);
        pengurusListBody.innerHTML = `<tr><td colspan="6">Gagal memuat data pengurus. ${error.message}</td></tr>`;
        showAlert(`Gagal memuat pengurus: ${error.message}`, 'error');
    }
};

const renderPengurusList = (pengurusArray) => {
    pengurusListBody.innerHTML = '';
    if (!pengurusArray.length) {
        pengurusListBody.innerHTML = '<tr><td colspan="6">Tidak ada data pengurus.</td></tr>';
        return;
    }
    pengurusArray.forEach((pengurus, index) => {
        const row = pengurusListBody.insertRow();
        row.dataset.id = pengurus._id;

        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = pengurus.nama || '';
        row.insertCell(2).textContent = pengurus.lulusan || '';
        row.insertCell(3).textContent = pengurus.kwartir_ranting || '';
        row.insertCell(4).textContent = pengurus.golongan_pelatih || '';

        const actionsCell = row.insertCell(5);
        actionsCell.classList.add('action-buttons');
        actionsCell.innerHTML = `
            <button class="edit-btn" data-id="${pengurus._id}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-id="${pengurus._id}"><i class="fas fa-trash-alt"></i></button>
        `;
    });
};

const handlePengurusSubmit = async (e) => {
    e.preventDefault();
    const data = {
        nama: pengurusNamaInput.value,
        lulusan: pengurusLulusanInput.value,
        kwartir_ranting: pengurusKwartirRantingInput.value,
        golongan_pelatih: pengurusGolonganPelatihInput.value,
    };

    let url = 'pengurus';
    let method = 'POST';

    if (pengurusIdInput.value) {
        url = `pengurus/${pengurusIdInput.value}`;
        method = 'PUT';
    }

    try {
        const result = await sendData(url, method, data, false);
        showAlert(result.message || 'Data pengurus berhasil disimpan!');
        resetPengurusForm();
        loadPengurus();
    } catch (error) {
        console.error('Error saving pengurus:', error);
        showAlert(`Gagal menyimpan data pengurus: ${error.message}`, 'error');
    }
};

const editPengurus = async (id) => {
    if (!id) return;
    try {
        const pengurus = await fetchData(`pengurus/${id}`);

        pengurusIdInput.value = pengurus._id;
        pengurusNamaInput.value = pengurus.nama || '';
        pengurusLulusanInput.value = pengurus.lulusan || '';
        pengurusKwartirRantingInput.value = pengurus.kwartir_ranting || '';
        pengurusGolonganPelatihInput.value = pengurus.golongan_pelatih || '';

        pengurusSubmitBtn.textContent = 'Update Pengurus';
        pengurusCancelBtn.style.display = 'inline-block';
        pengurusForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing pengurus:', error);
        showAlert(`Gagal memuat data pengurus untuk diedit: ${error.message}`, 'error');
    }
};

const deletePengurus = async (id) => {
    if (!id || !confirm('Apakah Anda yakin ingin menghapus data pengurus ini?')) return;
    try {
        const result = await deleteData('pengurus', id);
        showAlert(result.message || 'Data pengurus berhasil dihapus!');
        loadPengurus();
    } catch (error) {
        console.error('Error deleting pengurus:', error);
        showAlert(`Gagal menghapus data pengurus: ${error.message}`, 'error');
    }
};

const resetPengurusForm = () => {
    resetForm(pengurusForm, pengurusIdInput, pengurusSubmitBtn, pengurusCancelBtn);
};
