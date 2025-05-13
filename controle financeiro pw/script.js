document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();
    updateBalance();
    populateCategorySelect();
    setTodayDate();
    checkBudgetAlerts();
});

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'Alimentação', budget: 0 },
    { name: 'Transporte', budget: 0 },
    { name: 'Lazer', budget: 0 },
    { name: 'Moradia', budget: 0 },
    { name: 'Outros', budget: 0 }
];

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const expense = {
        id: Date.now(),
        description: document.getElementById('description').value.trim(),
        date: document.getElementById('date').value,
        account: document.getElementById('account').value.trim(),
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value)
    };
    if (expense.amount <= 0) {
        alert('O valor deve ser maior que zero.');
        return;
    }
    expenses.push(expense);
    saveExpenses();
    updateBalance();
    checkBudgetAlerts();
    e.target.reset();
    setTodayDate();
    populateCategorySelect();
});

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function updateBalance() {
    const balance = expenses.reduce((acc, exp) => {
        return exp.type === 'entrada' ? acc + exp.amount : acc - exp.amount;
    }, 0);
    document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
}

function checkBudgetAlerts() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    categories.forEach(cat => {
        if (cat.budget > 0) {
            const totalSpent = expenses
                .filter(exp => exp.category === cat.name && exp.type === 'saida' && exp.date.startsWith(currentMonth))
                .reduce((sum, exp) => sum + exp.amount, 0);
            if (totalSpent > cat.budget) {
                alert(`Atenção: O orçamento de ${cat.name} (R$ ${cat.budget.toFixed(2)}) foi excedido! Total gasto: R$ ${totalSpent.toFixed(2)}.`);
            }
        }
    });
}

function loadCategories() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${cat.name} (Orçamento: R$ ${cat.budget.toFixed(2).replace('.', ',')})
            <div>
                <button onclick="editCategory('${cat.name}')"><i class="fas fa-edit"></i> Editar</button>
                <button onclick="deleteCategory('${cat.name}')"><i class="fas fa-trash"></i> Remover</button>
            </div>`;
        categoryList.appendChild(li);
    });
    populateCategorySelect();
}

function populateCategorySelect() {
    const select = document.getElementById('category');
    select.innerHTML = '<option value="">Selecione a Categoria</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('category-name').value.trim();
    const budget = parseFloat(document.getElementById('category-budget').value) || 0;
    if (categoryName === '') {
        alert('O nome da categoria não pode ser vazio.');
        return;
    }
    if (!categories.some(cat => cat.name === categoryName)) {
        categories.push({ name: categoryName, budget });
        saveCategories();
        loadCategories();
        e.target.reset();
    } else {
        alert('Categoria já existe!');
    }
});

function editCategory(oldName) {
    const newName = prompt('Novo nome da categoria:', oldName);
    const newBudget = parseFloat(prompt('Novo orçamento mensal (R$):', categories.find(cat => cat.name === oldName).budget)) || 0;
    if (newName && newName.trim() && !categories.some(cat => cat.name === newName && cat.name !== oldName)) {
        categories = categories.map(cat => cat.name === oldName ? { name: newName, budget: newBudget } : cat);
        expenses.forEach(exp => {
            if (exp.category === oldName) exp.category = newName;
        });
        saveCategories();
        saveExpenses();
        loadCategories();
        checkBudgetAlerts();
    } else if (newName) {
        alert('Categoria já existe ou nome inválido!');
    }
}

function deleteCategory(name) {
    if (confirm(`Deseja remover a categoria "${name}"?`)) {
        categories = categories.filter(cat => cat.name !== name);
        expenses = expenses.filter(exp => exp.category !== name);
        saveCategories();
        saveExpenses();
        loadCategories();
    }
}

let chartInstance = null;

function loadSummary() {
    const summaryMonth = document.getElementById('summary-month').value;
    let filteredExpenses = expenses;

    if (summaryMonth === 'current') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        filteredExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
    } else if (summaryMonth === 'annual') {
        const currentYear = new Date().getFullYear();
        filteredExpenses = expenses.filter(exp => exp.date.startsWith(currentYear));
    } else if (summaryMonth === 'custom') {
        const selectedMonths = Array.from(document.querySelectorAll('#month-checkboxes input:checked')).map(input => input.value);
        filteredExpenses = expenses.filter(exp => selectedMonths.some(month => exp.date.startsWith(month)));
    }

    const categoryTotals = categories.reduce((acc, cat) => {
        acc[cat.name] = filteredExpenses
            .filter(exp => exp.category === cat.name && exp.type === 'saida')
            .reduce((sum, exp) => sum + exp.amount, 0);
        return acc;
    }, {});

    const labels = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > 0);
    const data = labels.map(cat => categoryTotals[cat]);
    const backgroundColors = labels.map((_, i) => `hsl(${(i * 360) / labels.length}, 70%, 50%)`);

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(document.getElementById('category-chart'), {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: R$ ${context.raw.toFixed(2)} (${((context.raw / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
                    }
                }
            }
        }
    });

    const details = document.getElementById('summary-details');
    details.innerHTML = '<h3>Detalhes por Categoria</h3>';
    labels.forEach(cat => {
        details.innerHTML += `<p>${cat}: R$ ${categoryTotals[cat].toFixed(2).replace('.', ',')}</p>`;
    });
}

document.getElementById('summary-month').addEventListener('change', () => {
    const customMonthsDiv = document.getElementById('custom-months');
    if (document.getElementById('summary-month').value === 'custom') {
        customMonthsDiv.classList.remove('hidden');
        const months = [...new Set(expenses.map(exp => exp.date.slice(0, 7)))].sort();
        const checkboxes = document.getElementById('month-checkboxes');
        checkboxes.innerHTML = '';
        months.forEach(month => {
            checkboxes.innerHTML += `
                <label><input type="checkbox" value="${month}" onchange="loadSummary()"> ${month}</label>
            `;
        });
    } else {
        customMonthsDiv.classList.add('hidden');
        loadSummary();
    }
});

function generateReport(format) {
    const reportType = document.getElementById('report-type').value;
    const reportMonth = document.getElementById('report-month').value;
    let filteredExpenses = expenses;
    let title = '';

    if (reportType === 'monthly') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        filteredExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
        title = `Relatório do Mês Atual (${currentMonth})`;
    } else if (reportType === 'custom' && reportMonth) {
        filteredExpenses = expenses.filter(exp => exp.date.startsWith(reportMonth));
        title = `Relatório de ${reportMonth}`;
    } else if (reportType === 'annual') {
        const currentYear = new Date().getFullYear();
        filteredExpenses = expenses.filter(exp => exp.date.startsWith(currentYear));
        title = `Relatório Anual (${currentYear})`;
    } else {
        alert('Por favor, selecione um mês para o relatório personalizado.');
        return;
    }

    let totalEntrada = 0, totalSaida = 0;
    const reportLines = filteredExpenses.map(exp => {
        const amount = exp.amount.toFixed(2).replace('.', ',');
        if (exp.type === 'entrada') totalEntrada += exp.amount;
        else totalSaida += exp.amount;
        return `${exp.date} - ${exp.description} (${exp.category}, ${exp.account}): ${exp.type === 'entrada' ? '+' : '-'} R$ ${amount}`;
    });

    const reportSummary = [
        `Total Entradas: R$ ${totalEntrada.toFixed(2).replace('.', ',')}`,
        `Total Saídas: R$ ${totalSaida.toFixed(2).replace('.', ',')}`,
        `Saldo: R$ ${(totalEntrada - totalSaida).toFixed(2).replace('.', ',')}`
    ];

    if (format === 'screen') {
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = `<h3>${title}</h3>`;
        reportLines.forEach(line => {
            reportContent.innerHTML += `<p>${line}</p>`;
        });
        reportContent.innerHTML += `<h4>Resumo</h4>`;
        reportSummary.forEach(line => {
            reportContent.innerHTML += `<p>${line}</p>`;
        });
    } else if (format === 'pdf') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(title, 10, 10);
        doc.setFontSize(12);
        let y = 20;
        reportLines.forEach(line => {
            doc.text(line, 10, y);
            y += 10;
        });
        y += 10;
        doc.setFontSize(14);
        doc.text('Resumo', 10, y);
        y += 10;
        doc.setFontSize(12);
        reportSummary.forEach(line => {
            doc.text(line, 10, y);
            y += 10;
        });
        doc.save(`relatorio_${title.replace(/\s/g, '_')}.pdf`);
    } else if (format === 'csv') {
        const csvContent = [
            'Data,Descrição,Categoria,Conta,Tipo,Valor',
            ...filteredExpenses.map(exp => [
                exp.date,
                `"${exp.description}"`,
                exp.category,
                exp.account,
                exp.type,
                exp.amount.toFixed(2)
            ].join(',')),
            '',
            'Resumo',
            `Total Entradas,${totalEntrada.toFixed(2)}`,
            `Total Saídas,${totalSaida.toFixed(2)}`,
            `Saldo,${(totalEntrada - totalSaida).toFixed(2)}`
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${title.replace(/\s/g, '_')}.csv`;
        link.click();
    }
}

document.getElementById('report-type').addEventListener('change', () => {
    const reportMonthSelect = document.getElementById('report-month');
    if (document.getElementById('report-type').value === 'custom') {
        reportMonthSelect.classList.remove('hidden');
        const months = [...new Set(expenses.map(exp => exp.date.slice(0, 7)))].sort();
        reportMonthSelect.innerHTML = '<option value="">Selecione o Mês</option>';
        months.forEach(month => {
            reportMonthSelect.innerHTML += `<option value="${month}">${month}</option>`;
        });
    } else {
        reportMonthSelect.classList.add('hidden');
    }
});

function backupData() {
    const backup = {
        expenses,
        categories
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_financeiro_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            if (backup.expenses && backup.categories) {
                expenses = backup.expenses;
                categories = backup.categories;
                saveExpenses();
                saveCategories();
                loadCategories();
                updateBalance();
                checkBudgetAlerts();
                alert('Dados restaurados com sucesso!');
            } else {
                alert('Arquivo de backup inválido.');
            }
        } catch (err) {
            alert('Erro ao restaurar o backup: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function showCategories() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('categories-screen').classList.remove('hidden');
}

function showSummary() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('summary-screen').classList.remove('hidden');
    loadSummary();
}

function showReports() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('reports-screen').classList.remove('hidden');
}

function backToMain() {
    document.getElementById('categories-screen').classList.add('hidden');
    document.getElementById('summary-screen').classList.add('hidden');
    document.getElementById('reports-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
}