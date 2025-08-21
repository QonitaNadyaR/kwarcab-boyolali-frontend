// frontend/js/admin/anggota.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';
import { showConfirmationModal } from './confirm-modal.js';

const anggotaForm = document.getElementById('anggota-form');
const anggotaIdInput = document.getElementById('anggota-id');
const anggotaNoRegInput = document.getElementById('anggota-no-reg');
const anggotaNamaInput = document.getElementById('anggota-nama');
const anggotaPangkalanInput = document.getElementById('anggota-pangkalan');
const anggotaTtlInput = document.getElementById('anggota-ttl');
const anggotaKwartirRantingInput = document.getElementById('anggota-kwartir-ranting');
const anggotaGolonganAnggotaInput = document.getElementById('anggota-golongan-anggota');
const anggotaTahunInput = document.getElementById('anggota-tahun');
const anggotaSubmitBtn = document.getElementById('anggota-submit-btn');
const anggotaCancelBtn = document.getElementById('anggota-cancel-btn');
const anggotaListBody = document.getElementById('anggota-list');

export const initAnggota = () => {
    if (!anggotaForm) {
        console.warn("Anggota form not found, skipping Anggota initialization.");
        return;
    }

    anggotaForm.dataset.entity = 'Anggota';

    anggotaForm.addEventListener('submit', handleAnggotaSubmit);
    anggotaCancelBtn.addEventListener('click', () => {
        resetAnggotaForm();
        showAlert('Form Anggota dibatalkan.', 'info');
    });

    anggotaListBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) editAnggota(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deleteAnggota(deleteBtn.dataset.id);
    });

    loadAnggota();
};

const loadAnggota = async () => {
    anggotaListBody.innerHTML = '<tr><td colspan="9">Memuat data anggota...</td></tr>';
    try {
        const anggota = await fetchData('anggota');
        renderAnggotaList(anggota);
    } catch (error) {
        console.error('Error loading anggota:', error);
        anggotaListBody.innerHTML = `<tr><td colspan="9">Gagal memuat data anggota: ${error.message}</td></tr>`;
        showAlert(`Gagal memuat anggota: ${error.message}`, 'error');
    }
};

const renderAnggotaList = (anggotaArray) => {
    if (!anggotaArray || anggotaArray.length === 0) {
        anggotaListBody.innerHTML = '<tr><td colspan="9">Tidak ada data anggota.</td></tr>';
        return;
    }

    anggotaListBody.innerHTML = anggotaArray.map((anggota, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${anggota.no_reg || ''}</td>
            <td>${anggota.nama || ''}</td>
            <td>${anggota.pangkalan || ''}</td>
            <td>${anggota.ttl || ''}</td>
            <td>${anggota.kwartir_ranting || ''}</td>
            <td>${anggota.golongan_anggota || ''}</td>
            <td>${anggota.tahun || ''}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${anggota._id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${anggota._id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
};

const handleAnggotaSubmit = async (e) => {
    e.preventDefault();
    if (!anggotaNoRegInput.value.trim()) {
        showAlert('Nomor registrasi wajib diisi!', 'error');
        return;
    }
    if (!anggotaNamaInput.value.trim()) {
        showAlert('Nama anggota wajib diisi!', 'error');
        return;
    }

    const data = {
        no_reg: anggotaNoRegInput.value.trim(),
        nama: anggotaNamaInput.value.trim(),
        pangkalan: anggotaPangkalanInput.value.trim(),
        ttl: anggotaTtlInput.value.trim(),
        kwartir_ranting: anggotaKwartirRantingInput.value.trim(),
        golongan_anggota: anggotaGolonganAnggotaInput.value.trim(),
        tahun: parseInt(anggotaTahunInput.value) || null,
    };

    let url = 'anggota';
    let method = 'POST';
    if (anggotaIdInput.value) {
        url = `anggota/${anggotaIdInput.value}`;
        method = 'PUT';
    }

    try {
        await sendData(url, method, data);
        showAlert(`Data anggota berhasil ${anggotaIdInput.value ? 'diperbarui' : 'disimpan'}!`, 'success');
        resetAnggotaForm();
        loadAnggota();
    } catch (error) {
        console.error('Error saving anggota:', error);
        showAlert(`Gagal menyimpan data anggota: ${error.message}`, 'error');
    }
};

const editAnggota = async (id) => {
    try {
        const anggota = await fetchData(`anggota/${id}`);
        anggotaIdInput.value = anggota._id;
        anggotaNoRegInput.value = anggota.no_reg || '';
        anggotaNamaInput.value = anggota.nama || '';
        anggotaPangkalanInput.value = anggota.pangkalan || '';
        anggotaTtlInput.value = anggota.ttl || '';
        anggotaKwartirRantingInput.value = anggota.kwartir_ranting || '';
        anggotaGolonganAnggotaInput.value = anggota.golongan_anggota || '';
        anggotaTahunInput.value = anggota.tahun || '';

        anggotaSubmitBtn.textContent = 'Update Anggota';
        anggotaCancelBtn.style.display = 'inline-block';
        anggotaForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing anggota:', error);
        showAlert(`Gagal memuat data anggota untuk diedit: ${error.message}`, 'error');
    }
};

const deleteAnggota = async (id) => {
    if (!id) return;
    const isConfirmed = await showConfirmationModal('Apakah Anda yakin ingin menghapus data anggota ini?');
    if (!isConfirmed) return;

    try {
        await deleteData('anggota', id);
        showAlert('Data anggota berhasil dihapus!', 'success');
        loadAnggota();
    } catch (error) {
        console.error('Error deleting anggota:', error);
        showAlert(`Gagal menghapus data anggota: ${error.message}`, 'error');
    }
};

const resetAnggotaForm = () => {
    resetForm(anggotaForm, anggotaIdInput, anggotaSubmitBtn, anggotaCancelBtn, "Tambah Anggota");
};