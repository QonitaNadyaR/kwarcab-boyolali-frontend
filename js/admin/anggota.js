// frontend/js/admin/anggota.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';

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

    loadAnggota();

    // Event listener yang lebih solid
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            if (id) {
                editAnggota(id);
            } else {
                console.error("ID anggota tidak ditemukan pada tombol edit.");
                showAlert("ID anggota tidak valid.", 'error');
            }
        }

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (id) {
                deleteAnggota(id);
            } else {
                console.error("ID anggota tidak ditemukan pada tombol hapus.");
                showAlert("ID anggota tidak valid.", 'error');
            }
        }
    });
};

const resetAnggotaForm = () => {
    resetForm(anggotaForm, anggotaIdInput, anggotaSubmitBtn, anggotaCancelBtn);
};