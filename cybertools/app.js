// --- TRANSLATION DICTIONARY (EN / KH) ---
const TRANSLATIONS = {
    en: {
        nav_dashboard: "Dashboard",
        nav_finance: "Accounting & Finance",
        nav_text: "Text Tools",
        nav_file: "File Tools",
        nav_adv_file: "Advanced Files",
        nav_encode: "Encode / Decode",
        nav_image: "Image Tools",
        nav_dev: "Developer Tools",
        nav_util: "Utilities",
        nav_creator: "Creator Tools",
        demo_mode: "Demo Mode",
        btn_login: "Sign In",
        recent_activity: "Recent Activity",
        clear_all: "Clear All",
        hero_title: "Welcome to <span>MeyTool</span>",
        hero_desc: "An ultra-modern, glassmorphic suite of essential developer utilities, text transformers, converters, and creators. All operations run instantly inside your browser without sending your data to any server.",
        det_title: "<i class=\"fa-solid fa-wand-magic-sparkles\" style=\"margin-right: 6px;\"></i>Auto-Tool Input Detector",
        det_drop_hint: "Or drag & drop files here",
        det_drop_formats: "Supports PDF, TXT, JSON, CSV, JPG, PNG, WEBP",
        btn_clear: "Clear",
        btn_detect: "Detect & Open",
        stats_total: "Tools Available",
        stats_fav: "Favorite Tools",
        stats_runs: "Tools Executed",
        modal_beta_title: "MeyTool Cloud Preview",
        modal_beta_desc: "Welcome to the MeyTool Cloud Preview! 🚀<br><br>Server-side authentication and database synchronization are currently disabled in this build. We are running in <strong>Local-First Demo Mode</strong>, meaning all your settings, history, and custom presets are saved locally inside your browser. No data ever leaves your device, guaranteeing 100% privacy!<br><br>Stay tuned for our upcoming Cloud Sync update, featuring secure cross-device backups and team sharing.",
        btn_close: "Close",
        preview_title: "⚡ Feature Preview",
        preview_desc: "You are using a preview version of this tool. Some features may change during development.",
        preview_safe: "Safe to use",
        preview_browser: "Works in browser",
        preview_local: "Runs locally",
        btn_install_app: "Install MeyTool App",
        popular_tools: "Popular Tools"
    },
    kh: {
        nav_dashboard: "ផ្ទាំងគ្រប់គ្រង",
        nav_finance: "គណនេយ្យ និងហិរញ្ញវត្ថុ",
        nav_text: "ឧបករណ៍អត្ថបទ",
        nav_file: "ឧបករណ៍ឯកសារ",
        nav_adv_file: "ឯកសារកម្រិតខ្ពស់",
        nav_encode: "កូដនីយកម្ម / ឌិកូដ",
        nav_image: "ឧបករណ៍រូបភាព",
        nav_dev: "ឧបករណ៍អភិវឌ្ឍន៍",
        nav_util: "ឧបករណ៍ជំនួយ",
        nav_creator: "ឧបករណ៍រចនា",
        demo_mode: "របៀបសាកល្បង",
        btn_login: "ចូលគណនី",
        recent_activity: "សកម្មភាពថ្មីៗ",
        clear_all: "លុបទាំងអស់",
        hero_title: "ស្វាគមន៍មកកាន់ <span>MeyTool</span>",
        hero_desc: "សំណុំឧបករណ៍ជំនួយ និងកម្មវិធីបំលែងកូដដែលមានលក្ខណៈទំនើប កម្រិតខ្ពស់។ រាល់ប្រតិបត្តិការទាំងអស់ដំណើរការភ្លាមៗនៅលើកម្មវិធីរុករករបស់អ្នកដោយមិនមានការបញ្ជូនទិន្នន័យឡើយ។",
        det_title: "<i class=\"fa-solid fa-wand-magic-sparkles\" style=\"margin-right: 6px;\"></i>ប្រព័ន្ធចាប់ទិន្នន័យស្វ័យប្រវត្ត",
        det_drop_hint: "ឬ អូសនិងទម្លាក់ឯកសារទីនេះ",
        det_drop_formats: "គាំទ្រ PDF, TXT, JSON, CSV, JPG, PNG, WEBP",
        btn_clear: "សម្អាត",
        btn_detect: "ស្វែងរក និងបើក",
        stats_total: "ឧបករណ៍សរុប",
        stats_fav: "ពេញចិត្ត",
        stats_runs: "ដំណើរការ",
        modal_beta_title: "ការសាកល្បង MeyTool Cloud",
        modal_beta_desc: "សូមស្វាគមន៍មកកាន់ការសាកល្បង MeyTool Cloud Preview! 🚀<br><br>មុខងារបញ្ជាក់គណនី និងការស្រទាញទិន្នន័យ (Database Sync) ត្រូវបានបិទជាបណ្ដោះអាសន្ន។ បច្ចុប្បន្ន កម្មវិធីកំពុងដំណើរការក្នុង <strong>របៀបសាកល្បង Local-First</strong> ដែលមានន័យថារាល់ការកំណត់ ប្រវត្តិការប្រើប្រាស់ និងទិន្នន័យផ្សេងៗ ត្រូវបានរក្សាទុកតែនៅលើកម្មវិធីរុករក (Browser) ឧបករណ៍របស់អ្នកប៉ុណ្ណោះ។ គ្មានទិន្នន័យណាមួយត្រូវបានបញ្ជូនចេញឡើយ ដើម្បីធានាសុវត្ថិភាពនិងឯកជនភាព ១០០%!<br><br>សូមរង់ចាំមុខងារ Cloud Sync ជំនាន់ក្រោយ ដែលអនុញ្ញាតឱ្យអ្នករក្សាទុកទិន្នន័យ និងប្រើប្រាស់ឆ្លងឧបករណ៍ដោយសុវត្ថិភាព។",
        btn_close: "បិទ",
        preview_title: "⚡ ជំនាន់សាកល្បង",
        preview_desc: "អ្នកកំពុងប្រើប្រាស់កម្មវិធីជំនាន់សាកល្បង (Preview)។ មុខងារមួយចំនួនអាចនឹងផ្លាស់ប្តូរអំឡុងពេលអភិវឌ្ឍ។",
        preview_safe: "សុវត្ថិភាពក្នុងការប្រើប្រាស់",
        preview_browser: "ដំណើរការលើកម្មវិធីរុករក",
        preview_local: "ដំណើរការលើម៉ាស៊ីនផ្ទាល់ខ្លួន",
        btn_install_app: "ដំឡើងកម្មវិធី MeyTool",
        popular_tools: "ឧបករណ៍ពេញនិយម"
    }
};

// --- APPLICATION STATE MANAGER ---
class AppManager {
    constructor() {
        this.currentTheme = localStorage.getItem('meytool-theme') || 'dark';
        this.currentLang = localStorage.getItem('meytool-lang') || 'en';
        this.favorites = JSON.parse(localStorage.getItem('meytool-favorites')) || [];
        this.history = JSON.parse(localStorage.getItem('meytool-history')) || [];
        this.activeCategory = 'dashboard';
        
        // Tab system
        this.activeTabId = 'dashboard';
        this.openTabs = ['dashboard']; // ids of open tool tabs
        
        this.detectorFileData = null; // Temp holder for dropped files in detector
    }

    init() {
        // Sync theme with parent portfolio window if present
        try {
            if (window.parent && window.parent.document && window.parent.document.body) {
                const parentTheme = window.parent.document.body.getAttribute('data-theme');
                if (parentTheme) {
                    this.currentTheme = parentTheme;
                }
            }
        } catch (e) {
            console.log("Could not sync with parent theme", e);
        }

        this.applyTheme(this.currentTheme);
        this.applyLanguage(this.currentLang);
        this.renderToolsGrid();
        this.setupEventListeners();
        this.updateStats();
        this.renderHistory();
        this.setupAutoDetector();
        this.setupMobileSidebar();
        this.setupIslandNavbar();
        this.setupPreviewCard();

        // Listen for messages from parent window
        window.addEventListener('message', (e) => {
            if (e.data && e.data.action === 'setTheme') {
                this.applyTheme(e.data.theme);
            }
        });
    }

    // Theme Switcher
    applyTheme(theme) {
        document.documentElement.setAttribute('theme', theme);
        localStorage.setItem('meytool-theme', theme);
        this.currentTheme = theme;

        // Update desktop theme-menu active class
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-theme') === theme);
        });

        // Update mobile sidebar quick-action buttons
        document.querySelectorAll('.sq-btn[data-theme]').forEach(btn => {
            btn.classList.toggle('sq-active', btn.getAttribute('data-theme') === theme);
        });

        // Update mobile sidebar dropdown button badge & submenu highlight
        const mobThemeBadge = document.getElementById('mob-theme-badge');
        if (mobThemeBadge) {
            let label = 'Cyberpunk';
            if (theme === 'dark') label = 'Dark Glass';
            if (theme === 'light') label = 'Light Glass';
            mobThemeBadge.textContent = label;
        }
        document.querySelectorAll('#mob-theme-submenu .drawer-item[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });
    }

    // Language switcher
    applyLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('meytool-lang', lang);

        // Update all desktop + mobile language badges
        const langBadge = document.getElementById('lang-badge');
        const mobLangBadge = document.getElementById('mob-lang-badge');
        if (langBadge) langBadge.textContent = lang.toUpperCase();
        if (mobLangBadge) mobLangBadge.textContent = lang.toUpperCase();

        // Apply translations
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = TRANSLATIONS[lang][key];
                } else {
                    el.innerHTML = TRANSLATIONS[lang][key];
                }
            }
        });
    }

    // Render tools grid on dashboard
    renderToolsGrid(filterQuery = '') {
        const container = document.getElementById('dashboard-tools-container');
        if (!container) return;

        container.innerHTML = '';
        
        // Group tools by categories
        const categories = {
            finance: 'Accounting & Finance',
            text: 'Text Tools',
            file: 'File Tools',
            'adv-file': 'Advanced Files',
            encode: 'Encode / Decode',
            image: 'Image Tools',
            developer: 'Developer Tools',
            utilities: 'Utilities',
            creator: 'Creator Tools'
        };

        const query = filterQuery.toLowerCase().trim();

        // Render Popular Tools at the very top when there is no active search query
        if (!query) {
            const popularTools = TOOLS.filter(tool => tool.popular);
            if (popularTools.length > 0) {
                const secTitle = document.createElement('h2');
                secTitle.className = 'section-title';
                const label = this.currentLang === 'en' ? '🔥 Popular Tools' : '🔥 ' + (TRANSLATIONS[this.currentLang].popular_tools || 'ឧបករណ៍ពេញនិយម');
                secTitle.innerHTML = label;
                container.appendChild(secTitle);

                const grid = document.createElement('div');
                grid.className = 'tools-grid';
                
                popularTools.forEach(tool => {
                    const isFav = this.favorites.includes(tool.id);
                    const card = document.createElement('div');
                    card.className = 'tool-card';
                    card.setAttribute('data-tool-id', tool.id);
                    
                    card.innerHTML = `
                        <div class="tool-card-header">
                            <span class="tool-card-icon">${tool.icon}</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="background:linear-gradient(135deg, #ff00ff, #00ffff); color:#000; font-size:9px; font-weight:800; padding:2px 6px; border-radius:12px; text-transform:uppercase; letter-spacing:0.5px;">Popular</span>
                                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star favorite-star ${isFav ? 'active' : ''}" data-fav-id="${tool.id}"></i>
                            </div>
                        </div>
                        <div class="tool-card-info">
                            <h3 class="tool-card-title">${tool.name}</h3>
                            <p class="tool-card-desc">${tool.description}</p>
                        </div>
                        <div class="tool-card-tags">
                            ${tool.tags.slice(0, 3).map(tag => `<span class="tool-tag">#${tag}</span>`).join('')}
                        </div>
                    `;

                    card.onclick = (e) => {
                        if (e.target.classList.contains('favorite-star')) {
                            e.stopPropagation();
                            this.toggleFavorite(tool.id);
                            return;
                        }
                        this.openTool(tool.id);
                    };

                    grid.appendChild(card);
                });

                container.appendChild(grid);
            }
        }

        for (const [catId, catName] of Object.entries(categories)) {
            // Filter tools in this category
            const categoryTools = TOOLS.filter(tool => {
                if (tool.category !== catId) return false;
                if (!query) return true;
                
                // Search match
                return tool.name.toLowerCase().includes(query) || 
                       tool.description.toLowerCase().includes(query) || 
                       tool.tags.some(tag => tag.includes(query));
            });

            if (categoryTools.length === 0) continue;

            // Render category header
            const secTitle = document.createElement('h2');
            secTitle.className = 'section-title';
            secTitle.innerHTML = `<span style="text-shadow:var(--accent-glow); margin-right:8px;">★</span> ${catName}`;
            container.appendChild(secTitle);

            // Render grid
            const grid = document.createElement('div');
            grid.className = 'tools-grid';
            
            categoryTools.forEach(tool => {
                const isFav = this.favorites.includes(tool.id);
                const card = document.createElement('div');
                card.className = 'tool-card';
                card.setAttribute('data-tool-id', tool.id);
                
                card.innerHTML = `
                    <div class="tool-card-header">
                        <span class="tool-card-icon">${tool.icon}</span>
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star favorite-star ${isFav ? 'active' : ''}" data-fav-id="${tool.id}"></i>
                    </div>
                    <div class="tool-card-info">
                        <h3 class="tool-card-title">${tool.name}</h3>
                        <p class="tool-card-desc">${tool.description}</p>
                    </div>
                    <div class="tool-card-tags">
                        ${tool.tags.slice(0, 3).map(tag => `<span class="tool-tag">#${tag}</span>`).join('')}
                    </div>
                `;
                
                // Handle click to open
                card.onclick = (e) => {
                    // Prevent trigger if clicking favorite star
                    if (e.target.classList.contains('favorite-star')) {
                        e.stopPropagation();
                        this.toggleFavorite(tool.id);
                        return;
                    }
                    this.openTool(tool.id);
                };

                grid.appendChild(card);
            });

            container.appendChild(grid);
        }

        if (container.children.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-secondary);">No tools found matching your search.</div>`;
        }
    }

    // Toggle favorite tools list
    toggleFavorite(toolId) {
        const index = this.favorites.indexOf(toolId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            utils.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(toolId);
            utils.showToast('Added to favorites');
        }
        localStorage.setItem('meytool-favorites', JSON.stringify(this.favorites));
        this.updateStats();
        this.renderToolsGrid(document.getElementById('global-search-input').value);
        this.updateActiveToolFavIcon();
    }

    updateActiveToolFavIcon() {
        const activeFavBtn = document.getElementById('active-tool-fav-btn');
        if (activeFavBtn && this.activeTabId !== 'dashboard') {
            const isFav = this.favorites.includes(this.activeTabId);
            activeFavBtn.innerHTML = `<i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star" style="color:${isFav ? '#ffd700' : 'inherit'};"></i>`;
        }
    }

    // Record tool utilization history
    addToHistory(toolId) {
        const tool = TOOLS.find(t => t.id === toolId);
        if (!tool) return;
        
        // Remove existing to bring to top
        this.history = this.history.filter(item => item.id !== toolId);
        this.history.unshift({
            id: toolId,
            name: tool.name,
            icon: tool.icon,
            timestamp: Date.now()
        });

        // Limit history to 15 items
        if (this.history.length > 15) this.history.pop();
        
        localStorage.setItem('meytool-history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('history-items-container');
        const badge = document.getElementById('history-badge');
        if (!list || !badge) return;

        badge.textContent = this.history.length;
        list.innerHTML = '';

        if (this.history.length === 0) {
            list.innerHTML = `<div style="padding:10px; text-align:center; font-size:12px; color:var(--text-muted);">No recent activity.</div>`;
            return;
        }

        this.history.forEach(item => {
            const row = document.createElement('div');
            row.className = 'history-item';
            row.innerHTML = `
                <span>${item.icon} ${item.name}</span>
                <span style="font-size:10px; color:var(--text-muted);">${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            `;
            row.onclick = () => {
                this.openTool(item.id);
                document.getElementById('history-dropdown-panel').style.display = 'none';
            };
            list.appendChild(row);
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.setItem('meytool-history', JSON.stringify([]));
        this.renderHistory();
        utils.showToast('Activity history cleared', 'info');
    }

    updateStats() {
        const totalVal = document.getElementById('stats-total-tools');
        const favVal = document.getElementById('stats-favorite-count');
        if (totalVal) totalVal.textContent = TOOLS.length;
        if (favVal) favVal.textContent = this.favorites.length;
    }

    // Dynamic Tab Management & Tool opening
    openTool(toolId) {
        const tool = TOOLS.find(t => t.id === toolId);
        if (!tool) return;

        // Show tabs bar
        const tabsBar = document.getElementById('workspace-tabs-bar');
        tabsBar.style.display = 'flex';

        // Add tool to open tabs list if not exists
        if (!this.openTabs.includes(toolId)) {
            this.openTabs.push(toolId);
            
            // Create tab button
            const tabBtn = document.createElement('button');
            tabBtn.className = 'tab-btn';
            tabBtn.id = `tab-${toolId}`;
            tabBtn.setAttribute('data-tab-id', toolId);
            tabBtn.innerHTML = `
                ${tool.icon} ${tool.name} 
                <span class="tab-close-icon" onclick="event.stopPropagation(); window.app.closeTab('${toolId}');">
                    <i class="fa-solid fa-xmark"></i>
                </span>
            `;
            tabBtn.onclick = () => this.switchTab(toolId);
            tabsBar.appendChild(tabBtn);
        }

        this.switchTab(toolId);
        this.addToHistory(toolId);
    }

    closeTab(toolId) {
        if (toolId === 'dashboard') return;

        const tabBtn = document.getElementById(`tab-${toolId}`);
        if (tabBtn) tabBtn.remove();

        this.openTabs = this.openTabs.filter(id => id !== toolId);

        if (this.activeTabId === toolId) {
            // Switch to previous open tab
            const lastTab = this.openTabs[this.openTabs.length - 1];
            this.switchTab(lastTab);
        }

        if (this.openTabs.length === 1 && this.openTabs[0] === 'dashboard') {
            document.getElementById('workspace-tabs-bar').style.display = 'none';
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }
        document.body.classList.remove('sidebar-open');
    }

    switchTab(tabId) {
        this.activeTabId = tabId;
        
        // Reset mobile island navbar scrolled style on tab switch
        const navbar = document.querySelector('.mobile-header');
        if (navbar) {
            navbar.classList.remove('navbar-scrolled');
        }
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab-id') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const dashboardPanel = document.getElementById('panel-dashboard');
        const workspacePanel = document.getElementById('panel-tool-workspace');
        const mainWorkspace = document.getElementById('main-workspace');

        if (tabId === 'dashboard') {
            if (mainWorkspace) mainWorkspace.classList.remove('tool-fit-viewport');
            dashboardPanel.style.display = 'block';
            workspacePanel.style.display = 'none';
            
            // Highlight dashboard nav link
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.getAttribute('data-category') === 'dashboard') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        } else {
            const tool = TOOLS.find(t => t.id === tabId);
            if (!tool) return;

            if (mainWorkspace) {
                if (tool.fitViewport) {
                    mainWorkspace.classList.add('tool-fit-viewport');
                } else {
                    mainWorkspace.classList.remove('tool-fit-viewport');
                }
            }

            dashboardPanel.style.display = 'none';
            workspacePanel.style.display = 'flex';

            // Populate workspace frame header
            document.getElementById('active-tool-icon').innerHTML = tool.icon;
            document.getElementById('active-tool-title').textContent = tool.name;
            
            const catLabel = document.getElementById('active-tool-category');
            catLabel.textContent = tool.category.toUpperCase();
            catLabel.className = `tool-tag ${tool.category}`;

            // Render tool body
            const bodyContainer = document.getElementById('active-tool-body');
            bodyContainer.innerHTML = tool.render();
            
            // Highlight sidebar nav item corresponding to tool category
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.getAttribute('data-category') === tool.category) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            this.updateActiveToolFavIcon();

            // Initialize tool listeners
            tool.init();
        }
    }

    // Set up general DOM listeners
    setupEventListeners() {
        // Sidebar item navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = () => {
                const cat = item.getAttribute('data-category');
                
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                if (cat === 'dashboard') {
                    this.switchTab('dashboard');
                } else {
                    // Filter tools list on dashboard
                    this.switchTab('dashboard');
                    this.renderToolsGrid();
                    // Scroll down to category section — use data-category attribute for accuracy
                    setTimeout(() => {
                        const catMap = {
                            finance: 'accounting & finance',
                            text: 'text tools',
                            file: 'file tools',
                            'adv-file': 'advanced files',
                            encode: 'encode',
                            image: 'image tools',
                            developer: 'developer tools',
                            utilities: 'utilities',
                            creator: 'creator tools'
                        };
                        const keyword = catMap[cat] || cat;
                        const catTitle = Array.from(document.querySelectorAll('.section-title')).find(el =>
                            el.textContent.toLowerCase().includes(keyword)
                        );
                        if (catTitle) catTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 80);
                }

                // Close sidebar on mobile
                if (window.innerWidth <= 1024) {
                    this.closeMobileSidebar();
                }
            };
        });

        // Theme Toggle menu display
        const themeBtn = document.getElementById('theme-toggle-btn');
        const themeMenu = document.getElementById('theme-menu-dropdown');
        if (themeBtn && themeMenu) {
            themeBtn.onclick = (e) => {
                e.stopPropagation();
                themeMenu.style.display = themeMenu.style.display === 'flex' ? 'none' : 'flex';
                document.getElementById('history-dropdown-panel').style.display = 'none';
            };
        }

        // Theme switching options
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.onclick = () => {
                this.applyTheme(opt.getAttribute('data-theme'));
                themeMenu.style.display = 'none';
            };
        });

        // History Dropdown toggle
        const historyBtn = document.getElementById('history-toggle-btn');
        const historyPanel = document.getElementById('history-dropdown-panel');
        if (historyBtn && historyPanel) {
            historyBtn.onclick = (e) => {
                e.stopPropagation();
                historyPanel.style.display = historyPanel.style.display === 'flex' ? 'none' : 'flex';
                themeMenu.style.display = 'none';
            };
        }

        const clearHistBtn = document.getElementById('clear-history-btn');
        if (clearHistBtn) clearHistBtn.onclick = () => this.clearHistory();

        // Close dropdowns when clicking outside (use addEventListener, not assignment)
        window.addEventListener('click', () => {
            if (themeMenu) themeMenu.style.display = 'none';
            if (historyPanel) historyPanel.style.display = 'none';
        });

        // Lang Switch Toggle
        const langToggleBtn = document.getElementById('lang-toggle-btn');
        if (langToggleBtn) langToggleBtn.onclick = () => {
            const nextLang = this.currentLang === 'en' ? 'kh' : 'en';
            this.applyLanguage(nextLang);
            utils.showToast(nextLang === 'en' ? 'Language switched to English' : 'ភាសាត្រូវបានប្តូរទៅជាភាសាខ្មែរ');
        };

        // Auth/Sign-in modals
        const authBtn = document.getElementById('sidebar-auth-btn');
        const profileTrigger = document.getElementById('user-profile-trigger');
        const modal = document.getElementById('custom-modal-dialog');
        const modalClose = document.getElementById('modal-close-btn');

        const openModal = () => { if (modal) modal.style.display = 'flex'; };
        const closeModal = () => { if (modal) modal.style.display = 'none'; };

        if (authBtn)        authBtn.onclick       = openModal;
        if (profileTrigger) profileTrigger.onclick = openModal;
        if (modalClose)     modalClose.onclick    = closeModal;

        // Click the backdrop (the modal itself, not the inner card) to close
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) closeModal();
            };
        }

        // Active tool controls in workspace
        const closeToolBtn = document.getElementById('active-tool-close-btn');
        if (closeToolBtn) {
            closeToolBtn.onclick = () => this.closeTab(this.activeTabId);
        }
        
        const favToolBtn = document.getElementById('active-tool-fav-btn');
        if (favToolBtn) {
            favToolBtn.onclick = () => this.toggleFavorite(this.activeTabId);
        }

        // Global Search
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const q = e.target.value;
                this.switchTab('dashboard');
                this.renderToolsGrid(q);
            };
        }

        // NOTE: Mobile menu toggle is fully handled in setupMobileSidebar()
        // Do NOT register it here to avoid double-registration conflicts.
    }

    // Auto Tool Input Detection Logic
    setupAutoDetector() {
        const inputArea = document.getElementById('detector-input');
        const dropZone = document.getElementById('detector-drop-zone');
        const fileInput = document.getElementById('detector-file-input');
        
        const badge = document.getElementById('detector-badge');
        const runBtn = document.getElementById('detector-run-btn');
        const clearBtn = document.getElementById('detector-clear-btn');

        let detectedToolId = null;
        let prefilledValue = null;

        const classifyInput = (text) => {
            text = text.trim();
            if (!text) {
                badge.style.display = 'none';
                detectedToolId = null;
                return;
            }

            badge.style.display = 'inline-block';
            prefilledValue = text;

            // 1. JSON
            try {
                if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
                    JSON.parse(text);
                    badge.textContent = "Detected: JSON Data → Formatting Tool";
                    detectedToolId = 'dev-json-format';
                    return;
                }
            } catch(e) {}

            // 2. Base64 Image or String
            if (text.startsWith('data:image/') && text.includes(';base64,')) {
                badge.textContent = "Detected: Base64 Image → Base64 Tool";
                detectedToolId = 'encode-base64';
                return;
            }
            if (text.match(/^[a-zA-Z0-9+/=]+$/) && text.length > 30) {
                badge.textContent = "Detected: Base64 String → Base64 Decode";
                detectedToolId = 'encode-base64';
                return;
            }

            // 3. Hex Color
            if (text.match(/^#[0-9A-Fa-f]{6}$/) || text.match(/^#[0-9A-Fa-f]{3}$/)) {
                badge.textContent = "Detected: HEX Color → Palette Picker";
                detectedToolId = 'util-color';
                return;
            }

            // 4. Hyperlink URL
            if (text.startsWith('http://') || text.startsWith('https://')) {
                badge.textContent = "Detected: URL Hyperlink → QR Code Generator";
                detectedToolId = 'util-qrcode';
                return;
            }

            // Default: Text Transformer
            badge.textContent = "Detected: Text String → Case Converter";
            detectedToolId = 'text-case';
        };

        // Live text classification
        inputArea.oninput = (e) => classifyInput(e.target.value);

        // Click file drop zone
        dropZone.onclick = () => fileInput.click();

        // Handle file drop events
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        };
        
        dropZone.ondragleave = () => {
            dropZone.classList.remove('drag-over');
        };

        const handleDroppedFile = (file) => {
            if (!file) return;
            this.detectorFileData = file;
            inputArea.value = `File name: ${file.name}\nSize: ${utils.formatBytes(file.size)}\nType: ${file.type}`;
            badge.style.display = 'inline-block';
            
            if (file.type === 'application/pdf') {
                badge.textContent = "Detected: PDF Document → PDF Extractor";
                detectedToolId = 'file-pdf-to-txt';
            } else if (file.type.startsWith('image/')) {
                badge.textContent = "Detected: Image File → Compressor & Resizer";
                detectedToolId = 'image-compress';
            } else {
                badge.textContent = "Detected: Text File → Case Converter";
                detectedToolId = 'text-case';
                // Read text file directly into inputArea
                const reader = new FileReader();
                reader.onload = (evt) => {
                    inputArea.value = evt.target.result;
                    prefilledValue = evt.target.result;
                };
                reader.readAsText(file);
            }
        };

        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            handleDroppedFile(file);
        };

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            handleDroppedFile(file);
        };

        // Run Detected Tool
        runBtn.onclick = () => {
            if (!detectedToolId) {
                utils.showToast('Please type input text or drop a file first!', 'info');
                return;
            }

            this.openTool(detectedToolId);

            // Prefill field in opened tool workspace if applicable
            setTimeout(() => {
                if (detectedToolId === 'dev-json-format') {
                    const el = document.getElementById('jsf-input');
                    if (el) el.value = prefilledValue;
                } else if (detectedToolId === 'encode-base64') {
                    const el = document.getElementById('b64-text-input');
                    if (el) el.value = prefilledValue;
                } else if (detectedToolId === 'util-color') {
                    const el = document.getElementById('cp-hex');
                    if (el) {
                        el.value = prefilledValue;
                        el.dispatchEvent(new Event('input'));
                    }
                } else if (detectedToolId === 'util-qrcode') {
                    const el = document.getElementById('qr-data-input');
                    if (el) el.value = prefilledValue;
                } else if (detectedToolId === 'text-case') {
                    const el = document.getElementById('tc-input');
                    if (el) el.value = prefilledValue;
                } else if (detectedToolId === 'file-pdf-to-txt' && this.detectorFileData) {
                    // Populate PDF file input
                    const el = document.getElementById('pdftxt-file-input');
                    if (el) {
                        const dt = new DataTransfer();
                        dt.items.add(this.detectorFileData);
                        el.files = dt.files;
                        el.dispatchEvent(new Event('change'));
                    }
                } else if (detectedToolId === 'image-compress' && this.detectorFileData) {
                    // Populate Image Compressor file input
                    const el = document.getElementById('imgcomp-file-field');
                    if (el) {
                        const dt = new DataTransfer();
                        dt.items.add(this.detectorFileData);
                        el.files = dt.files;
                        el.dispatchEvent(new Event('change'));
                    }
                }
                
                // Clear detector inputs after running
                this.clearDetector();
            }, 150);
        };

        clearBtn.onclick = () => this.clearDetector();
    }

    clearDetector() {
        const inputArea = document.getElementById('detector-input');
        const badge = document.getElementById('detector-badge');
        if (inputArea) inputArea.value = '';
        if (badge) badge.style.display = 'none';
        this.detectorFileData = null;
    }

    // =============================================
    // MOBILE SIDEBAR — theme, lang, search controls
    // =============================================
    setupMobileSidebar() {
        const sidebar = document.getElementById('app-sidebar');

        // --- Mobile theme toggle button (accordion dropdown) ---
        const mobThemeBtn = document.getElementById('mob-theme-btn');
        const mobThemeSubmenu = document.getElementById('mob-theme-submenu');
        if (mobThemeBtn && mobThemeSubmenu) {
            mobThemeSubmenu.style.display = 'none';
            mobThemeBtn.onclick = (e) => {
                e.stopPropagation();
                const isOpen = mobThemeSubmenu.classList.toggle('open');
                mobThemeSubmenu.style.display = isOpen ? 'flex' : 'none';
            };
        }

        // --- Mobile theme sub-button selections ---
        document.querySelectorAll('#mob-theme-submenu .drawer-item[data-theme]').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const theme = btn.getAttribute('data-theme');
                this.applyTheme(theme);
                utils.showToast(`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
            };
        });

        // --- Mobile language toggle ---
        const mobLangBtn = document.getElementById('mob-lang-btn');
        if (mobLangBtn) {
            mobLangBtn.onclick = () => {
                const nextLang = this.currentLang === 'en' ? 'kh' : 'en';
                this.applyLanguage(nextLang);
                utils.showToast(nextLang === 'en' ? 'Language: English' : 'ភាសាខ្មែរ');
            };
        }

        // --- Mobile search bar (inside sidebar) ---
        const sidebarSearch = document.getElementById('sidebar-search-input');
        if (sidebarSearch) {
            sidebarSearch.oninput = (e) => {
                const q = e.target.value;
                // Also sync with desktop search
                const desktopSearch = document.getElementById('global-search-input');
                if (desktopSearch) desktopSearch.value = q;

                this.switchTab('dashboard');
                this.renderToolsGrid(q);

                // Close sidebar after typing begins so user sees results
                if (q.length > 0) {
                    setTimeout(() => {
                        sidebar.classList.remove('open');
                    }, 600);
                }
            };
        }

        // --- Sidebar backdrop overlay (tap outside to close) ---
        let overlay = document.getElementById('sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.style.cssText = [
                'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.5)',
                'backdrop-filter:blur(2px)', 'z-index:450', 'display:none',
                'transition:opacity 0.3s'
            ].join(';');
            document.body.appendChild(overlay);
        }

        // Toggle overlay with sidebar
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const drawerCloseBtn = document.getElementById('drawer-close-btn');
        const closeSidebar = () => this.closeMobileSidebar();

        if (mobileToggle) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle('open');
                const isOpen = sidebar.classList.contains('open');
                overlay.style.display = isOpen ? 'block' : 'none';
                setTimeout(() => { overlay.style.opacity = isOpen ? '1' : '0'; }, 10);
                if (isOpen) {
                    document.body.classList.add('sidebar-open');
                } else {
                    document.body.classList.remove('sidebar-open');
                }
            });
        }

        if (drawerCloseBtn) {
            drawerCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
            });
        }

        // --- Mobile Profile & Login Triggers ---
        const mobAuthBtn = document.getElementById('mob-auth-btn');
        const mobProfileTrigger = document.getElementById('mob-profile-trigger');
        const modal = document.getElementById('custom-modal-dialog');
        if (mobAuthBtn && modal) {
            mobAuthBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.style.display = 'flex';
            };
        }
        if (mobProfileTrigger && modal) {
            mobProfileTrigger.onclick = (e) => {
                e.stopPropagation();
                modal.style.display = 'flex';
            };
        }

        // Also close sidebar on nav item click (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    this.closeMobileSidebar();
                }
            });
        });

        // --- PWA Installation for Android / Mobile Chrome / iOS ---
        const installBtn = document.getElementById('mob-install-btn');
        const dashInstallBtn = document.getElementById('dashboard-install-btn');
        let deferredPrompt = null;

        // Force show download buttons on mobile devices so user knows it's available
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
        if (dashInstallBtn) {
            dashInstallBtn.style.display = 'flex';
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });

        const handleInstallClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        utils.showToast('Installing MeyTool...');
                    }
                    deferredPrompt = null;
                });
            } else {
                // Show installation instructions based on OS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                if (isIOS) {
                    utils.showToast('iOS: Tap Share <i class="fa-solid fa-share-from-square" style="color: var(--accent-primary);"></i> then "Add to Home Screen"', 'info');
                } else {
                    utils.showToast('To Install: Click Browser Menu (3-dots) then select "Install App" or "Add to Home Screen"', 'info');
                }
            }
        };

        if (installBtn) {
            installBtn.addEventListener('click', handleInstallClick);
        }
        if (dashInstallBtn) {
            dashInstallBtn.addEventListener('click', handleInstallClick);
        }

        window.addEventListener('appinstalled', () => {
            utils.showToast('App installed on your home screen! 🎉');
            if (installBtn) installBtn.style.display = 'none';
            if (dashInstallBtn) dashInstallBtn.style.display = 'none';
        });
    }

    // =============================================
    // ISLAND NAVBAR — hide on scroll down, show on scroll up
    // =============================================
    setupIslandNavbar() {
        const navbar = document.querySelector('.mobile-header');
        const workspace = document.getElementById('main-workspace');
        if (!navbar || !workspace) return;

        let ticking = false;

        workspace.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const currentY = workspace.scrollTop;

                // Add scrolled style once past threshold
                if (currentY > 30) {
                    navbar.classList.add('navbar-scrolled');
                } else {
                    navbar.classList.remove('navbar-scrolled');
                }

                ticking = false;
            });
        }, { passive: true });
    }

    // Initialize and handle Feature Preview notification card
    setupPreviewCard() {
        const previewDismissed = localStorage.getItem('meytool-preview-dismissed') === 'true';
        const previewCard = document.getElementById('preview-notification-card');
        
        if (previewCard) {
            if (previewDismissed) {
                previewCard.style.display = 'none';
            } else {
                const closeBtn = document.getElementById('close-preview-card');
                if (closeBtn) {
                    closeBtn.onclick = () => {
                        previewCard.classList.add('dismissed');
                        localStorage.setItem('meytool-preview-dismissed', 'true');
                        // Remove from layout after transition completes
                        setTimeout(() => {
                            previewCard.style.display = 'none';
                        }, 400);
                    };
                }
            }
        }
    }
}


// Instantiate and start app on page load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new AppManager();
    window.app.init();
});

// Register Service Worker for offline and PWA installation support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered successfully:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
