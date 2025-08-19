// frontend/js/admin/pengurus.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';

const pengurusForm = document.getElementById('pengurus-form');
const pengurusListBody = document.getElementById('pengurus-list');
const pengurusIdInput = document.getElementById('pengurus-id');
const pengurusNamaInput = document.getElementById('pengurus-nama');
const pengurusLulusanInput = document.getElementById('pengurus-lulusan');
const pengurusKwarranInput = document.getElementById('pengurus-kwartir-ranting');
const pengurusGolonganInput = document.getElementById('pengurus-golongan-pelatih');
const pengurusSubmitBtn = document.getElementById('pengurus-submit-btn');
const pengurusCancelBtn = document.getElementById('pengurus-cancel-btn');

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

    pengurusListBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) editPengurus(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deletePengurus(deleteBtn.dataset.id);
    });

    loadPengurus();
};

// === Load Data Pengurus ===
const loadPengurus = async () => {
    pengurusListBody.innerHTML = '<tr><td colspan="6">Memuat data...</td></tr>';
    try {
        const pengurus = await fetchData('pengurus');
        renderPengurusList(pengurus);
    } catch (error) {
        console.error("Error memuat data pengurus:", error);
        pengurusListBody.innerHTML = `<tr><td colspan="6">Gagal memuat data pengurus: ${error.message}</td></tr>`;
        showAlert(`Gagal memuat pengurus: ${error.message}`, 'error');
    }
};

// === Render daftar ke tabel ===
const renderPengurusList = (pengurus) => {
    if (!pengurus || pengurus.length === 0) {
        pengurusListBody.innerHTML = '<tr><td colspan="6">Tidak ada data pengurus.</td></tr>';
        return;
    }

    pengurusListBody.innerHTML = pengurus.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${p.nama}</td>
            <td>${p.lulusan || '-'}</td>
            <td>${p.kwartirRanting || '-'}</td>
            <td>${p.golonganPelatih || '-'}</td>
            <td>
                <button class="edit-btn" data-id="${p._id}">Edit</button>
                <button class="delete-btn" data-id="${p._id}">Hapus</button>
            </td>
        </tr>
    `).join('');
};

// === Submit Handler ===
const handlePengurusSubmit = async (e) => {
    e.preventDefault();

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

    const id = pengurusIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `pengurus/${id}` : 'pengurus';

    const pengurusData = {
        nama: pengurusNamaInput.value.trim(),
        lulusan: pengurusLulusanInput.value.trim(),
        kwartirRanting: pengurusKwarranInput.value,
        golonganPelatih: pengurusGolonganInput.value
    };

    try {
        await sendData(endpoint, method, pengurusData);
        showAlert(`Data pengurus berhasil ${id ? 'diperbarui' : 'disimpan'}!`, 'success');
        resetPengurusForm();
        loadPengurus();
    } catch (error) {
        console.error("Error saat menyimpan pengurus:", error);
        showAlert(`Gagal menyimpan pengurus: ${error.message}`, 'error');
    }
};

// === Edit ===
const editPengurus = async (id) => {
    try {
        const pengurus = await fetchData(`pengurus/${id}`);
        pengurusIdInput.value = pengurus._id;
        pengurusNamaInput.value = pengurus.nama;
        pengurusLulusanInput.value = pengurus.lulusan || '';
        pengurusKwarranInput.value = pengurus.kwartirRanting || '';
        pengurusGolonganInput.value = pengurus.golonganPelatih || '';
        pengurusSubmitBtn.textContent = "Update Pengurus";
        pengurusCancelBtn.style.display = "inline-block";
        pengurusForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Error editing pengurus:", error);
        showAlert(`Gagal memuat data pengurus untuk diedit: ${error.message}`, 'error');
    }
};

// === Hapus ===
const deletePengurus = async (id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
        await deleteData(`pengurus/${id}`);
        showAlert('Data pengurus berhasil dihapus!', 'success');
        loadPengurus();
    } catch (error) {
        console.error("Error menghapus pengurus:", error);
        showAlert(`Gagal menghapus pengurus: ${error.message}`, 'error');
    }
};

// === Reset Form ===
const resetPengurusForm = () => {
    resetForm(pengurusForm, pengurusIdInput, pengurusSubmitBtn, pengurusCancelBtn, "Tambah Pengurus");
};
