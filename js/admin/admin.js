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
    const initializedTabs = new Set(); // Set untuk melacak tab yang sudah diinisialisasi

    // Fungsi async wrapper untuk init tab agar bisa handle error
    async function initTab(tabName) {
        // Cek apakah tab sudah diinisialisasi sebelumnya
        if (initializedTabs.has(tabName)) {
            console.log(`Tab ${tabName} sudah diinisialisasi. Melewati...`);
            return;
        }

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
            initializedTabs.add(tabName); // Tambahkan ke set setelah inisialisasi berhasil
        } catch (error) {
            console.error(`Error saat inisialisasi tab ${tabName}:`, error);
            showAlert(`Gagal memuat data ${tabName}`, 'error');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            // Hindari aksi default jika ada
            event.preventDefault();

            tabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            const targetTabName = tab.dataset.tab;
            const targetTabContent = document.getElementById(`${targetTabName}-tab`);
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            } else {
                console.warn(`Tab content with ID '${targetTabName}-tab' not found.`);
            }

            // Panggil fungsi inisialisasi tab
            initTab(targetTabName);
        });
    });

    // Trigger klik tab awal untuk load data
    const initialTab = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
    if (initialTab) {
        initialTab.click();
    }
});