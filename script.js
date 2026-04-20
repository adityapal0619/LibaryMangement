/**
 * LuminaLibrary - Core Logic
 * Handles Data Persistence, UI Rendering, and CRUD Operations
 */

class LibraryApp {
    constructor() {
        this.data = this.loadData();
        this.currentSection = 'dashboard';
        this.init();
    }

    // --- DATA MANAGEMENT ---
    loadData() {
        const defaultData = {
            books: [
                { id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Literature', total: 5, available: 5 },
                { id: 'b2', title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', category: 'Science', total: 3, available: 1 },
                { id: 'b3', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Technology', total: 10, available: 8 }
            ],
            students: [
                { id: 's1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', issuedCount: 1 },
                { id: 's2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', issuedCount: 1 }
            ],
            transactions: [
                { id: 't1', bookId: 'b2', studentId: 's1', issueDate: '2024-04-10', dueDate: '2024-04-17', returnDate: null, fine: 0 },
                { id: 't2', bookId: 'b3', studentId: 's2', issueDate: '2024-04-12', dueDate: '2024-04-19', returnDate: null, fine: 0 }
            ],
            theme: 'light'
        };

        const saved = localStorage.getItem('lumina_data');
        return saved ? JSON.parse(saved) : defaultData;
    }

    saveData() {
        localStorage.setItem('lumina_data', JSON.stringify(this.data));
        this.renderAll();
    }

    // --- INITIALIZATION ---
    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.renderAll();
        lucide.createIcons();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateTo(section);
            });
        });

        // Mobile Menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('active');
        });
        document.getElementById('mobile-close').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
        });

        // Theme Toggle
        document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());

        // Forms
        document.getElementById('book-form').addEventListener('submit', (e) => this.handleBookSubmit(e));
        document.getElementById('student-form').addEventListener('submit', (e) => this.handleStudentSubmit(e));
        document.getElementById('issue-form').addEventListener('submit', (e) => this.handleIssueSubmit(e));

        // Search
        document.getElementById('global-search').addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Chatbot
        document.getElementById('chatbot-trigger').addEventListener('click', () => this.toggleChatbot());
        document.getElementById('chatbot-toggle-btn').addEventListener('click', () => this.toggleChatbot());
        document.getElementById('chatbot-send').addEventListener('click', () => this.handleChatbotMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleChatbotMessage();
        });

        // Category Filter
        document.getElementById('book-category-filter').addEventListener('change', () => this.renderBooks());
    }

    // --- NAVIGATION ---
    navigateTo(sectionId) {
        this.currentSection = sectionId;
        
        // Update Nav Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Update Sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `${sectionId}-section`);
        });

        // Update Header Title
        const names = { dashboard: 'Dashboard', books: 'Book Management', students: 'Student Management', transactions: 'Issue & Return' };
        document.getElementById('section-title').textContent = names[sectionId];

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('active');
    }

    // --- THEME ---
    toggleTheme() {
        this.data.theme = this.data.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveData();
    }

    applyTheme() {
        document.body.className = this.data.theme + '-mode';
    }

    // --- BOOK CRUD ---
    handleBookSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('edit-book-id').value;
        const bookData = {
            id: id || 'b' + Date.now(),
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            isbn: document.getElementById('book-isbn').value,
            category: document.getElementById('book-category').value,
            total: parseInt(document.getElementById('book-quantity').value),
            available: parseInt(document.getElementById('book-quantity').value)
        };

        if (id) {
            const index = this.data.books.findIndex(b => b.id === id);
            // Adjust available count if total changed
            const diff = bookData.total - this.data.books[index].total;
            bookData.available = this.data.books[index].available + diff;
            this.data.books[index] = bookData;
            this.showToast('Book updated successfully!');
        } else {
            this.data.books.push(bookData);
            this.showToast('Book added successfully!');
        }

        this.saveData();
        this.closeModals();
        e.target.reset();
    }

    deleteBook(id) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.data.books = this.data.books.filter(b => b.id !== id);
            this.saveData();
            this.showToast('Book deleted.');
        }
    }

    editBook(id) {
        const book = this.data.books.find(b => b.id === id);
        if (!book) return;

        document.getElementById('book-modal-title').textContent = 'Edit Book';
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-category').value = book.category;
        document.getElementById('book-quantity').value = book.total;

        this.openModal('book-modal');
    }

    // --- STUDENT CRUD ---
    handleStudentSubmit(e) {
        e.preventDefault();
        const studentData = {
            id: 's' + Date.now(),
            name: document.getElementById('student-name').value,
            email: document.getElementById('student-email').value,
            phone: document.getElementById('student-phone').value,
            issuedCount: 0
        };

        this.data.students.push(studentData);
        this.saveData();
        this.closeModals();
        e.target.reset();
        this.showToast('Student registered successfully!');
    }

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.data.students = this.data.students.filter(s => s.id !== id);
            this.saveData();
            this.showToast('Student removed.');
        }
    }

    // --- TRANSACTION LOGIC ---
    handleIssueSubmit(e) {
        e.preventDefault();
        const studentId = document.getElementById('issue-student-id').value;
        const bookId = document.getElementById('issue-book-id').value;
        const dueDate = document.getElementById('issue-due-date').value;

        const book = this.data.books.find(b => b.id === bookId);
        const student = this.data.students.find(s => s.id === studentId);

        if (book.available <= 0) {
            this.showToast('Error: Book out of stock!', 'danger');
            return;
        }

        const transaction = {
            id: 't' + Date.now(),
            bookId,
            studentId,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate,
            returnDate: null,
            fine: 0
        };

        book.available--;
        student.issuedCount++;
        this.data.transactions.push(transaction);
        
        this.saveData();
        this.closeModals();
        e.target.reset();
        this.showToast('Book issued successfully!');
    }

    returnBook(transactionId) {
        const trans = this.data.transactions.find(t => t.id === transactionId);
        const book = this.data.books.find(b => b.id === trans.bookId);
        const student = this.data.students.find(s => s.id === trans.studentId);

        trans.returnDate = new Date().toISOString().split('T')[0];
        trans.fine = this.calculateFine(trans.dueDate);
        
        book.available++;
        student.issuedCount--;

        this.saveData();
        this.showToast('Book returned successfully!');
    }

    calculateFine(dueDateStr) {
        const dueDate = new Date(dueDateStr);
        const today = new Date();
        if (today <= dueDate) return 0;

        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * 1; // $1 per day
    }

    // --- UI RENDERING ---
    renderAll() {
        this.renderStats();
        this.renderBooks();
        this.renderStudents();
        this.renderTransactions();
        this.populateDropdowns();
    }

    renderStats() {
        const totalBooks = this.data.books.reduce((acc, b) => acc + b.total, 0);
        const issuedBooks = this.data.transactions.filter(t => !t.returnDate).length;
        const totalStudents = this.data.students.length;
        const totalFines = this.data.transactions.reduce((acc, t) => acc + (t.fine || 0), 0);

        document.getElementById('stat-total-books').textContent = totalBooks;
        document.getElementById('stat-issued-books').textContent = issuedBooks;
        document.getElementById('stat-total-students').textContent = totalStudents;
        document.getElementById('stat-total-fines').textContent = `$${totalFines.toFixed(2)}`;

        // Recent Transactions on Dashboard
        const recent = [...this.data.transactions].reverse().slice(0, 5);
        const tbody = document.querySelector('#recent-transactions-table tbody');
        tbody.innerHTML = recent.map(t => {
            const b = this.data.books.find(book => book.id === t.bookId);
            const s = this.data.students.find(stu => stu.id === t.studentId);
            return `
                <tr>
                    <td>${b ? b.title : 'Deleted Book'}</td>
                    <td>${s ? s.name : 'Unknown'}</td>
                    <td>${t.issueDate}</td>
                    <td><span class="badge ${t.returnDate ? 'badge-success' : 'badge-warning'}">${t.returnDate ? 'Returned' : 'Issued'}</span></td>
                </tr>
            `;
        }).join('');
    }

    renderBooks() {
        const list = document.getElementById('books-list');
        const filter = document.getElementById('book-category-filter').value;
        const searchQuery = document.getElementById('global-search').value.toLowerCase();

        let filtered = this.data.books.filter(b => {
            const matchesCat = filter === 'all' || b.category.toLowerCase() === filter;
            const matchesSearch = b.title.toLowerCase().includes(searchQuery) || b.isbn.includes(searchQuery);
            return matchesCat && matchesSearch;
        });

        list.innerHTML = filtered.map(b => `
            <tr>
                <td>${b.isbn}</td>
                <td><div style="font-weight: 600;">${b.title}</div></td>
                <td>${b.author}</td>
                <td><span class="badge" style="background:rgba(99,102,241,0.05); color:var(--primary); border:1px solid var(--border)">${b.category}</span></td>
                <td>${b.available} / ${b.total}</td>
                <td><span class="badge ${b.available > 0 ? 'badge-success' : 'badge-danger'}">${b.available > 0 ? 'Available' : 'Out of Stock'}</span></td>
                <td>
                    <div style="display:flex; gap:0.5rem">
                        <button class="btn-icon edit-btn" onclick="app.editBook('${b.id}')"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon delete-btn" onclick="app.deleteBook('${b.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    }

    renderStudents() {
        const list = document.getElementById('students-list');
        list.innerHTML = this.data.students.map(s => `
            <tr>
                <td>${s.id}</td>
                <td><div style="font-weight: 600;">${s.name}</div></td>
                <td>${s.email}</td>
                <td>${s.issuedCount}</td>
                <td>
                    <button class="btn-icon delete-btn" onclick="app.deleteStudent('${s.id}')"><i data-lucide="user-minus"></i></button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    }

    renderTransactions() {
        const list = document.getElementById('transactions-list');
        list.innerHTML = this.data.transactions.map(t => {
            const b = this.data.books.find(book => book.id === t.bookId);
            const s = this.data.students.find(stu => stu.id === t.studentId);
            return `
                <tr>
                    <td>${t.id}</td>
                    <td>${b ? b.title : 'N/A'}</td>
                    <td>${s ? s.name : 'N/A'}</td>
                    <td>${t.issueDate}</td>
                    <td>${t.dueDate}</td>
                    <td><span class="text-${t.fine > 0 ? 'danger' : 'success'}">$${t.fine.toFixed(2)}</span></td>
                    <td>
                        ${t.returnDate ? 
                            `<span class="badge badge-success">Returned on ${t.returnDate}</span>` : 
                            `<button class="btn btn-primary btn-sm" onclick="app.returnBook('${t.id}')">Return Book</button>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }

    populateDropdowns() {
        const bookSelect = document.getElementById('issue-book-id');
        const stuSelect = document.getElementById('issue-student-id');

        bookSelect.innerHTML = this.data.books
            .filter(b => b.available > 0)
            .map(b => `<option value="${b.id}">${b.title} (${b.available} left)</option>`).join('');

        stuSelect.innerHTML = this.data.students
            .map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    // --- CHATBOT ---
    toggleChatbot() {
        document.getElementById('chatbot').classList.toggle('active');
    }

    handleChatbotMessage() {
        const input = document.getElementById('chatbot-input');
        const query = input.value.trim().toLowerCase();
        if (!query) return;

        this.addChatMessage(query, 'user');
        input.value = '';

        setTimeout(() => {
            let response = "I'm sorry, I don't understand that. You can ask about book availability, fines, or how to issue a book.";
            
            if (query.includes('hello') || query.includes('hi')) response = "Hello! How can I assist you with the library system today?";
            else if (query.includes('issue')) response = "To issue a book, go to the 'Issue/Return' section and click 'Issue Book'. Select a student and a book, then set a due date.";
            else if (query.includes('fine')) response = "Fines are calculated at $1.00 per day for every day a book is overdue.";
            else if (query.includes('how many books')) response = `We currently have ${this.data.books.length} unique titles in our collection.`;
            else if (query.includes('available')) response = "You can check book availability in the 'Books' section or the dashboard stats.";

            this.addChatMessage(response, 'bot');
        }, 600);
    }

    addChatMessage(text, side) {
        const box = document.getElementById('chatbot-messages');
        const msg = document.createElement('div');
        msg.className = `message ${side}`;
        msg.textContent = text;
        box.appendChild(msg);
        box.scrollTop = box.scrollHeight;
    }

    // --- UTILS ---
    handleGlobalSearch(val) {
        this.renderBooks();
    }

    openModal(id) {
        if (id === 'book-modal' && !document.getElementById('edit-book-id').value) {
            document.getElementById('book-modal-title').textContent = 'Add New Book';
            document.getElementById('book-form').reset();
        }
        document.getElementById(id).classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.style.background = type === 'danger' ? '#ef4444' : '#1e293b';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Global App Instance
const app = new LibraryApp();
