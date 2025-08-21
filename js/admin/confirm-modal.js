// frontend/js/admin/confirm-modal.js

const modal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const confirmBtn = document.getElementById('modal-confirm-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');
const closeBtn = document.querySelector('.close-btn');

let resolvePromise;

export const showConfirmationModal = (message) => {
    return new Promise((resolve) => {
        resolvePromise = resolve;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    });
};

const hideModal = () => {
    modal.style.display = 'none';
};

confirmBtn.addEventListener('click', () => {
    hideModal();
    resolvePromise(true);
});

cancelBtn.addEventListener('click', () => {
    hideModal();
    resolvePromise(false);
});

closeBtn.addEventListener('click', () => {
    hideModal();
    resolvePromise(false);
});

// Tutup modal jika user klik di luar area modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
        resolvePromise(false);
    }
});