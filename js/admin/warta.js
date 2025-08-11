import { fetchData, sendData, deleteData, showAlert, resetForm, BASE_URL } from '../utils.js';

const wartaForm = document.getElementById('warta-form');
const wartaIdInput = document.getElementById('warta-id');
const wartaTitleInput = document.getElementById('warta-title');
const wartaImageInput = document.getElementById('warta-image');
const wartaContentInput = document.getElementById('warta-content');
const wartaSubmitBtn = document.getElementById('warta-submit-btn');
const wartaCancelBtn = document.getElementById('warta-cancel-btn');
const wartaListBody = document.getElementById('warta-list');
const wartaCurrentImagePreview = document.getElementById('warta-current-image-preview');
const wartaExistingImageUrlInput = document.getElementById('warta-existing-image-url');

export const initWarta = () => {
    if (!wartaForm) {
        console.warn("Warta form not found, skipping Warta initialization.");
        return;
    }
    wartaForm.dataset.entity = 'Warta'; 

    wartaForm.addEventListener('submit', handleWartaSubmit);
    wartaCancelBtn.addEventListener('click', () => {
        resetWartaForm();
        showAlert('Form Warta dibatalkan.', 'info');
    });

    loadWarta(); 
};

const loadWarta = async () => {
    wartaListBody.innerHTML = '<tr><td colspan="5">Memuat data warta...</td></tr>';
    try {
        const warta = await fetchData('warta');
        renderWartaList(warta);
    } catch (error) {
        console.error('Error loading warta:', error);
        wartaListBody.innerHTML = `<tr><td colspan="5">Gagal memuat data warta. ${error.message}</td></tr>`;
        showAlert(`Gagal memuat warta: ${error.message}`, 'error');
    }
};

const renderWartaList = (wartaArray) => {
    wartaListBody.innerHTML = '';
    if (wartaArray.length === 0) {
        wartaListBody.innerHTML = '<tr><td colspan="5">Tidak ada data warta.</td></tr>';
        return;
    }
    wartaArray.forEach(warta => {
        const row = wartaListBody.insertRow();
        row.dataset.id = warta.id;
        row.insertCell(0).textContent = warta.id;
        row.insertCell(1).textContent = warta.title;
        const imgCell = row.insertCell(2);
        if (warta.imageUrl) {
            const img = document.createElement('img');
            img.src = `/images/warta/${warta.imageUrl}`;
            img.alt = warta.title;
            img.style.maxWidth = '100px';
            img.style.height = 'auto';
            imgCell.appendChild(img);
        } else {
            imgCell.textContent = 'Tidak ada gambar';
        }
        row.insertCell(3).textContent = warta.content ? warta.content.substring(0, 100) + '...' : '';
        const actionsCell = row.insertCell(4);
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => editWarta(warta.id));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteWarta(warta.id));
        actionsCell.appendChild(deleteBtn);
    });
};

const handleWartaSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', wartaTitleInput.value);
    formData.append('content', wartaContentInput.value);

    // Logic untuk gambar:
    if (wartaImageInput.files[0]) {
        formData.append('image', wartaImageInput.files[0]);
    } else if (wartaIdInput.value) {
        if (wartaExistingImageUrlInput.value) {
            formData.append('imageUrl', wartaExistingImageUrlInput.value);
        } else {
            formData.append('removeImage', 'true');
        }
    } else {
        showAlert('Untuk penambahan warta baru, gambar wajib diunggah.', 'warning');
        return;
    }

    let url = 'warta';
    let method = 'POST';
    if (wartaIdInput.value) {
        url = `warta/${wartaIdInput.value}`;
        method = 'PUT';
    }

    try {
        const result = await sendData(url, method, formData, true); 
        showAlert(result.message || 'Warta berhasil disimpan!');
        resetWartaForm();
        loadWarta();
    } catch (error) {
        console.error('Error saving warta:', error);
        showAlert(`Gagal menyimpan warta: ${error.message}`, 'error');
    }
};

const editWarta = async (id) => {
    try {
        const warta = await fetchData(`warta/${id}`);

        wartaIdInput.value = warta.id;
        wartaTitleInput.value = warta.title;
        wartaContentInput.value = warta.content;
        wartaSubmitBtn.textContent = 'Update Warta';
        wartaCancelBtn.style.display = 'inline-block';

        wartaImageInput.value = ''; 

        wartaCurrentImagePreview.innerHTML = '';
        if (warta.imageUrl) {
            wartaExistingImageUrlInput.value = warta.imageUrl;
            const img = document.createElement('img');
            img.src = `/images/warta/${warta.imageUrl}`;
            img.alt = 'Current Image';
            img.style.maxWidth = '200px';
            img.style.marginTop = '10px';
            wartaCurrentImagePreview.appendChild(img);

            const removeCheckbox = document.createElement('input');
            removeCheckbox.type = 'checkbox';
            removeCheckbox.id = 'warta-remove-image';
            removeCheckbox.style.marginLeft = '10px';
            const removeLabel = document.createElement('label');
            removeLabel.htmlFor = 'warta-remove-image';
            removeLabel.textContent = ' Hapus Gambar Ini';
            wartaCurrentImagePreview.appendChild(removeCheckbox);
            wartaCurrentImagePreview.appendChild(removeLabel);

            removeCheckbox.addEventListener('change', () => {
                if (removeCheckbox.checked) {
                    wartaExistingImageUrlInput.value = '';
                } else {
                    wartaExistingImageUrlInput.value = warta.imageUrl;
                }
            });
        } else {
            wartaExistingImageUrlInput.value = '';
        }
        wartaForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing warta:', error);
        showAlert(`Gagal memuat data warta untuk diedit: ${error.message}`, 'error');
    }
};

const deleteWarta = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus warta ini?')) {
        return;
    }
    try {
        const result = await deleteData('warta', id);
        showAlert(result.message || 'Warta berhasil dihapus!');
        loadWarta();
    } catch (error) {
        console.error('Error deleting warta:', error);
        showAlert(`Gagal menghapus warta: ${error.message}`, 'error');
    }
};

const resetWartaForm = () => {
    resetForm(wartaForm, wartaIdInput, wartaSubmitBtn, wartaCancelBtn);
    wartaCurrentImagePreview.innerHTML = '';
    wartaExistingImageUrlInput.value = '';
    if (document.getElementById('warta-remove-image')) {
        document.getElementById('warta-remove-image').checked = false;
    }
};