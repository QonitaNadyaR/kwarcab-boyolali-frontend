// frontend/js/admin/pengurus.js
import { fetchData, sendData, deleteData, showAlert, resetForm } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const pengurusForm = document.getElementById('pengurusForm');
    const pengurusListBody = document.getElementById('pengurus-list');
    const pengurusIdInput = document.getElementById('pengurus-id');
    const pengurusNamaInput = document.getElementById('pengurus-nama');
    const pengurusJabatanInput = document.getElementById('pengurus-jabatan');
    const pengurusKontakInput = document.getElementById('pengurus-kontak');
    const pengurusSubmitBtn = document.getElementById('pengurus-submit-btn');
    const pengurusCancelBtn = document.getElementById('pengurus-cancel-btn');

    if (!pengurusForm) return; // Jika elemen form tidak ada, stop

    // === Fungsi untuk load data Pengurus ===
    async function loadPengurus() {
        pengurusListBody.innerHTML = '<tr><td colspan="4">Memuat data...</td></tr>';
        try {
            const pengurus = await fetchData('pengurus');
            renderPengurusList(pengurus);
        } catch (error) {
            console.error("Error memuat data pengurus:", error);
            pengurusListBody.innerHTML = '<tr><td colspan="4">Gagal memuat data.</td></tr>';
        }
    }

    // === Render daftar pengurus ke tabel ===
    function renderPengurusList(pengurus) {
        if (!pengurus || pengurus.length === 0) {
            pengurusListBody.innerHTML = '<tr><td colspan="4">Tidak ada data pengurus.</td></tr>';
            return;
        }

        pengurusListBody.innerHTML = pengurus.map(p => `
            <tr>
                <td>${p.nama}</td>
                <td>${p.jabatan}</td>
                <td>${p.kontak || '-'}</td>
                <td>
                    <button class="edit-btn" data-id="${p._id}">Edit</button>
                    <button class="delete-btn" data-id="${p._id}">Hapus</button>
                </td>
            </tr>
        `).join('');
    }

    // === Tambah / Edit Pengurus ===
    pengurusForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validasi input
        if (!pengurusNamaInput.value.trim()) {
            showAlert('Nama pengurus wajib diisi!', 'error');
            return;
        }
        if (!pengurusJabatanInput.value.trim()) {
            showAlert('Jabatan pengurus wajib diisi!', 'error');
            return;
        }

        const id = pengurusIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `pengurus/${id}` : 'pengurus';

        const pengurusData = {
            nama: pengurusNamaInput.value.trim(),
            jabatan: pengurusJabatanInput.value.trim(),
            kontak: pengurusKontakInput.value.trim()
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
    });

    // === Edit Pengurus ===
    async function editPengurus(id) {
        try {
            const pengurus = await fetchData(`pengurus/${id}`);
            pengurusIdInput.value = pengurus._id;
            pengurusNamaInput.value = pengurus.nama;
            pengurusJabatanInput.value = pengurus.jabatan;
            pengurusKontakInput.value = pengurus.kontak || '';
            pengurusSubmitBtn.textContent = "Update Pengurus";
            pengurusCancelBtn.style.display = "inline-block";
        } catch (error) {
            console.error("Error editing pengurus:", error);
            showAlert(`Gagal memuat data pengurus untuk diedit: ${error.message}`, 'error');
        }
    }

    // === Hapus Pengurus ===
    async function deletePengurus(id) {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            await deleteData(`pengurus/${id}`);
            showAlert('Data pengurus berhasil dihapus!', 'success');
            loadPengurus();
        } catch (error) {
            console.error("Error menghapus pengurus:", error);
            showAlert(`Gagal menghapus pengurus: ${error.message}`, 'error');
        }
    }

    // === Reset Form ===
    const resetPengurusForm = () => {
        resetForm(pengurusForm, pengurusIdInput, pengurusSubmitBtn, pengurusCancelBtn, "Tambah Pengurus");
    };

    pengurusCancelBtn.addEventListener('click', resetPengurusForm);

    // === Event Delegation khusus untuk tabel pengurus ===
    pengurusListBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) editPengurus(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deletePengurus(deleteBtn.dataset.id);
    });

    // Load data saat halaman dibuka
    loadPengurus();
});
