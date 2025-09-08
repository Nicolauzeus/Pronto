document.addEventListener('DOMContentLoaded', () => {
    // Dados iniciais (amostra)
    const initialPortfolios = [
        {
            id: 1,
            name: 'Nicolau Capingna',
            profession: 'Desenvolvedor Fullstack',
            country: 'Angola',
            state: 'Luanda',
            city: 'Luanda',
            availability: 'Pronto para trabalhar',
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
            isUnilab: true,
            imageUrl: 'https://nicolauzeus.vercel.app/eu.jpg',
            portfolioUrl: 'https://nicolauzeus.vercel.app',
            rating: 4.8,
            description: 'Desenvolvedor fullstack com experiência em aplicações web modernas. Especializado em JavaScript, React e Node.js.',
            userId: 1 // ID do usuário dono do portfólio
        },
        {
            id: 2,
            name: 'Ana Silva',
            profession: 'Designer UX/UI',
            country: 'Brasil',
            state: 'SP',
            city: 'São Paulo',
            availability: 'Pronto para trabalhar',
            skills: ['Figma', 'UI Design', 'Prototipagem'],
            isUnilab: false,
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            portfolioUrl: 'https://vercel.com',
            rating: 4.5,
            description: 'Designer com 5 anos de experiência em projetos digitais',
            userId: 1
        },
        {
            id: 3,
            name: 'Bruno Costa',
            profession: 'Desenvolvedor Web',
            country: 'Brasil',
            state: 'RJ',
            city: 'Rio de Janeiro',
            availability: 'Freelancer',
            skills: ['JavaScript', 'React', 'Node.js'],
            isUnilab: false,
            imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            portfolioUrl: 'https://vercel.com',
            rating: 4.2,
            description: 'Desenvolvedor Fullstack especializado em aplicações modernas',
            userId: 1
        },
        {
            id: 4,
            name: 'Carlos Mendes',
            profession: 'Engenheiro Civil',
            country: 'Angola',
            state: 'Luanda',
            city: 'Luanda',
            availability: 'Pronto para trabalhar',
            skills: ['AutoCAD', 'Gestão de Obras', 'Orçamentação'],
            isUnilab: false,
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            portfolioUrl: 'https://vercel.com',
            rating: 4.8,
            description: 'Engenheiro civil com experiência em grandes projetos',
            userId: 1
        }
    ];

    // Estados e províncias
    const statesByCountry = {
        'Brasil': ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'],
        'Angola': ['Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire']
    };

    // Banco de dados (localStorage)
    let portfolios = JSON.parse(localStorage.getItem('portfoliosDB')) || initialPortfolios;

    // Função para salvar os portfólios no localStorage
    const savePortfolios = () => {
        localStorage.setItem('portfoliosDB', JSON.stringify(portfolios));
    };
    
    // Salva os dados iniciais na primeira vez que o site é carregado
    if (!localStorage.getItem('portfoliosDB')) {
        savePortfolios();
    }

    // Elementos do DOM
    const portfolioGrid = document.getElementById('portfolio-grid');
    const noResultsDiv = document.getElementById('no-results');
    const searchInput = document.getElementById('search-input');
    const filterContainer = document.getElementById('filter-container');
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const loadingDiv = document.getElementById('loading');
    
    // Modal
    const modal = document.getElementById('portfolioModal');
    const modalContent = modal.querySelector('div');
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const portfolioForm = document.getElementById('portfolioForm');

    // Filtros select
    const professionFilter = document.getElementById('profession-filter');
    const countryFilter = document.getElementById('country-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const unilabFilter = document.getElementById('unilab-filter');

    // Estado dos filtros
    let activeFilters = {
        profession: 'all',
        country: 'all',
        state: 'all',
        availability: 'all',
        unilab: 'all'
    };
    let searchTerm = '';
    
    // Paginação
    let currentPage = 1;
    const itemsPerPage = 12;
    let allFilteredPortfolios = [];

    // Popular estados/províncias com base no país selecionado
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            const country = countrySelect.value;
            stateSelect.innerHTML = '<option value="">Selecione o estado/província</option>';
            
            if (country && statesByCountry[country]) {
                statesByCountry[country].forEach(state => {
                    const option = document.createElement('option');
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
            }
        });
    }

    // Gerar estrelas de classificação
    const generateRatingStars = (rating) => {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return `<div class="rating-stars flex text-sm">${stars} <span class="ml-1 text-gray-400">(${rating.toFixed(1)})</span></div>`;
    };

    // Popular o select de profissões
    const populateProfessionFilter = () => {
        const professions = ['all', ...new Set(portfolios.map(p => p.profession))];
        
        // Limpar opções existentes (exceto a primeira)
        while (professionFilter.options.length > 1) {
            professionFilter.remove(1);
        }
        
        // Adicionar novas opções
        professions.forEach(profession => {
            if (profession !== 'all') {
                const option = document.createElement('option');
                option.value = profession;
                option.textContent = profession;
                professionFilter.appendChild(option);
            }
        });
    };

    // Filtrar portfólios
    const filterPortfolios = () => {
        let filtered = [...portfolios];

        // Filtro de texto (busca)
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.profession.toLowerCase().includes(searchTerm) ||
                (p.skills && p.skills.some(skill => skill.toLowerCase().includes(searchTerm))) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro de profissão
        if (activeFilters.profession !== 'all') {
            filtered = filtered.filter(p => p.profession === activeFilters.profession);
        }

        // Filtro de país
        if (activeFilters.country !== 'all') {
            filtered = filtered.filter(p => p.country === activeFilters.country);
        }

        // Filtro de disponibilidade
        if (activeFilters.availability !== 'all') {
            filtered = filtered.filter(p => p.availability === activeFilters.availability);
        }

        // Filtro UNILAB
        if (activeFilters.unilab !== 'all') {
            const isUnilabStudent = activeFilters.unilab === 'true';
            filtered = filtered.filter(p => p.isUnilab === isUnilabStudent);
        }

        return filtered;
    };

    // Renderizar os portfólios (com paginação)
    const renderPortfolios = (portfoliosToRender, append = false) => {
        if (!append) {
            portfolioGrid.innerHTML = '';
            currentPage = 1;
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const portfoliosToShow = portfoliosToRender.slice(startIndex, endIndex);
        
        noResultsDiv.classList.toggle('hidden', portfoliosToRender.length > 0);
        loadingDiv.classList.add('hidden');

        if (portfoliosToRender.length === 0) {
            return;
        }

        portfoliosToShow.forEach(portfolio => {
            const card = document.createElement('div');
            card.className = 'portfolio-card bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700';
            
            const unilabBadge = portfolio.isUnilab 
                ? `<span class="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">UNILAB</span>`
                : '';

            card.innerHTML = `
                <div class="relative">
                    <img src="${portfolio.imageUrl}" alt="Foto de ${portfolio.name}" class="w-full h-48 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/27272A/FFFFFF?text=Imagem+Não+Encontrada';">
                    ${unilabBadge}
                </div>
                <div class="p-5 flex flex-col h-[calc(100%-12rem)]">
                    <h3 class="text-xl font-bold text-white mb-1">${portfolio.name}</h3>
                    <p class="text-emerald-400 font-semibold text-sm mb-2">${portfolio.profession}</p>
                    <p class="text-gray-400 text-sm mb-2">📍 ${portfolio.city}, ${portfolio.state}, ${portfolio.country}</p>
                    <p class="text-gray-400 text-sm mb-2">${portfolio.availability}</p>
                    ${portfolio.rating ? generateRatingStars(portfolio.rating) : ''}
                    <p class="text-gray-300 text-sm mt-2 mb-4 line-clamp-2">${portfolio.description || 'Profissional qualificado pronto para novas oportunidades.'}</p>
                    <div class="mt-auto">
                        <a href="${portfolio.portfolioUrl}" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            Ver Portfólio
                        </a>
                    </div>
                </div>
            `;
            portfolioGrid.appendChild(card);
        });
        
        // Verificar se há mais itens para carregar
        if (endIndex < portfoliosToRender.length) {
            currentPage++;
            // Configurar Intersection Observer para carregar mais itens quando o usuário chegar ao final
            setupInfiniteScroll();
        }
    };

    // Configurar scroll infinito
    const setupInfiniteScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadingDiv.classList.remove('hidden');
                    setTimeout(() => {
                        renderPortfolios(allFilteredPortfolios, true);
                    }, 500);
                }
            });
        }, { threshold: 0.1 });
        
        // Observar o último elemento da grade
        const lastCard = portfolioGrid.lastElementChild;
        if (lastCard) {
            observer.observe(lastCard);
        }
    };

    // Aplicar filtros e renderizar
    const applyFiltersAndRender = () => {
        // Atualizar activeFilters com os valores dos selects
        activeFilters.profession = professionFilter.value;
        activeFilters.country = countryFilter.value;
        activeFilters.availability = availabilityFilter.value;
        activeFilters.unilab = unilabFilter.value;
        
        allFilteredPortfolios = filterPortfolios();
        renderPortfolios(allFilteredPortfolios);
    };

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            applyFiltersAndRender();
        });
    }
    
    // Event listeners para os selects de filtro
    if (professionFilter) {
        professionFilter.addEventListener('change', applyFiltersAndRender);
    }
    
    if (countryFilter) {
        countryFilter.addEventListener('change', applyFiltersAndRender);
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', applyFiltersAndRender);
    }
    
    if (unilabFilter) {
        unilabFilter.addEventListener('change', applyFiltersAndRender);
    }
    
    // Modal functions
    const openModal = () => {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        if (userHasPortfolio()) {
            alert('Você já possui um portfólio cadastrado. Cada usuário pode ter apenas um portfólio.');
            return;
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.remove('scale-95', 'opacity-0'), 10);
    };

    const closeModal = () => {
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    if (addPortfolioBtn) {
        addPortfolioBtn.addEventListener('click', openModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => e.target === modal && closeModal());
    }

    // Form submission
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = getCurrentUser();
            if (!user) {
                alert('Você precisa estar logado para adicionar um portfólio.');
                window.location.href = 'login.html';
                return;
            }
            
            if (userHasPortfolio()) {
                alert('Você já possui um portfólio cadastrado. Cada usuário pode ter apenas um portfólio.');
                return;
            }

            const skillsValue = document.getElementById('skills').value;
            const skillsArray = skillsValue ? skillsValue.split(',').map(skill => skill.trim()) : [];

            const newPortfolio = {
                id: Date.now(),
                name: document.getElementById('clientName').value,
                profession: document.getElementById('profession').value,
                country: document.getElementById('country').value,
                state: document.getElementById('state').value,
                city: document.getElementById('city').value,
                availability: document.getElementById('availability').value,
                skills: skillsArray,
                isUnilab: document.getElementById('isUnilab').checked,
                imageUrl: document.getElementById('imageUrl').value,
                portfolioUrl: document.getElementById('portfolioLink').value,
                description: document.getElementById('description').value,
                rating: 0, // Novo portfólio começa sem avaliações
                userId: user.id // Associar portfólio ao usuário
            };

            portfolios.unshift(newPortfolio);
            savePortfolios();
            
            // Atualizar status do usuário
            updateUserPortfolioStatus(true);
            
            // Atualizar o select de profissões
            populateProfessionFilter();
            
            portfolioForm.reset();
            closeModal();
            
            // Recria os botões de filtro e renderiza tudo
            applyFiltersAndRender();
        });
    }

    // Inicialização
    const initialize = () => {
        populateProfessionFilter();
        applyFiltersAndRender();
        updateAuthUI();
    };

    initialize();
});
