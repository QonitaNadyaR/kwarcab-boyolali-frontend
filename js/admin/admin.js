import { initWarta } from './warta.js';
import { initPengurus } from './pengurus.js';
import { initAnggota } from './anggota.js';
import { initDokumentasi } from './dokumentasi.js';
import { showAlert } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cek token auth, jika tidak ada langsung redirect login
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('authToken');
                showAlert('Anda berhasil logout!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }

    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Fungsi async wrapper untuk init tab agar bisa handle error
    async function initTab(tabName) {
        try {
            switch (tabName) {
                case 'warta':
                    await initWarta();
                    break;
                case 'pengurus':
                    await initPengurus();
                    break;
                case 'anggota':
                    await initAnggota();
                    break;
                case 'dokumentasi':
                    await initDokumentasi();
                    break;
                default:
                    console.warn(`No initialization function for tab: ${tabName}`);
            }
        } catch (error) {
            console.error(`Error saat inisialisasi tab ${tabName}:`, error);
            showAlert(`Gagal memuat data ${tabName}`, 'error');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            const targetTabContent = document.getElementById(`${tab.dataset.tab}-tab`);
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            } else {
                console.warn(`Tab content with ID '${tab.dataset.tab}-tab' not found.`);
            }

            initTab(tab.dataset.tab);
        });
    });

    // Trigger klik tab awal untuk load data
    const initialTab = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
    if (initialTab) {
        initialTab.click();
    }
});
