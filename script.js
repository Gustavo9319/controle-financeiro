document.addEventListener('DOMContentLoaded', () => {
    // Esconder o menu de transações ao carregar a página
    const menu = document.getElementById('transaction-type-menu');
    if (menu) {
        menu.classList.add('hidden');
        console.log('Transaction menu initialized as hidden');
    }
    // Log initial localStorage state
    console.log('Initial localStorage state:', {
        expenses: localStorage.getItem('expenses'),
        accounts: localStorage.getItem('accounts'),
        incomeSources: localStorage.getItem('incomeSources'),
        patrimony: localStorage.getItem('patrimony'),
        personalCosts: localStorage.getItem('personalCosts')
    });
    updateMonthDisplay();
    updateBalances();
    populateAccounts();
    loadAccountsSection();
    loadExpensesSection();
    loadEntriesSection();
    loadIncomeSourcesSection();
    loadPatrimonySection();
    loadPersonalCostsSection();
    loadChart();

    // Adicionar evento para fechar o menu ao clicar fora
    document.addEventListener('click', (event) => {
        const menu = document.getElementById('transaction-type-menu');
        const plusButton = document.querySelector('.menu-plus');
        const monthPickerModal = document.getElementById('month-picker-modal');

        console.log('Click detected. Target:', event.target, 'Menu visible:', menu && !menu.classList.contains('hidden'));
        if (menu && !menu.classList.contains('hidden') && !menu.contains(event.target) && !plusButton.contains(event.target)) {
            console.log('Closing transaction menu');
            menu.classList.add('hidden');
        }

        if (monthPickerModal && !monthPickerModal.classList.contains('hidden') && !monthPickerModal.contains(event.target) && !event.target.closest('#current-month')) {
            console.log('Clicou fora do modal de mês/ano, fechando...');
            monthPickerModal.classList.add('hidden');
        }
    });
});

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [
    { name: 'Espécie', balance: 0 },
    { name: 'Espécie 105', balance: 0 },
    { name: 'Espécie 107', balance: 0 },
    { name: 'Espécie 121', balance: 0 }
];

// Inicializar arrays para as novas seções se não existirem
let incomeSources = JSON.parse(localStorage.getItem('incomeSources')) || [];
let patrimony = JSON.parse(localStorage.getItem('patrimony')) || [];
let personalCosts = JSON.parse(localStorage.getItem('personalCosts')) || [];

// Log initial data after parsing
console.log('Initial data after parsing:', { expenses, accounts, incomeSources, patrimony, personalCosts });

const monthMap = {
    'Janeiro': '01',
    'Fevereiro': '02',
    'Março': '03',
    'Abril': '04',
    'Maio': '05',
    'Junho': '06',
    'Julho': '07',
    'Agosto': '08',
    'Setembro': '09',
    'Outubro': '10',
    'Novembro': '11',
    'Dezembro': '12'
};

function saveData() {
    console.log('Attempting to save to localStorage:', { expenses, accounts, incomeSources, patrimony, personalCosts });
    try {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('accounts', JSON.stringify(accounts));
        localStorage.setItem('incomeSources', JSON.stringify(incomeSources));
        localStorage.setItem('patrimony', JSON.stringify(patrimony));
        localStorage.setItem('personalCosts', JSON.stringify(personalCosts));
        console.log('Successfully saved to localStorage:', {
            expenses: localStorage.getItem('expenses'),
            accounts: localStorage.getItem('accounts'),
            incomeSources: localStorage.getItem('incomeSources'),
            patrimony: localStorage.getItem('patrimony'),
            personalCosts: localStorage.getItem('personalCosts')
        });
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function updateMonthDisplay() {
    const now = new Date();
    const month = now.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + now.toLocaleString('pt-BR', { month: 'long' }).slice(1);
    const year = now.getFullYear();
    const monthValue = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('current-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('accounts-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('entries-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('expenses-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('transactions-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('entry-month').innerHTML = `<i class="fas fa-calendar-alt"></i> Total <i class="fas fa-chevron-down"></i>`;
    document.getElementById('chart-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('income-sources-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('patrimony-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('personal-costs-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${month}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('month-select').value = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('year-select').value = year;
}

function showMonthPickerModal() {
    const modal = document.getElementById('month-picker-modal');
    modal.classList.remove('hidden');
}

function applyMonthYearSelection() {
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    const monthName = new Date(`${year}-${month}-01`).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(`${year}-${month}-01`).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('current-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('month-picker-modal').classList.add('hidden');
    updateBalances();
    loadAccountsSection();
    loadExpensesSection();
    loadEntriesSection();
    loadChart();
}

function updateMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('current-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    updateBalances();
    loadAccountsSection();
    loadExpensesSection();
    loadEntriesSection();
    loadChart();
}

function updateBalances() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from current-month:', document.getElementById('current-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    console.log('Updating balances for month:', currentMonth, 'Expenses:', expenses);
    accounts.forEach(acc => {
        acc.balance = expenses
            .filter(e => e.account === acc.name && e.date.startsWith(currentMonth))
            .reduce((sum, e) => sum + e.amount, 0);
        console.log(`Balance for ${acc.name}: ${acc.balance}`);
    });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = expenses.filter(e => e.type === 'entrada' && e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'saida' && e.date.startsWith(currentMonth)).reduce((sum, e) => sum - e.amount, 0);
    console.log('Balances calculated:', { totalBalance, totalIncome, totalExpense });
    document.getElementById('total-balance').textContent = `R$ ${totalBalance.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-income').textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-expense').textContent = `R$ ${totalExpense.toFixed(2).replace('.', ',')}`;
    document.getElementById('accounts-balance').textContent = `R$ ${totalBalance.toFixed(2).replace('.', ',')}`;
    document.getElementById('transactions-balance').textContent = `R$ ${totalBalance.toFixed(2).replace('.', ',')}`;
    loadAccountsSection();
}

function loadAccountsSection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from current-month:', document.getElementById('current-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    const totalBalance = accounts.reduce((sum, acc) => {
        acc.balance = expenses
            .filter(e => e.account === acc.name && e.date.startsWith(currentMonth))
            .reduce((sum, e) => sum + e.amount, 0);
        return sum + acc.balance;
    }, 0);
    const accountsHtml = accounts.map(acc => `
        <div class="section-item">
            <span class="section-item-text">${acc.name}</span>
            <span class="section-item-value">R$ ${acc.balance.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    console.log('Loading accounts section:', { currentMonth, accounts, accountsHtml });
    document.getElementById('accounts-list').innerHTML = accountsHtml;
    document.getElementById('accounts-total').textContent = `R$ ${totalBalance.toFixed(2).replace('.', ',')}`;
}

function showAccounts() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('accounts-screen').classList.remove('hidden');
    loadAccountsDetails();
}

function loadAccountsDetails() {
    const monthYear = document.getElementById('accounts-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from accounts-month:', document.getElementById('accounts-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    accounts.forEach(acc => {
        acc.balance = expenses
            .filter(e => e.account === acc.name && e.date.startsWith(currentMonth))
            .reduce((sum, e) => sum + e.amount, 0);
    });
    const accountsDetailsHtml = accounts.map(acc => `
        <div class="section-item">
            <span class="section-item-text">${acc.name}</span>
            <span class="section-item-value">R$ ${acc.balance.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    console.log('Loading accounts details:', { currentMonth, accounts, accountsDetailsHtml });
    document.getElementById('accounts-details').innerHTML = accountsDetailsHtml;
}

function showEntries() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('entries-screen').classList.remove('hidden');
    loadEntriesList();
}

function loadEntriesList() {
    const monthYear = document.getElementById('entries-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from entries-month:', document.getElementById('entries-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    const entries = expenses.filter(e => e.type === 'entrada' && e.date.startsWith(currentMonth));
    const entriesTotal = entries.reduce((sum, e) => sum + e.amount, 0);
    const entriesHtml = entries.map(e => `
        <div class="section-item">
            <span class="section-item-text">${e.date} - ${e.description} (${e.category})</span>
            <span class="section-item-value">R$ ${e.amount.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    console.log('Loading entries list:', { currentMonth, entries, entriesTotal, entriesHtml });
    document.getElementById('entries-total').textContent = `R$ ${entriesTotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('entries-list').innerHTML = entriesHtml;
}

function showExpenses() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('expenses-screen').classList.remove('hidden');
    loadExpensesList();
}

function loadExpensesList() {
    const monthYear = document.getElementById('expenses-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from expenses-month:', document.getElementById('expenses-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    const expensesList = expenses.filter(e => e.type === 'saida' && e.date.startsWith(currentMonth));
    const expensesTotal = expensesList.reduce((sum, e) => sum - e.amount, 0);
    const expensesHtml = expensesList.map(e => `
        <div class="section-item">
            <span class="section-item-text">${e.date} - ${e.description} (${e.category})</span>
            <span class="section-item-value">R$ ${Math.abs(e.amount).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    console.log('Loading expenses list:', { currentMonth, expensesList, expensesTotal, expensesHtml });
    document.getElementById('expenses-total').textContent = `R$ ${expensesTotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('expenses-list').innerHTML = expensesHtml;
}

function loadExpensesSection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from current-month:', document.getElementById('current-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    const expenseEntries = expenses.filter(e => e.type === 'saida' && e.date.startsWith(currentMonth));
    const expensesTotal = expenseEntries.reduce((sum, e) => sum - e.amount, 0);
    const expensesHtml = expenseEntries.map(e => `
        <div class="section-item">
            <span class="section-item-text">${e.date} - ${e.description}</span>
            <span class="section-item-value">R$ ${Math.abs(e.amount).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    console.log('Loading expenses section:', { currentMonth, expenseEntries, expensesTotal, expensesHtml });
    document.getElementById('expenses-list').innerHTML = expensesHtml;
    document.getElementById('expenses-total').textContent = `R$ ${expensesTotal.toFixed(2).replace('.', ',')}`;
}

function showManageAccounts() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('manage-accounts-screen').classList.remove('hidden');
    loadAccountList();
}

function loadAccountList() {
    const accountList = document.getElementById('account-list');
    const accountListHtml = accounts.map(acc => `
        <li>
            ${acc.name} (R$ ${acc.balance.toFixed(2).replace('.', ',')})
            <div>
                <button onclick="editAccount('${acc.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteAccount('${acc.name}')"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `).join('');
    console.log('Loading account list:', { accounts, accountListHtml });
    accountList.innerHTML = accountListHtml;
}

document.getElementById('account-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('account-name').value.trim();
    if (name && !accounts.some(acc => acc.name === name)) {
        accounts.push({ name, balance: 0 });
        saveData();
        loadAccountList();
        populateAccounts();
        e.target.reset();
    } else {
        alert('Conta já existe!');
    }
});

function editAccount(oldName) {
    const newName = prompt('Novo nome da conta:', oldName);
    if (newName && newName.trim() && !accounts.some(acc => acc.name === newName && acc.name !== oldName)) {
        accounts = accounts.map(acc => acc.name === oldName ? { ...acc, name: newName } : acc);
        expenses.forEach(exp => {
            if (exp.account === oldName) exp.account = newName;
        });
        saveData();
        loadAccountList();
        populateAccounts();
    } else if (newName) {
        alert('Conta já existe ou nome inválido!');
    }
}

function deleteAccount(name) {
    if (confirm(`Deseja remover a conta "${name}"?`)) {
        accounts = accounts.filter(acc => acc.name !== name);
        expenses = expenses.filter(exp => exp.account !== name);
        saveData();
        loadAccountList();
        populateAccounts();
    }
}

function populateAccounts() {
    const selects = [document.getElementById('expense-account'), document.getElementById('entry-account')];
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione a Conta</option>';
            accounts.forEach(acc => {
                const option = document.createElement('option');
                option.value = acc.name;
                option.textContent = acc.name;
                select.appendChild(option);
            });
        }
    });
    console.log('Accounts populated:', accounts);
}

function showTransactions() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('transactions-screen').classList.remove('hidden');
    loadTransactionList();
}

function loadTransactionList() {
    const monthYear = document.getElementById('transactions-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) {
        console.error('Failed to parse month/year from transactions-month:', document.getElementById('transactions-month').textContent);
        return;
    }
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) {
        console.error('Invalid month name:', monthName);
        return;
    }
    const currentMonth = `${year}-${monthNumber}`;
    const transactions = expenses.filter(e => e.date.startsWith(currentMonth));
    
    // Ordenar transações por data (mais recentes primeiro)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const transactionListHtml = transactions.map(e => {
        // Determinar a seção baseada no campo section
        let sectionText = '';
        if (e.section === 'incomeSources') {
            sectionText = `Fonte de Renda: ${e.category}`;
        } else if (e.section === 'patrimony') {
            sectionText = `Patrimônio: ${e.category}`;
        } else if (e.section === 'personalCosts') {
            sectionText = `Custos Pessoais: ${e.category}`;
        } else {
            // Para transações antigas que podem não ter seção definida
            sectionText = e.category || 'Sem categoria';
        }
        
        // Determinar o símbolo e cor baseado no tipo
        const isEntry = e.type === 'entrada';
        const symbol = isEntry ? '+' : '-';
        const colorClass = isEntry ? 'entry-value' : 'expense-value';
        
        return `
            <div class="section-item">
                <div class="transaction-details">
                    <div class="transaction-main">${e.date} - ${e.description}</div>
                    <div class="transaction-info">Conta: ${e.account} | ${sectionText}</div>
                </div>
                <span class="section-item-value ${colorClass}">${symbol}R$ ${Math.abs(e.amount).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    console.log('Loading transaction list:', { currentMonth, transactions, transactionListHtml });
    document.getElementById('transaction-list').innerHTML = transactionListHtml;
}

function showRegisterExpense() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('register-expense-screen').classList.remove('hidden');
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('expense-amount').value = '';
    document.getElementById('transaction-type-menu').classList.add('hidden');
    console.log('Showing expense registration screen');
}

function showRegisterEntry() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('register-entry-screen').classList.remove('hidden');
    document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('entry-amount').value = '';
    document.getElementById('transaction-type-menu').classList.add('hidden');
    console.log('Showing entry registration screen');
}

function toggleTransactionMenu() {
    const menu = document.getElementById('transaction-type-menu');
    console.log('Toggling transaction menu. Current state: hidden=', menu.classList.contains('hidden'));
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        console.log('Menu opened');
    } else {
        menu.classList.add('hidden');
        console.log('Menu closed');
    }
}

function backToMain() {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById('main-screen').classList.remove('hidden');
    updateBalances();
    loadAccountsSection();
    loadExpensesSection();
    loadEntriesSection();
    loadIncomeSourcesSection();
    loadPatrimonySection();
    loadPersonalCostsSection();
    loadChart();
}

// Funções para as novas seções
function loadEntriesSection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) return;
    
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) return;
    
    const currentMonth = `${year}-${monthNumber}`;
    const entries = expenses.filter(e => e.type === 'entrada' && e.date.startsWith(currentMonth));
    const entriesTotal = entries.reduce((sum, e) => sum + e.amount, 0);
    
    const entriesHtml = entries.map(e => `
        <div class="section-item">
            <span class="section-item-text">${e.date} - ${e.description}</span>
            <span class="section-item-value">R$ ${e.amount.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    
    document.getElementById('entry-list').innerHTML = entriesHtml;
    document.getElementById('entry-total').textContent = `R$ ${entriesTotal.toFixed(2).replace('.', ',')}`;
}

function loadIncomeSourcesSection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) return;
    
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) return;
    
    const currentMonth = `${year}-${monthNumber}`;
    
    const incomeSourcesHtml = incomeSources.map(source => {
        const sourceExpenses = expenses.filter(e => 
            e.section === 'incomeSources' && 
            e.category === source.name && 
            e.date.startsWith(currentMonth)
        );
        const total = sourceExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        return `
            <div class="section-item">
                <span class="section-item-text">${source.name}</span>
                <span class="section-item-value">R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    const totalIncomeSources = incomeSources.reduce((sum, source) => {
        const sourceExpenses = expenses.filter(e => 
            e.section === 'incomeSources' && 
            e.category === source.name && 
            e.date.startsWith(currentMonth)
        );
        return sum + sourceExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, 0);
    
    document.getElementById('income-sources-list').innerHTML = incomeSourcesHtml;
    document.getElementById('income-sources-total').textContent = `R$ ${totalIncomeSources.toFixed(2).replace('.', ',')}`;
}

function loadPatrimonySection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) return;
    
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) return;
    
    const currentMonth = `${year}-${monthNumber}`;
    
    const patrimonyHtml = patrimony.map(item => {
        const itemExpenses = expenses.filter(e => 
            e.section === 'patrimony' && 
            e.category === item.name && 
            e.date.startsWith(currentMonth)
        );
        const total = itemExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        return `
            <div class="section-item">
                <span class="section-item-text">${item.name}</span>
                <span class="section-item-value">R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    const totalPatrimony = patrimony.reduce((sum, item) => {
        const itemExpenses = expenses.filter(e => 
            e.section === 'patrimony' && 
            e.category === item.name && 
            e.date.startsWith(currentMonth)
        );
        return sum + itemExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, 0);
    
    document.getElementById('patrimony-list').innerHTML = patrimonyHtml;
    document.getElementById('patrimony-total').textContent = `R$ ${totalPatrimony.toFixed(2).replace('.', ',')}`;
}

function loadPersonalCostsSection() {
    const monthYear = document.getElementById('current-month').textContent.match(/([A-Za-z]+)\/(\d+)/);
    if (!monthYear) return;
    
    const monthName = monthYear[1];
    const year = monthYear[2];
    const monthNumber = monthMap[monthName];
    if (!monthNumber) return;
    
    const currentMonth = `${year}-${monthNumber}`;
    
    const personalCostsHtml = personalCosts.map(cost => {
        const costExpenses = expenses.filter(e => 
            e.section === 'personalCosts' && 
            e.category === cost.name && 
            e.date.startsWith(currentMonth)
        );
        const total = costExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        return `
            <div class="section-item">
                <span class="section-item-text">${cost.name}</span>
                <span class="section-item-value">R$ ${Math.abs(total).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    const totalPersonalCosts = personalCosts.reduce((sum, cost) => {
        const costExpenses = expenses.filter(e => 
            e.section === 'personalCosts' && 
            e.category === cost.name && 
            e.date.startsWith(currentMonth)
        );
        return sum + costExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, 0);
    
    document.getElementById('personal-costs-list').innerHTML = personalCostsHtml;
    document.getElementById('personal-costs-total').textContent = `R$ ${Math.abs(totalPersonalCosts).toFixed(2).replace('.', ',')}`;
}

// Funções de gerenciamento das novas seções
function showManageIncomeSources() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('manage-income-sources-screen').classList.remove('hidden');
    loadIncomeSourceList();
}

function loadIncomeSourceList() {
    const list = document.getElementById('income-source-list');
    const listHtml = incomeSources.map(source => `
        <li>
            ${source.name}
            <div>
                <button onclick="editIncomeSource('${source.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteIncomeSource('${source.name}')"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `).join('');
    list.innerHTML = listHtml;
}

function showManagePatrimony() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('manage-patrimony-screen').classList.remove('hidden');
    loadPatrimonyList();
}

function loadPatrimonyList() {
    const list = document.getElementById('patrimony-list');
    const listHtml = patrimony.map(item => `
        <li>
            ${item.name}
            <div>
                <button onclick="editPatrimony('${item.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="deletePatrimony('${item.name}')"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `).join('');
    list.innerHTML = listHtml;
}

function showManagePersonalCosts() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('manage-personal-costs-screen').classList.remove('hidden');
    loadPersonalCostList();
}

function loadPersonalCostList() {
    const list = document.getElementById('personal-cost-list');
    const listHtml = personalCosts.map(cost => `
        <li>
            ${cost.name}
            <div>
                <button onclick="editPersonalCost('${cost.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="deletePersonalCost('${cost.name}')"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `).join('');
    list.innerHTML = listHtml;
}

// Event listeners para os formulários das novas seções
document.getElementById('income-source-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('income-source-name').value.trim();
    if (name && !incomeSources.some(source => source.name === name)) {
        incomeSources.push({ name });
        saveData();
        loadIncomeSourceList();
        populateExpenseCategories();
        e.target.reset();
    } else {
        alert('Fonte de renda já existe!');
    }
});

document.getElementById('patrimony-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('patrimony-name').value.trim();
    if (name && !patrimony.some(item => item.name === name)) {
        patrimony.push({ name });
        saveData();
        loadPatrimonyList();
        populateExpenseCategories();
        e.target.reset();
    } else {
        alert('Patrimônio já existe!');
    }
});

document.getElementById('personal-cost-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('personal-cost-name').value.trim();
    if (name && !personalCosts.some(cost => cost.name === name)) {
        personalCosts.push({ name });
        saveData();
        loadPersonalCostList();
        populateExpenseCategories();
        e.target.reset();
    } else {
        alert('Custo pessoal já existe!');
    }
});

// Funções de edição e exclusão
function editIncomeSource(oldName) {
    const newName = prompt('Novo nome da fonte de renda:', oldName);
    if (newName && newName.trim() && !incomeSources.some(source => source.name === newName && source.name !== oldName)) {
        incomeSources = incomeSources.map(source => source.name === oldName ? { name: newName } : source);
        expenses.forEach(exp => {
            if (exp.section === 'incomeSources' && exp.category === oldName) exp.category = newName;
        });
        saveData();
        loadIncomeSourceList();
        populateExpenseCategories();
    } else if (newName) {
        alert('Fonte de renda já existe ou nome inválido!');
    }
}

function deleteIncomeSource(name) {
    if (confirm(`Deseja remover a fonte de renda "${name}"?`)) {
        incomeSources = incomeSources.filter(source => source.name !== name);
        expenses = expenses.filter(exp => !(exp.section === 'incomeSources' && exp.category === name));
        saveData();
        loadIncomeSourceList();
        populateExpenseCategories();
    }
}

function editPatrimony(oldName) {
    const newName = prompt('Novo nome do patrimônio:', oldName);
    if (newName && newName.trim() && !patrimony.some(item => item.name === newName && item.name !== oldName)) {
        patrimony = patrimony.map(item => item.name === oldName ? { name: newName } : item);
        expenses.forEach(exp => {
            if (exp.section === 'patrimony' && exp.category === oldName) exp.category = newName;
        });
        saveData();
        loadPatrimonyList();
        populateExpenseCategories();
    } else if (newName) {
        alert('Patrimônio já existe ou nome inválido!');
    }
}

function deletePatrimony(name) {
    if (confirm(`Deseja remover o patrimônio "${name}"?`)) {
        patrimony = patrimony.filter(item => item.name !== name);
        expenses = expenses.filter(exp => !(exp.section === 'patrimony' && exp.category === name));
        saveData();
        loadPatrimonyList();
        populateExpenseCategories();
    }
}

function editPersonalCost(oldName) {
    const newName = prompt('Novo nome do custo pessoal:', oldName);
    if (newName && newName.trim() && !personalCosts.some(cost => cost.name === newName && cost.name !== oldName)) {
        personalCosts = personalCosts.map(cost => cost.name === oldName ? { name: newName } : cost);
        expenses.forEach(exp => {
            if (exp.section === 'personalCosts' && exp.category === oldName) exp.category = newName;
        });
        saveData();
        loadPersonalCostList();
        populateExpenseCategories();
    } else if (newName) {
        alert('Custo pessoal já existe ou nome inválido!');
    }
}

function deletePersonalCost(name) {
    if (confirm(`Deseja remover o custo pessoal "${name}"?`)) {
        personalCosts = personalCosts.filter(cost => cost.name !== name);
        expenses = expenses.filter(exp => !(exp.section === 'personalCosts' && exp.category === name));
        saveData();
        loadPersonalCostList();
        populateExpenseCategories();
    }
}

// Função para popular as categorias de despesa baseadas na seção selecionada
function populateExpenseCategories() {
    const sectionSelect = document.getElementById('expense-section');
    const categorySelect = document.getElementById('expense-category');
    
    if (sectionSelect && categorySelect) {
        sectionSelect.addEventListener('change', function() {
            const selectedSection = this.value;
            categorySelect.innerHTML = '<option value="">Selecione o item</option>';
            
            if (selectedSection === 'incomeSources') {
                incomeSources.forEach(source => {
                    const option = document.createElement('option');
                    option.value = source.name;
                    option.textContent = source.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else if (selectedSection === 'patrimony') {
                patrimony.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.name;
                    option.textContent = item.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else if (selectedSection === 'personalCosts') {
                personalCosts.forEach(cost => {
                    const option = document.createElement('option');
                    option.value = cost.name;
                    option.textContent = cost.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else {
                categorySelect.classList.add('hidden');
            }
        });
    }
}

// Função para popular as categorias de entrada baseadas na seção selecionada
function populateEntryCategories() {
    const sectionSelect = document.getElementById('entry-section');
    const categorySelect = document.getElementById('entry-category');
    
    if (sectionSelect && categorySelect) {
        sectionSelect.addEventListener('change', function() {
            const selectedSection = this.value;
            categorySelect.innerHTML = '<option value="">Selecione o item</option>';
            
            if (selectedSection === 'incomeSources') {
                incomeSources.forEach(source => {
                    const option = document.createElement('option');
                    option.value = source.name;
                    option.textContent = source.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else if (selectedSection === 'patrimony') {
                patrimony.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.name;
                    option.textContent = item.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else if (selectedSection === 'personalCosts') {
                personalCosts.forEach(cost => {
                    const option = document.createElement('option');
                    option.value = cost.name;
                    option.textContent = cost.name;
                    categorySelect.appendChild(option);
                });
                categorySelect.classList.remove('hidden');
            } else {
                categorySelect.classList.add('hidden');
            }
        });
    }
}

// Event listeners para os formulários de transação
document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Expense form submitted');
    const formData = {
        date: document.getElementById('expense-date').value,
        description: document.getElementById('expense-description').value.trim(),
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        account: document.getElementById('expense-account').value,
        section: document.getElementById('expense-section').value
    };
    console.log('Expense form data:', formData);
    const expense = {
        id: Date.now(),
        date: formData.date,
        description: formData.description,
        category: formData.category,
        account: formData.account,
        section: formData.section,
        type: 'saida',
        amount: -Math.abs(formData.amount)
    };
    console.log('Constructed expense object:', expense);
    if (isNaN(expense.amount) || expense.amount === 0) {
        console.log('Validation failed: Invalid or zero amount');
        alert('O valor deve ser maior que zero.');
        return;
    }
    if (!expense.category || !expense.account || !expense.section) {
        console.log('Validation failed: Missing category, account or section');
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    console.log('Current expenses before push:', expenses);
    expenses.push(expense);
    console.log('Expenses after push:', expenses);
    saveData();
    backToMain();
    updateBalances();
    loadIncomeSourcesSection();
    loadPatrimonySection();
    loadPersonalCostsSection();
    loadChart();
});

document.getElementById('entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Entry form submitted');
    const formData = {
        date: document.getElementById('entry-date').value,
        description: document.getElementById('entry-description').value.trim(),
        amount: parseFloat(document.getElementById('entry-amount').value),
        category: document.getElementById('entry-category').value,
        account: document.getElementById('entry-account').value,
        section: document.getElementById('entry-section').value
    };
    console.log('Entry form data:', formData);
    const entry = {
        id: Date.now(),
        date: formData.date,
        description: formData.description,
        category: formData.category,
        account: formData.account,
        section: formData.section,
        type: 'entrada',
        amount: Math.abs(formData.amount)
    };
    console.log('Constructed entry object:', entry);
    if (isNaN(entry.amount) || entry.amount === 0) {
        console.log('Validation failed: Invalid or zero amount');
        alert('O valor deve ser maior que zero.');
        return;
    }
    if (!entry.category || !entry.account || !entry.section) {
        console.log('Validation failed: Missing category, account or section');
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    console.log('Current expenses before push:', expenses);
    expenses.push(entry);
    console.log('Expenses after push:', expenses);
    saveData();
    backToMain();
    updateBalances();
    loadEntriesSection();
    loadIncomeSourcesSection();
    loadPatrimonySection();
    loadPersonalCostsSection();
    loadChart();
});

// Função para carregar o gráfico (simplificada)
function loadChart() {
    // Implementação básica do gráfico pode ser mantida ou simplificada
    console.log('Chart loading...');
}

// Funções para os seletores de mês das diferentes seções
function showAccountsMonthPicker() {
    document.getElementById('accounts-month-picker').classList.remove('hidden');
}

function updateAccountsMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('accounts-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadAccountsDetails();
}

function showEntriesMonthPicker() {
    document.getElementById('entries-month-picker').classList.remove('hidden');
}

function updateEntriesMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('entries-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadEntriesList();
}

function showExpensesMonthPicker() {
    document.getElementById('expenses-month-picker').classList.remove('hidden');
}

function updateExpensesMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('expenses-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadExpensesList();
}

function showTransactionsMonthPicker() {
    document.getElementById('transactions-month-picker').classList.remove('hidden');
}

function updateTransactionsMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('transactions-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadTransactionList();
}

function showEntryMonthPicker() {
    document.getElementById('entry-month-picker').classList.remove('hidden');
}

function updateEntryMonth(value) {
    if (value) {
        const [year, month] = value.split('-');
        const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
        document.getElementById('entry-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    } else {
        document.getElementById('entry-month').innerHTML = `<i class="fas fa-calendar-alt"></i> Total <i class="fas fa-chevron-down"></i>`;
    }
    loadEntriesSection();
}

function showChartMonthPicker() {
    document.getElementById('chart-month-picker').classList.remove('hidden');
}

function updateChartMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('chart-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadChart();
}

function showIncomeSourcesMonthPicker() {
    document.getElementById('income-sources-month-picker').classList.remove('hidden');
}

function updateIncomeSourcesMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('income-sources-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadIncomeSourcesSection();
}

function showPatrimonyMonthPicker() {
    document.getElementById('patrimony-month-picker').classList.remove('hidden');
}

function updatePatrimonyMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('patrimony-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadPatrimonySection();
}

function showPersonalCostsMonthPicker() {
    document.getElementById('personal-costs-month-picker').classList.remove('hidden');
}

function updatePersonalCostsMonth(value) {
    const [year, month] = value.split('-');
    const monthName = new Date(value).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(value).toLocaleString('pt-BR', { month: 'long' }).slice(1);
    document.getElementById('personal-costs-month').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName}/${year} <i class="fas fa-chevron-down"></i>`;
    loadPersonalCostsSection();
}

// Inicializar as funções de população quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    populateExpenseCategories();
    populateEntryCategories();
});




document.getElementById('clear-transactions-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todas as transações? Esta ação não pode ser desfeita.')) {
        // Filtrar as transações para manter apenas as que não são despesas ou entradas
        // As seções 'fontes de renda', 'patrimonio', 'Custos pessoais' e 'contas' são gerenciadas separadamente
        // e não são armazenadas diretamente na array 'expenses'.
        // A array 'expenses' contém apenas as transações de entrada e saída.
        expenses = [];
        saveData();
        updateBalances();
        loadAccountsSection();
        loadEntriesSection();
        loadIncomeSourcesSection();
        loadPatrimonySection();
        loadPersonalCostsSection();
        loadChart();
        alert('Todas as transações foram limpas, exceto os dados de Fontes de Renda, Patrimônio, Custos Pessoais e Contas.');
    }
});


