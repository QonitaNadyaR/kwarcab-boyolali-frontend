import { initWarta } from './warta.js';
import { initPengurus } from './pengurus.js';
import { initAnggota } from './anggota.js';
import { initDokumentasi } from './dokumentasi.js';
import { showAlert } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
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

            // Load data based on active tab
            switch (tab.dataset.tab) {
                case 'warta':
                    initWarta();
                    break;
                case 'pengurus':
                    initPengurus();
                    break;
                case 'anggota':
                    initAnggota();
                    break;
                case 'dokumentasi':
                    initDokumentasi();
                    break;
                default:
                    console.warn(`No initialization function for tab: ${tab.dataset.tab}`);
            }
        });
    });

    const initialTab = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
    if (initialTab) {
        initialTab.click();
    }
});