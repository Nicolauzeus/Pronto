// Sistema de autenticação e gerenciamento de usuários

// Estrutura de dados para usuários
const initialUsers = [
    {
        id: 1,
        email: "admin@pronto.com",
        password: "admin123", // Em produção, isso deve ser hash
        fullName: "Administrador Pronto",
        createdAt: new Date().toISOString(),
        hasPortfolio: false
    }
];

// Inicializar usuários no localStorage se não existirem
if (!localStorage.getItem('usersDB')) {
    localStorage.setItem('usersDB', JSON.stringify(initialUsers));
}

// Inicializar sessões se não existirem
if (!localStorage.getItem('sessionsDB')) {
    localStorage.setItem('sessionsDB', JSON.stringify([]));
}

// Função para registrar um novo usuário
function registerUser(email, password, fullName) {
    const users = JSON.parse(localStorage.getItem('usersDB') || '[]');
    
    // Verificar se o email já existe
    if (users.find(user => user.email === email)) {
        return false;
    }
    
    // Criar novo usuário
    const newUser = {
        id: Date.now(),
        email,
        password, // Em produção, deve ser hash
        fullName,
        createdAt: new Date().toISOString(),
        hasPortfolio: false
    };
    
    users.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(users));
    
    // Logar o usuário automaticamente após o registro
    createSession(newUser.id);
    
    return true;
}

// Função para fazer login
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('usersDB') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        createSession(user.id);
        return true;
    }
    
    return false;
}

// Função para criar uma sessão
function createSession(userId) {
    const sessions = JSON.parse(localStorage.getItem('sessionsDB') || '[]');
    
    // Remover sessões existentes para o mesmo usuário
    const filteredSessions = sessions.filter(s => s.userId !== userId);
    
    // Criar nova sessão
    const newSession = {
        userId,
        token: generateToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
    };
    
    filteredSessions.push(newSession);
    localStorage.setItem('sessionsDB', JSON.stringify(filteredSessions));
    localStorage.setItem('currentSession', JSON.stringify(newSession));
    
    return true;
}

// Função para fazer logout
function logoutUser() {
    const currentSession = JSON.parse(localStorage.getItem('currentSession') || 'null');
    
    if (currentSession) {
        const sessions = JSON.parse(localStorage.getItem('sessionsDB') || '[]');
        const filteredSessions = sessions.filter(s => s.token !== currentSession.token);
        localStorage.setItem('sessionsDB', JSON.stringify(filteredSessions));
    }
    
    localStorage.removeItem('currentSession');
    window.location.href = 'index.html';
}

// Função para verificar se há um usuário logado
function getCurrentUser() {
    const currentSession = JSON.parse(localStorage.getItem('currentSession') || 'null');
    
    if (!currentSession) {
        return null;
    }
    
    // Verificar se a sessão expirou
    if (new Date(currentSession.expiresAt) < new Date()) {
        logoutUser();
        return null;
    }
    
    const users = JSON.parse(localStorage.getItem('usersDB') || '[]');
    return users.find(user => user.id === currentSession.userId) || null;
}

// Função para verificar se o usuário atual tem um portfólio
function userHasPortfolio() {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.hasPortfolio || false;
}

// Função para atualizar o status de portfólio do usuário
function updateUserPortfolioStatus(hasPortfolio) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const users = JSON.parse(localStorage.getItem('usersDB') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        users[userIndex].hasPortfolio = hasPortfolio;
        localStorage.setItem('usersDB', JSON.stringify(users));
        return true;
    }
    
    return false;
}

// Função para gerar um token simples (em produção, use uma biblioteca adequada)
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Função para verificar autenticação em páginas protegidas
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Atualizar a interface com base no estado de autenticação
function updateAuthUI() {
    const user = getCurrentUser();
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    
    if (user) {
        if (userMenu) userMenu.classList.remove('hidden');
        if (authButtons) authButtons.classList.add('hidden');
        if (addPortfolioBtn) {
            if (userHasPortfolio()) {
                addPortfolioBtn.disabled = true;
                addPortfolioBtn.innerHTML = '<i class="fas fa-check"></i><span>Portfólio Adicionado</span>';
                addPortfolioBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
                addPortfolioBtn.classList.add('bg-gray-600', 'cursor-not-allowed');
            } else {
                addPortfolioBtn.disabled = false;
                addPortfolioBtn.innerHTML = '<i class="fas fa-plus"></i><span>Adicionar Portfólio</span>';
                addPortfolioBtn.classList.remove('bg-gray-600', 'cursor-not-allowed');
                addPortfolioBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
            }
        }
        
        document.getElementById('userName').textContent = user.fullName.split(' ')[0];
    } else {
        if (userMenu) userMenu.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
    }
}

// Configurar event listeners para o menu de usuário
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Menu dropdown do usuário
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
        
        // Fechar o dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Proteger botão de adicionar portfólio
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    if (addPortfolioBtn) {
        addPortfolioBtn.addEventListener('click', (e) => {
            const user = getCurrentUser();
            if (!user) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else if (userHasPortfolio()) {
                e.preventDefault();
                alert('Você já possui um portfólio cadastrado. Cada usuário pode ter apenas um portfólio.');
            }
        });
    }
});
