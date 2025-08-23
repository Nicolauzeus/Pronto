document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!requireAuth()) {
        return;
    }
    
    // Estados e províncias
    const statesByCountry = {
        'Brasil': ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'],
        'Angola': ['Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire']
    };

    // Carregar portfólios do localStorage
    let portfolios = JSON.parse(localStorage.getItem('portfoliosDB')) || [];
    
    // Elementos do DOM
    const totalPortfoliosEl = document.getElementById('total-portfolios');
    const brazilCountEl = document.getElementById('brazil-count');
    const angolaCountEl = document.getElementById('angola-count');
    const unilabCountEl = document.getElementById('unilab-count');
    const tableBody = document.getElementById('portfolios-table-body');
    const searchInput = document.getElementById('search-dashboard');
    
    // Formulários
    const portfolioForm = document.getElementById('dashboard-portfolio-form');
    const editForm = document.getElementById('editForm');
    
    // Modais e seções
    const editModal = document.getElementById('editModal');
    const dashboardSections = document.querySelectorAll('.config-section');
    const dashboardLinks = document.querySelectorAll('.dashboard-link');
    
    // Navegação do dashboard
    dashboardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Atualizar título
            document.getElementById('dashboard-title').textContent = 
                section === 'dashboard' ? 'Dashboard' : 
                section === 'add-portfolio' ? 'Adicionar Portfólio' : 
                section === 'configuracoes' ? 'Configurações' : 'Dashboard';
            
            // Mostrar seção correta
            dashboardSections.forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(`${section}-section`).classList.add('active');
            
            // Se for a seção de configurações, carregar dados do usuário
            if (section === 'configuracoes') {
                loadUserData();
            }
        });
    });
    
    // Carregar dados do usuário para a seção de configurações
    function loadUserData() {
        const user = getCurrentUser();
        if (user) {
            document.getElementById('user-fullname').textContent = user.fullName;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-created').textContent = new Date(user.createdAt).toLocaleDateString('pt-BR');
            document.getElementById('user-portfolio-status').textContent = 
                user.hasPortfolio ? 'Portfólio cadastrado' : 'Nenhum portfólio cadastrado';
        }
    }
    
    // Popular estados/províncias com base no país selecionado
    const countrySelect = document.getElementById('dashboard-country');
    const stateSelect = document.getElementById('dashboard-state');
    
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
    
    // Calcular estatísticas
    const calculateStats = () => {
        totalPortfoliosEl.textContent = portfolios.length;
        
        const brazilCount = portfolios.filter(p => p.country === 'Brasil').length;
        const angolaCount = portfolios.filter(p => p.country === 'Angola').length;
        const unilabCount = portfolios.filter(p => p.isUnilab).length;
        
        brazilCountEl.textContent = brazilCount;
        angolaCountEl.textContent = angolaCount;
        unilabCountEl.textContent = unilabCount;
    };
    
    // Gerar estrelas de classificação
    const generateRatingStars = (rating) => {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star text-yellow-400"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
            } else {
                stars += '<i class="far fa-star text-yellow-400"></i>';
            }
        }
        
        return `<div class="flex">${stars}</div>`;
    };
    
    // Preencher a tabela com os portfólios
    const populateTable = () => {
        tableBody.innerHTML = '';
        
        if (portfolios.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-400">
                        <i class="fas fa-user-slash text-3xl mb-2"></i>
                        <p>Nenhum portfólio cadastrado ainda.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        portfolios.forEach(portfolio => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="flex items-center">
                    <img src="${portfolio.imageUrl}" alt="${portfolio.name}" class="w-10 h-10 rounded-full object-cover mr-3" onerror="this.onerror=null;this.src='https://placehold.co/40x40/27272A/FFFFFF?text=NF';">
                    <div>
                        <div class="font-medium text-white">${portfolio.name}</div>
                        ${portfolio.isUnilab ? '<span class="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">UNILAB</span>' : ''}
                    </div>
                </td>
                <td>${portfolio.profession}</td>
                <td>${portfolio.city}, ${portfolio.state}<br><span class="text-xs text-gray-400">${portfolio.country}</span></td>
                <td>${portfolio.availability}</td>
                <td>${portfolio.rating ? generateRatingStars(portfolio.rating) : 'Sem avaliações'}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="text-blue-400 hover:text-blue-300 edit-btn" data-id="${portfolio.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-400 hover:text-red-300 delete-btn" data-id="${portfolio.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Adicionar event listeners para os botões de editar e excluir
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                openEditModal(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                deletePortfolio(id);
            });
        });
    };
    
    // Abrir modal de edição
    function openEditModal(id) {
        const portfolio = portfolios.find(p => p.id == id);
        if (!portfolio) return;
        
        // Preencher formulário de edição
        document.getElementById('edit-id').value = portfolio.id;
        document.getElementById('edit-name').value = portfolio.name;
        document.getElementById('edit-profession').value = portfolio.profession;
        document.getElementById('edit-country').value = portfolio.country;
        document.getElementById('edit-city').value = portfolio.city;
        document.getElementById('edit-availability').value = portfolio.availability;
        document.getElementById('edit-skills').value = portfolio.skills.join(', ');
        document.getElementById('edit-portfolioLink').value = portfolio.portfolioUrl;
        document.getElementById('edit-imageUrl').value = portfolio.imageUrl;
        document.getElementById('edit-description').value = portfolio.description || '';
        document.getElementById('edit-isUnilab').checked = portfolio.isUnilab;
        
        // Preencher estados
        const editStateSelect = document.getElementById('edit-state');
        editStateSelect.innerHTML = '';
        if (portfolio.country && statesByCountry[portfolio.country]) {
            statesByCountry[portfolio.country].forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                option.selected = state === portfolio.state;
                editStateSelect.appendChild(option);
            });
        }
        
        // Mostrar modal
        editModal.classList.remove('hidden');
    }
    
    // Fechar modal de edição
    function closeEditModal() {
        editModal.classList.add('hidden');
    }
    
    // Deletar portfólio
    function deletePortfolio(id) {
        if (confirm('Tem certeza que deseja excluir este portfólio?')) {
            const index = portfolios.findIndex(p => p.id == id);
            if (index !== -1) {
                // Verificar se o portfólio pertence ao usuário atual
                const user = getCurrentUser();
                if (user && portfolios[index].userId === user.id) {
                    // Atualizar status do usuário
                    updateUserPortfolioStatus(false);
                }
                
                portfolios.splice(index, 1);
                localStorage.setItem('portfoliosDB', JSON.stringify(portfolios));
                populateTable();
                calculateStats();
            }
        }
    }
    
    // Busca em tempo real
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:first-child .font-medium').textContent.toLowerCase();
                const profession = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || profession.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Formulário de adição de portfólio
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = getCurrentUser();
            if (!user) {
                alert('Você precisa estar logado para adicionar um portfólio.');
                return;
            }
            
            if (userHasPortfolio()) {
                alert('Você já possui um portfólio cadastrado. Cada usuário pode ter apenas um portfólio.');
                return;
            }

            const skillsValue = document.getElementById('dashboard-skills').value;
            const skillsArray = skillsValue ? skillsValue.split(',').map(skill => skill.trim()) : [];

            const newPortfolio = {
                id: Date.now(),
                name: document.getElementById('dashboard-clientName').value,
                profession: document.getElementById('dashboard-profession').value,
                country: document.getElementById('dashboard-country').value,
                state: document.getElementById('dashboard-state').value,
                city: document.getElementById('dashboard-city').value,
                availability: document.getElementById('dashboard-availability').value,
                skills: skillsArray,
                isUnilab: document.getElementById('dashboard-isUnilab').checked,
                imageUrl: document.getElementById('dashboard-imageUrl').value,
                portfolioUrl: document.getElementById('dashboard-portfolioLink').value,
                description: document.getElementById('dashboard-description').value,
                rating: 0, // Novo portfólio começa sem avaliações
                userId: user.id // Associar portfólio ao usuário
            };

            portfolios.unshift(newPortfolio);
            localStorage.setItem('portfoliosDB', JSON.stringify(portfolios));
            
            // Atualizar status do usuário
            updateUserPortfolioStatus(true);
            
            portfolioForm.reset();
            
            // Atualizar a tabela e estatísticas
            populateTable();
            calculateStats();
            
            alert('Portfólio adicionado com sucesso!');
        });
    }
    
    // Formulário de edição de portfólio
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('edit-id').value;
            const index = portfolios.findIndex(p => p.id == id);
            
            if (index !== -1) {
                const skillsValue = document.getElementById('edit-skills').value;
                const skillsArray = skillsValue ? skillsValue.split(',').map(skill => skill.trim()) : [];
                
                portfolios[index] = {
                    ...portfolios[index],
                    name: document.getElementById('edit-name').value,
                    profession: document.getElementById('edit-profession').value,
                    country: document.getElementById('edit-country').value,
                    state: document.getElementById('edit-state').value,
                    city: document.getElementById('edit-city').value,
                    availability: document.getElementById('edit-availability').value,
                    skills: skillsArray,
                    isUnilab: document.getElementById('edit-isUnilab').checked,
                    imageUrl: document.getElementById('edit-imageUrl').value,
                    portfolioUrl: document.getElementById('edit-portfolioLink').value,
                    description: document.getElementById('edit-description').value
                };
                
                localStorage.setItem('portfoliosDB', JSON.stringify(portfolios));
                populateTable();
                calculateStats();
                closeEditModal();
                
                alert('Portfólio atualizado com sucesso!');
            }
        });
    }
    
    // Botão de cancelar edição
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Inicializar o dashboard
    calculateStats();
    populateTable();
    loadUserData();
});
