document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const currentPath = window.location.pathname.split('/').pop();
    const isMobileView = () => window.innerWidth < 992;

    // FUNGSI BARU: Menutup semua menu (hamburger dan dropdown)
    const closeAllMenus = () => {
        const hamburger = document.querySelector('.hamburger-menu');
        const nav = document.querySelector('header nav');
        const body = document.body;

        // Tutup menu hamburger
        hamburger?.classList.remove('active');
        nav?.classList.remove('active');
        body?.classList.remove('no-scroll');

        // Tutup semua dropdown
        document.querySelectorAll('.dropdown.active, .nav-item.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
            dropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
    };

    // LOGIKA KLIK TOGGLE DROPDOWN
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const parentDropdown = toggle.closest('.dropdown, .nav-item.dropdown');
            const toggleHref = toggle.getAttribute('href') || '';
            const isSamePage = toggleHref.split('/').pop() === currentPath || toggleHref === '#';

            // Di mobile, klik toggle selalu untuk membuka/menutup menu
            if (isMobileView()) {
                e.preventDefault();
                parentDropdown.classList.toggle('active');
                toggle.setAttribute('aria-expanded', parentDropdown.classList.contains('active'));
            } else {
                // Di desktop, hanya toggle jika link ke halaman yang sama
                if (isSamePage) {
                    e.preventDefault();
                    parentDropdown.classList.toggle('active');
                    toggle.setAttribute('aria-expanded', parentDropdown.classList.contains('active'));
                }
            }

            // Tutup dropdown lain, kecuali yang sedang diklik
            document.querySelectorAll('.dropdown.active, .nav-item.dropdown.active').forEach(dropdown => {
                if (dropdown !== parentDropdown) {
                    dropdown.classList.remove('active');
                    dropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    // LOGIKA KLIK TAUTAN DI DALAM DROPDOWN MENU
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            const isAnchorLink = link.getAttribute('href')?.startsWith('#');

            if (isAnchorLink && isMobileView()) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                // Gunakan setTimeout agar scroll berjalan sebelum menu tertutup
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            }

            // Panggil fungsi penutup menu untuk semua skenario
            closeAllMenus();
        });
    });

    // LOGIKA PENUTUPAN MENU UMUM
    document.addEventListener('click', (e) => {
        const isClickInside = e.target.closest('.dropdown, .nav-item.dropdown, .hamburger-menu');
        if (!isClickInside) {
            closeAllMenus();
        }
    });

    window.addEventListener('resize', closeAllMenus);
});