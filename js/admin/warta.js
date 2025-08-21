// frontend/js/admin/warta.js
import { fetchData, sendData, deleteData, resetForm, showAlert, getImageUrl } from '../utils.js';

export function initWarta() {
    const formWarta = document.getElementById('warta-form');
    const idWartaInput = document.getElementById('warta-id');
    const titleInput = document.getElementById('warta-title');
    const contentInput = document.getElementById('warta-content');
    const imageInput = document.getElementById('warta-image');
    const currentImagePreview = document.getElementById('warta-current-image-preview');
    const existingImageUrlInput = document.getElementById('warta-existing-image-url');
    const btnSubmit = document.getElementById('warta-submit-btn');
    const btnCancel = document.getElementById('warta-cancel-btn');
    const tableWartaBody = document.getElementById('warta-list');

    loadWarta();

    async function loadWarta() {
        try {
            const data = await fetchData('warta');
            renderTable(data);
        } catch (error) {
            console.error(error);
            tableWartaBody.innerHTML = '<tr><td colspan="5">Gagal memuat data</td></tr>';
        }
    }

    function renderTable(data) {
        tableWartaBody.innerHTML = '';
        if (!data || data.length === 0) {
            tableWartaBody.innerHTML = '<tr><td colspan="5">Belum ada data</td></tr>';
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item._id}</td>
                <td>${item.title}</td>
                <td><img src="${getImageUrl(item.imageUrl)}" alt="${item.title}" style="max-width:80px;"></td>
                <td>${item.content.substring(0, 50)}...</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${item._id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${item._id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableWartaBody.appendChild(tr);
        });
    }

    // Menggunakan event delegation pada tabel utama
    tableWartaBody.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const id = editBtn.dataset.id;
            try {
                const selected = await fetchData(`warta/${id}`);
                idWartaInput.value = selected._id;
                titleInput.value = selected.title;
                contentInput.value = selected.content;
                currentImagePreview.innerHTML = `<img src="${getImageUrl(selected.imageUrl)}" alt="Gambar saat ini" style="max-width: 150px; margin-bottom: 10px;">`;
                existingImageUrlInput.value = selected.imageUrl;
                imageInput.value = '';
                btnSubmit.textContent = 'Update Warta';
                btnCancel.style.display = 'inline-block';
            } catch (error) {
                showAlert(`Gagal memuat data warta: ${error.message}`, 'error');
            }
        }

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            // Tambahkan konfirmasi
            if (window.confirm('Yakin ingin menghapus warta ini?')) {
                try {
                    await deleteData('warta', id);
                    showAlert('Warta berhasil dihapus', 'success');
                    loadWarta();
                } catch (error) {
                    showAlert(error.message, 'error');
                }
            }
        }
    });

    formWarta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', titleInput.value.trim());
        formData.append('content', contentInput.value.trim());

        const imageFile = imageInput.files[0];
        const existingImageUrl = existingImageUrlInput.value;

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (existingImageUrl) {
            formData.append('imageUrl', existingImageUrl);
        } else {
            showAlert('Gambar warta wajib diunggah', 'warning');
            return;
        }

        const id = idWartaInput.value;
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `warta/${id}` : 'warta';

        try {
            await sendData(endpoint, method, formData, true);
            showAlert(`Warta berhasil ${id ? 'diperbarui' : 'ditambahkan'}`, 'success');
            resetWartaForm();
            loadWarta();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });

    btnCancel.addEventListener('click', () => {
        resetWartaForm();
        showAlert('Form Warta dibatalkan.', 'info');
    });


    function resetWartaForm() {
        formWarta.reset();
        idWartaInput.value = '';
        currentImagePreview.innerHTML = '';
        existingImageUrlInput.value = '';
        btnSubmit.textContent = 'Tambah Warta';
        btnCancel.style.display = 'none';
    }
}