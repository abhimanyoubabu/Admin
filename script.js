const firebaseConfig = {
    apiKey: "AIzaSyCR6WyB_uwb-xO4EuFeqMVCLpurVCJFq6U",
    authDomain: "hompage-75ed5.firebaseapp.com",
    projectId: "hompage-75ed5",
    storageBucket: "hompage-75ed5.firebasestorage.app",
    messagingSenderId: "1010300996127",
    appId: "1:1010300996127:web:placeholder" // Replace with Web App ID when registered in Firebase Console
};

// Initialize Firebase using compat syntax
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase App Initialized: ", app.name);

document.addEventListener('DOMContentLoaded', () => {
    // ---- Elements ----
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
    const themeBtn = document.getElementById('theme-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const currentTheme = localStorage.getItem('theme');

    // ---- Sidebar Toggle ----
    toggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    // Mobile hamburger menu button
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !toggleBtn.contains(e.target) &&
            (!mobileMenuBtn || !mobileMenuBtn.contains(e.target)) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // ---- Theme Toggle ----
    // Initialize theme based on preference or local storage
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let nextTheme = theme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        updateThemeIcon(nextTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // ---- Active Nav Link highlighting ----
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');

            const linkText = this.querySelector('.link-text').innerText;
            const targetId = this.getAttribute('data-target');

            if (targetId) {
                document.querySelectorAll('.content-wrapper').forEach(wrapper => {
                    wrapper.style.display = 'none';
                });
                document.getElementById(targetId).style.display = 'block';
            } else if (linkText !== 'Dashboard') {
                alert(`${linkText} module is coming soon!`);
            }

            // Auto-close sidebar on mobile after selecting a page
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // ---- Responsive Handling on Resize ----
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active'); // Remove mobile class
        }
    });

    // ---- Button Placeholders & Interactive Elements ----
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#users-table-body tr, #all-users-table-body tr, #all-posts-table-body tr, #all-comments-table-body tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); alert("You have been logged out."); });

    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) notifBtn.addEventListener('click', () => alert("You have 3 unread notifications."));

    const viewAllMod = document.getElementById('view-all-moderation');
    if (viewAllMod) viewAllMod.addEventListener('click', (e) => {
        e.preventDefault();
        const reportsTab = document.querySelector('[data-target="view-reports"]');
        if (reportsTab) reportsTab.click();
    });

    const manageUsersBtn = document.getElementById('manage-users-btn');
    if (manageUsersBtn) manageUsersBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const usersTab = document.querySelector('[data-target="view-users"]');
        if (usersTab) usersTab.click();
    });

    // ---- Global Moderation Functions ----
    window.deletePost = async (id) => {
        if (confirm("Are you sure you want to permanently delete this post?")) {
            try {
                await firebase.firestore().collection("posts").doc(id).delete();
                fetchDashboardData();
            } catch (e) { console.error(e); alert("Error deleting post"); }
        }
    };

    window.togglePostStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
        try {
            await firebase.firestore().collection("posts").doc(id).set({ status: newStatus }, { merge: true });
            fetchDashboardData();
        } catch (e) { console.error(e); alert("Error updating status"); }
    };

    window.deleteComment = async (docPath) => {
        if (confirm("Are you sure you want to permanently delete this comment?")) {
            try {
                await firebase.firestore().doc(docPath).delete();
                fetchDashboardData();
            } catch (e) { console.error(e); alert("Error deleting comment"); }
        }
    };

    window.toggleCommentStatus = async (docPath, currentStatus) => {
        const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
        try {
            await firebase.firestore().doc(docPath).set({ status: newStatus }, { merge: true });
            fetchDashboardData();
        } catch (e) { console.error(e); alert("Error updating status"); }
    };

    window.dismissReport = async (reportId) => {
        if (confirm("Dismiss this report?")) {
            try {
                await firebase.firestore().collection("reports").doc(reportId).delete();
                fetchDashboardData();
            } catch (e) { console.error(e); alert("Error dismissing report"); }
        }
    };

    // ---- Fetch and Populate Dashboard Data ----
    async function fetchDashboardData() {
        try {
            // 1. Fetch Users
            const usersSnapshot = await db.collection("logins").get();
            const totalUsersEl = document.getElementById('total-users');
            if (totalUsersEl) totalUsersEl.textContent = usersSnapshot.size.toLocaleString();

            const usersTableBody = document.getElementById('users-table-body');
            const allUsersTableBody = document.getElementById('all-users-table-body');
            if (usersTableBody || allUsersTableBody) {
                if (usersTableBody) usersTableBody.innerHTML = '';
                if (allUsersTableBody) allUsersTableBody.innerHTML = '';

                let count = 0;
                usersSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const firstName = data.firstname || '';
                    const lastName = data.lastname || '';
                    const fullName = `${firstName} ${lastName}`.trim() || data.username || 'Unknown';
                    const email = data.email || 'No email';

                    let joinedDate = 'Unknown';
                    if (data.createdAt) {
                        try {
                            const date = data.createdAt.toDate();
                            joinedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch (e) { /* fallback if its mapped weirdly */ }
                    }

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random" alt="" class="avatar">
                                <div>
                                    <div class="user-name">${fullName}</div>
                                    <div class="user-email">${email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${joinedDate}</td>
                        <td>Member</td>
                        <td><span class="status badge-active">Active</span></td>
                        <td><button class="btn-outline" onclick="alert('Editing user: ${email}')">Edit</button></td>
                    `;

                    if (allUsersTableBody) allUsersTableBody.appendChild(tr.cloneNode(true));
                    if (usersTableBody && count < 5) usersTableBody.appendChild(tr);

                    count++;
                });
            }

            // 2. Fetch Posts
            const postsSnapshot = await db.collection("posts").get();
            const totalPostsEl = document.getElementById('total-posts');
            if (totalPostsEl) totalPostsEl.textContent = postsSnapshot.size.toLocaleString();

            const chartContainer = document.getElementById('engagement-chart');
            if (chartContainer) {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const sevenDaysData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    sevenDaysData.push({
                        dateString: d.toDateString(),
                        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        count: 0
                    });
                }

                postsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.timestamp) {
                        try {
                            const postDate = data.timestamp.toDate().toDateString();
                            const dayData = sevenDaysData.find(d => d.dateString === postDate);
                            if (dayData) dayData.count++;
                        } catch (e) { }
                    }
                });

                let maxCount = Math.max(...sevenDaysData.map(d => d.count));
                if (maxCount === 0) maxCount = 1;

                chartContainer.innerHTML = '';
                sevenDaysData.forEach((day, index) => {
                    let heightPerc = (day.count / maxCount) * 100;
                    if (heightPerc < 5 && day.count > 0) heightPerc = 5;
                    else if (day.count === 0) heightPerc = 2; // tiny bump to show 0 clearly

                    const bar = document.createElement('div');
                    bar.className = 'chart-bar';
                    bar.style.height = '0%';
                    bar.innerHTML = `<span>${day.label}</span>`;
                    bar.title = `${day.count} post(s)`;

                    chartContainer.appendChild(bar);

                    setTimeout(() => {
                        bar.style.height = `${heightPerc}%`;
                    }, 100 * (index + 1));
                });
            }

            const allPostsTableBody = document.getElementById('all-posts-table-body');
            if (allPostsTableBody) {
                allPostsTableBody.innerHTML = '';
                postsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const title = data.title || 'Untitled';
                    const content = data.content || '';
                    const username = data.username || 'Unknown';
                    const snippet = content.length > 50 ? content.substring(0, 50) + '...' : content;

                    let postDate = 'Unknown';
                    if (data.timestamp) {
                        try {
                            const date = data.timestamp.toDate();
                            postDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch (e) { }
                    }

                    const postStatus = data.status || 'active';
                    const isDeactivated = postStatus === 'deactivated';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <div>
                                    <div class="user-name">${title}</div>
                                    <div class="user-email">by ${username}</div>
                                </div>
                            </div>
                        </td>
                        <td>${postDate}</td>
                        <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${content.replace(/"/g, '&quot;')}">${snippet}</td>
                        <td><span class="status ${isDeactivated ? 'badge-suspended' : 'badge-active'}">${isDeactivated ? 'Deactivated' : 'Live'}</span></td>
                        <td style="display: flex; gap: 8px;">
                            <button class="btn-icon danger" title="Delete" onclick="window.deletePost('${doc.id}')"><i class="fa-solid fa-trash"></i></button>
                            <button class="btn-icon warning" title="${isDeactivated ? 'Activate' : 'Deactivate'}" onclick="window.togglePostStatus('${doc.id}', '${postStatus}')"><i class="fa-solid ${isDeactivated ? 'fa-check' : 'fa-ban'}"></i></button>
                        </td>
                    `;
                    allPostsTableBody.appendChild(tr);
                });
            }

            // 3. Fetch Comments Using Collection Group Query
            const commentsSnapshot = await db.collectionGroup("comments").get();
            const allCommentsTableBody = document.getElementById('all-comments-table-body');
            if (allCommentsTableBody) {
                allCommentsTableBody.innerHTML = '';
                commentsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const username = data.username || data.author || 'Unknown';
                    const content = data.content || data.text || '';
                    const snippet = content.length > 50 ? content.substring(0, 50) + '...' : content;

                    let commentDate = 'Unknown';
                    if (data.timestamp) {
                        try {
                            const date = data.timestamp.toDate();
                            commentDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch (e) { }
                    }

                    const commentStatus = data.status || 'active';
                    const isDeactivated = commentStatus === 'deactivated';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random" alt="" class="avatar">
                                <div>
                                    <div class="user-name">${username}</div>
                                    <div class="user-email">Member</div>
                                </div>
                            </div>
                        </td>
                        <td>${commentDate}</td>
                        <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${content.replace(/"/g, '&quot;')}">${snippet}</td>
                        <td><span class="status ${isDeactivated ? 'badge-suspended' : 'badge-active'}">${isDeactivated ? 'Deactivated' : 'Live'}</span></td>
                        <td style="display: flex; gap: 8px;">
                            <button class="btn-icon danger" title="Delete" onclick="window.deleteComment('${doc.ref.path}')"><i class="fa-solid fa-trash"></i></button>
                            <button class="btn-icon warning" title="${isDeactivated ? 'Activate' : 'Deactivate'}" onclick="window.toggleCommentStatus('${doc.ref.path}', '${commentStatus}')"><i class="fa-solid ${isDeactivated ? 'fa-check' : 'fa-ban'}"></i></button>
                        </td>
                    `;
                    allCommentsTableBody.appendChild(tr);
                });
            }

            // 4. Fetch Reports
            let reportsSnapshot;
            try {
                reportsSnapshot = await db.collection("reports").orderBy("timestamp", "desc").get();
            } catch (indexErr) {
                // Fallback if Firestore composite index is not yet created
                console.warn("Reports index not ready, fetching without order:", indexErr);
                reportsSnapshot = await db.collection("reports").get();
            }
            const totalReportsEl = document.getElementById('total-reports');
            const reportsBadge = document.getElementById('reports-badge');
            if (totalReportsEl) totalReportsEl.textContent = reportsSnapshot.size.toLocaleString();
            if (reportsBadge) reportsBadge.textContent = reportsSnapshot.size;

            // Build a quick lookup of post titles from already-fetched postsSnapshot
            const postTitleMap = {};
            postsSnapshot.forEach(doc => {
                postTitleMap[doc.id] = doc.data().title || 'Untitled';
            });

            // Populate the Moderation Queue on the dashboard (max 5)
            const moderationQueue = document.getElementById('moderation-queue');
            if (moderationQueue) {
                moderationQueue.innerHTML = '';
                if (reportsSnapshot.size === 0) {
                    moderationQueue.innerHTML = '<li class="activity-item" style="justify-content: center; padding: 2rem; color: #888;">No pending reports found</li>';
                } else {
                    let queueCount = 0;
                    reportsSnapshot.forEach(doc => {
                        if (queueCount >= 5) return;
                        const data = doc.data();
                        const postTitle = postTitleMap[data.postId] || 'Unknown Post';
                        const reason = data.reason || 'No reason given';
                        const li = document.createElement('li');
                        li.className = 'activity-item';
                        li.innerHTML = `
                            <div class="activity-content">
                                <h4><i class="fa-solid fa-flag" style="color: var(--danger); margin-right: 8px;"></i>${postTitle}</h4>
                                <p>${reason}</p>
                            </div>
                            <div class="activity-actions">
                                <button class="btn-icon danger" title="Dismiss" onclick="window.dismissReport('${doc.id}')"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        `;
                        moderationQueue.appendChild(li);
                        queueCount++;
                    });
                }
            }

            // Populate the full Reports table
            const allReportsTableBody = document.getElementById('all-reports-table-body');
            if (allReportsTableBody) {
                allReportsTableBody.innerHTML = '';
                reportsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const postTitle = postTitleMap[data.postId] || 'Unknown Post';
                    const userId = data.userId || 'Unknown';
                    const reason = data.reason || 'No reason';

                    let reportDate = 'Unknown';
                    if (data.timestamp) {
                        try {
                            const date = data.timestamp.toDate();
                            reportDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch (e) { }
                    }

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <div>
                                    <div class="user-name">${postTitle}</div>
                                    <div class="user-email">ID: ${data.postId || 'N/A'}</div>
                                </div>
                            </div>
                        </td>
                        <td>${userId}</td>
                        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${reason}">${reason}</td>
                        <td>${reportDate}</td>
                        <td style="display: flex; gap: 8px;">
                            <button class="btn-icon danger" title="Dismiss Report" onclick="window.dismissReport('${doc.id}')"><i class="fa-solid fa-xmark"></i></button>
                            <button class="btn-icon warning" title="Deactivate Post" onclick="window.togglePostStatus('${data.postId}', 'active')"><i class="fa-solid fa-ban"></i></button>
                            <button class="btn-icon primary" title="Delete Post" onclick="window.deletePost('${data.postId}')"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    `;
                    allReportsTableBody.appendChild(tr);
                });
            }

        } catch (error) {
            console.error("Error fetching dashboard data: ", error);
        }
    }

    // Trigger the data fetch
    fetchDashboardData();
});
