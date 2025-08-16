document.addEventListener('DOMContentLoaded', () => {

    // Tentukan URL backend secara dinamis
    const API_BASE_URL =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:4000'
            : 'https://kwarcab-backend.vercel.app';

    function formatDateForTable(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const pengurusTableBody = document.getElementById('pengurus-data');
    if (pengurusTableBody) {
        // Gunakan API_BASE_URL yang dinamis
        fetch(`${API_BASE_URL}/api/pengurus`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                pengurusTableBody.innerHTML = '';
                if (data && data.length > 0) {
                    data.forEach((pengurus, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${pengurus.nama || ''}</td>
                            <td>${pengurus.lulusan || ''}</td>
                            <td>${pengurus.kwartir_ranting || ''}</td>
                            <td>${pengurus.golongan_pelatih || ''}</td>
                        `;
                        pengurusTableBody.appendChild(row);
                    });
                } else {
                    pengurusTableBody.innerHTML = '<tr><td colspan="5">Tidak ada data pengurus yang tersedia.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error memuat data pengurus:', error);
                pengurusTableBody.innerHTML = '<tr><td colspan="5">Gagal memuat data pengurus. Pastikan server berjalan dan API benar.</td></tr>';
            });
    }

    const anggotaTableBody = document.getElementById('anggota-data');
    if (anggotaTableBody) {
        // Gunakan API_BASE_URL yang dinamis
        fetch(`${API_BASE_URL}/api/anggota`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                anggotaTableBody.innerHTML = '';
                if (data && data.length > 0) {
                    const anggotaNonPengurus = data.filter(item => item.golongan_anggota !== 'Pengurus');

                    if (anggotaNonPengurus.length > 0) {
                        anggotaNonPengurus.forEach((anggota, index) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${anggota.no_reg || ''}</td>
                                <td>${anggota.nama || ''}</td>
                                <td>${anggota.pangkalan || ''}</td>
                                <td>${anggota.ttl || ''}</td>
                                <td>${anggota.kwartir_ranting || ''}</td>
                                <td>${anggota.golongan_anggota || ''}</td>
                                <td>${anggota.tahun || ''}</td> `;
                            anggotaTableBody.appendChild(row);
                        });
                    } else {
                        anggotaTableBody.innerHTML = '<tr><td colspan="8">Tidak ada data anggota yang tersedia.</td></tr>';
                    }
                } else {
                    anggotaTableBody.innerHTML = '<tr><td colspan="8">Tidak ada data anggota yang tersedia.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error memuat data anggota:', error);
                anggotaTableBody.innerHTML = '<tr><td colspan="8">Gagal memuat data anggota. Pastikan server berjalan dan API benar.</td></tr>';
            });
    }
});