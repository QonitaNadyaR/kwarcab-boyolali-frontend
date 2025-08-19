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

    // Event listener baru yang memeriksa ID sebelum memanggil fungsi
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

const loadAnggota = async () => {
    anggotaListBody.innerHTML = '<tr><td colspan="9">Memuat data anggota...</td></tr>';
    try {
        const anggota = await fetchData('anggota');
        renderAnggotaList(anggota);
    } catch (error) {
        console.error('Error loading anggota:', error);
        anggotaListBody.innerHTML = `<tr><td colspan="9">Gagal memuat data anggota. ${error.message}</td></tr>`;
        showAlert(`Gagal memuat anggota: ${error.message}`, 'error');
    }
};

const renderAnggotaList = (anggotaArray) => {
    anggotaListBody.innerHTML = '';
    if (anggotaArray.length === 0) {
        anggotaListBody.innerHTML = '<tr><td colspan="9">Tidak ada data anggota.</td></tr>';
        return;
    }
    anggotaArray.forEach(anggota => {
        const row = anggotaListBody.insertRow();
        row.dataset.id = anggota.id;
        row.insertCell(0).textContent = anggota.id;
        row.insertCell(1).textContent = anggota.no_reg;
        row.insertCell(2).textContent = anggota.nama;
        row.insertCell(3).textContent = anggota.pangkalan;
        row.insertCell(4).textContent = anggota.ttl;
        row.insertCell(5).textContent = anggota.kwartir_ranting;
        row.insertCell(6).textContent = anggota.golongan_anggota;
        row.insertCell(7).textContent = anggota.tahun;
        const actionsCell = row.insertCell(8);
        actionsCell.classList.add('action-buttons');
        actionsCell.innerHTML = `
            <button class="edit-btn" data-id="${anggota.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-id="${anggota.id}"><i class="fas fa-trash-alt"></i></button>
        `;
    });
};

const handleAnggotaSubmit = async (e) => {
    e.preventDefault();
    const data = {
        no_reg: anggotaNoRegInput.value,
        nama: anggotaNamaInput.value,
        pangkalan: anggotaPangkalanInput.value,
        ttl: anggotaTtlInput.value,
        kwartir_ranting: anggotaKwartirRantingInput.value,
        golongan_anggota: anggotaGolonganAnggotaInput.value,
        tahun: parseInt(anggotaTahunInput.value),
    };

    let url = 'anggota';
    let method = 'POST';

    if (anggotaIdInput.value) {
        url = `anggota/${anggotaIdInput.value}`;
        method = 'PUT';
    }

    try {
        const result = await sendData(url, method, data, false);
        showAlert(result.message || 'Data anggota berhasil disimpan!');
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

        anggotaIdInput.value = anggota.id;
        anggotaNoRegInput.value = anggota.no_reg;
        anggotaNamaInput.value = anggota.nama;
        anggotaPangkalanInput.value = anggota.pangkalan;
        anggotaTtlInput.value = anggota.ttl;
        anggotaKwartirRantingInput.value = anggota.kwartir_ranting;
        anggotaGolonganAnggotaInput.value = anggota.golongan_anggota;
        anggotaTahunInput.value = anggota.tahun;
        anggotaSubmitBtn.textContent = 'Update Anggota';
        anggotaCancelBtn.style.display = 'inline-block';

        anggotaForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing anggota:', error);
        showAlert(`Gagal memuat data anggota untuk diedit: ${error.message}`, 'error');
    }
};

const deleteAnggota = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
        return;
    }
    try {
        const result = await deleteData('anggota', id);
        showAlert(result.message || 'Data anggota berhasil dihapus!');
        loadAnggota();
    } catch (error) {
        console.error('Error deleting anggota:', error);
        showAlert(`Gagal menghapus data anggota: ${error.message}`, 'error');
    }
};

const resetAnggotaForm = () => {
    resetForm(anggotaForm, anggotaIdInput, anggotaSubmitBtn, anggotaCancelBtn);
};