
const budgetInput = document.getElementById("budget");
const saveBudgetBtn = document.getElementById("saveBudget");
const expenseForm = document.getElementById("expenseForm");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");
const categorySummary = document.getElementById("categorySummary");

const totalBudget = document.getElementById("totalBudget");
const totalExpenses = document.getElementById("totalExpenses");
const remainingBalance = document.getElementById("remainingBalance");

let budget = Number(localStorage.getItem("studentBudget")) || 0;

let expenses = [];

try {
    expenses = JSON.parse(
        localStorage.getItem("studentExpenses") || "[]"
    );

    if (!Array.isArray(expenses)) {
        expenses = [];
    }
} catch {
    expenses = [];
}

const categories = [
    "Food", "Travel", "Education", "Shopping", "Others"
];

const formatMoney = amount =>
    "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// Set today's date
const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

expenseDate.value = localToday;
expenseDate.max = localToday;

// Save budget
saveBudgetBtn.addEventListener("click", () => {
    const value = budgetInput.value;

    if (value.trim() === "" || !Number.isFinite(Number(value)) ||
        Number(value) < 0) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = Number(value);
    localStorage.setItem("studentBudget", budget);

    updateDashboard();
    alert("Budget saved successfully!");
});

// Add expense
expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || !Number.isFinite(amount) || amount <= 0 ||
        !categories.includes(category) || !date ||
        date > localToday) {
        alert("Please enter valid expense details.");
        return;
    }

    const expense = {
        id: Date.now() + "-" + Math.random(),
        name: name,
        amount: amount,
        category: category,
        date: date
    };

    expenses.push(expense);

    saveExpenses();
    updateDashboard();

    expenseForm.reset();
    expenseDate.value = localToday;
});

// Save expenses
function saveExpenses() {
    localStorage.setItem(
        "studentExpenses",
        JSON.stringify(expenses)
    );
}

// Delete expense
function deleteExpense(id) {
    expenses = expenses.filter(item => item.id !== id);

    saveExpenses();
    updateDashboard();
}

// Update dashboard
function updateDashboard() {

    const month = localToday.slice(0, 7);

    const monthlyExpenses = expenses.filter(
        item => item.date.slice(0, 7) === month
    );

    const total = monthlyExpenses.reduce(
        (sum, item) => sum + item.amount, 0
    );

    totalBudget.textContent = formatMoney(budget);
    totalExpenses.textContent = formatMoney(total);
    remainingBalance.textContent = formatMoney(budget - total);

    renderExpenses();
    renderCategorySummary(monthlyExpenses);
}

// Display expense history
function renderExpenses() {

    expenseList.innerHTML = "";

    emptyMessage.style.display =
        expenses.length === 0 ? "block" : "none";

    const sortedExpenses = [...expenses].sort(
        (a, b) => b.date.localeCompare(a.date)
    );

    sortedExpenses.forEach(item => {

        const row = document.createElement("tr");

        const values = [
            item.name,
            item.category,
            item.date,
            formatMoney(item.amount)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteExpense(item.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        expenseList.appendChild(row);
    });
}

// Display category summary for current month
function renderCategorySummary(monthlyExpenses) {

    categorySummary.innerHTML = "";

    const totals = {};

    categories.forEach(category => {
        totals[category] = 0;
    });

    monthlyExpenses.forEach(item => {
        totals[item.category] += item.amount;
    });

    const maxAmount = Math.max(...Object.values(totals), 0);

    categories.forEach(category => {

        const amount = totals[category];

        const percentage = maxAmount > 0
            ? (amount / maxAmount) * 100
            : 0;

        const item = document.createElement("div");
        item.className = "summary-item";

        const label = document.createElement("div");
        label.className = "summary-label";

        const categoryName = document.createElement("span");
        categoryName.textContent = category;

        const categoryAmount = document.createElement("span");
        categoryAmount.textContent = formatMoney(amount);

        label.append(categoryName, categoryAmount);

        const progress = document.createElement("div");
        progress.className = "progress";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = percentage + "%";

        progress.appendChild(fill);
        item.append(label, progress);

        categorySummary.appendChild(item);
    });
}

// Load saved information
budgetInput.value = budget || "";

updateDashboard();
