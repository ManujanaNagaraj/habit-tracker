document.addEventListener('DOMContentLoaded', () => {
    const habitInput = document.getElementById('habitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitList = document.getElementById('habitList');
    const progressContainer = document.getElementById('progressContainer');
    const monthlyPercentageEl = document.getElementById('monthlyPercentage');

    // Initialize Monthly Chart
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    let monthlyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Missed'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Initialize Weekly Chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    let weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            datasets: [{
                label: 'Completion (%)',
                data: [0, 0, 0, 0, 0], // Placeholder data
                backgroundColor: '#3498db',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Month Selector Logic
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonthDisplay = document.getElementById('selectedMonthDisplay');
    let currentMonth = monthSelect.value;
    const currentYear = 2026;

    // Helpers
    function getMonthIndex(monthName) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(monthName);
    }

    function formatDate(year, monthIndex, day) {
        const m = String(monthIndex + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    function getDaysInMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    function generateTableHeader(monthIndex) {
        const daysInMonth = getDaysInMonth(currentYear, monthIndex);
        const thead = document.querySelector('#habitTable thead');
        thead.innerHTML = '';

        // Detect today
        const today = new Date();
        const isCurrentYear = today.getFullYear() === currentYear;
        const isCurrentMonth = today.getMonth() === monthIndex;
        const todayDay = today.getDate();

        const trWeeks = document.createElement('tr');
        const thHabit = document.createElement('th');
        thHabit.textContent = 'Habit';
        thHabit.rowSpan = 2;
        trWeeks.appendChild(thHabit);

        let dayCounter = 1;
        let weekCounter = 1;
        while (dayCounter <= daysInMonth) {
            const thWeek = document.createElement('th');
            let span = 7;
            if (dayCounter + 6 > daysInMonth) {
                span = daysInMonth - dayCounter + 1;
            }
            thWeek.textContent = `Week ${weekCounter}`;
            thWeek.colSpan = span;
            trWeeks.appendChild(thWeek);
            dayCounter += span;
            weekCounter++;
        }
        thead.appendChild(trWeeks);

        const trDays = document.createElement('tr');
        for (let i = 1; i <= daysInMonth; i++) {
            const th = document.createElement('th');
            th.textContent = i;
            // Highlight header if today
            if (isCurrentYear && isCurrentMonth && i === todayDay) {
                th.classList.add('today-highlight');
            }
            trDays.appendChild(th);
        }
        thead.appendChild(trDays);
    }

    // 1. Load Data
    async function loadData() {
        try {
            const monthIndex = getMonthIndex(currentMonth);
            const datePrefix = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
            generateTableHeader(monthIndex);

            const [habitsRes, logsRes] = await Promise.all([
                fetch(`/habits?month=${currentMonth}`),
                fetch(`/logs?date_prefix=${datePrefix}`)
            ]);
            const habits = await habitsRes.json();
            const logs = await logsRes.json();

            habitList.innerHTML = '';

            habits.forEach(habit => {
                createHabitRow(habit.id, habit.name, monthIndex);
            });

            logs.forEach(log => {
                const logDate = new Date(log.date);
                const day = logDate.getDate(); // 1-31
                const row = habitList.querySelector(`tr[data-id="${log.habit_id}"]`);
                if (row) {
                    const checkbox = row.children[day].querySelector('input');
                    if (checkbox) checkbox.checked = true;
                }
            });

            updateProgress();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    loadData();

    // 2. Render Helper
    function createHabitRow(id, name, monthIndex) {
        const tr = document.createElement('tr');
        tr.dataset.id = id;

        const nameTd = document.createElement('td');

        // Create container for name and streak info
        const nameContainer = document.createElement('div');
        nameContainer.className = 'habit-name-container';

        const habitNameSpan = document.createElement('div');
        habitNameSpan.className = 'habit-name-text';
        habitNameSpan.textContent = name;

        const streakInfo = document.createElement('div');
        streakInfo.className = 'streak-info';
        streakInfo.innerHTML = `
            <span class="streak-current">🔥 Current: 0 days</span>
            <span class="streak-best">🏆 Best: 0 days</span>
        `;

        nameContainer.appendChild(habitNameSpan);
        nameContainer.appendChild(streakInfo);
        nameTd.appendChild(nameContainer);
        tr.appendChild(nameTd);

        // Detect today
        const today = new Date();
        const isCurrentYear = today.getFullYear() === currentYear;
        const isCurrentMonth = today.getMonth() === monthIndex;
        const todayDay = today.getDate();

        // Prepare for future check
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const daysInMonth = getDaysInMonth(currentYear, monthIndex);
        for (let i = 1; i <= daysInMonth; i++) {
            const td = document.createElement('td');
            const cellDate = new Date(currentYear, monthIndex, i);
            const isFuture = cellDate > now;

            // Highlight cell if today
            if (isCurrentYear && isCurrentMonth && i === todayDay) {
                td.classList.add('today-highlight');
            }

            // Add future class
            if (isFuture) {
                td.classList.add('future-day');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.day = i;

            // Disable logic
            if (isFuture) {
                checkbox.disabled = true;
                checkbox.title = "Cannot complete future habits";
            }

            checkbox.addEventListener('change', (e) => {
                updateProgress();
                const dateStr = formatDate(currentYear, monthIndex, i);
                saveLog(id, dateStr, e.target.checked);
            });

            td.appendChild(checkbox);
            tr.appendChild(td);
        }

        habitList.appendChild(tr);
    }

    // 3. Add Habit
    async function addHabit() {
        const habitText = habitInput.value.trim();
        if (habitText === "") return alert("Please enter a habit!");

        try {
            const res = await fetch('/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: habitText, month: currentMonth })
            });
            const newHabit = await res.json();
            if (newHabit.id) {
                const monthIndex = getMonthIndex(currentMonth);
                createHabitRow(newHabit.id, newHabit.name, monthIndex);
                habitInput.value = "";
                updateProgress();
            }
        } catch (error) { console.error(error); }
    }

    // 4. Save Log
    async function saveLog(habitId, dateStr, completed) {
        try {
            await fetch('/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habit_id: habitId,
                    date: dateStr,
                    completed: completed
                })
            });
        } catch (error) { console.error(error); }
    }

    function updateProgress() {
        const checkboxes = habitList.querySelectorAll('input[type="checkbox"]');
        const totalCheckboxes = checkboxes.length;

        if (totalCheckboxes === 0) {
            progressContainer.textContent = "Week 1 Progress: 0%";
            monthlyPercentageEl.textContent = "Monthly Completion: 0%";
            updateCharts(0, 0, [0, 0, 0, 0, 0]);
            renderTopHabits([]);
            return;
        }

        // 1. Overall Monthly Progress
        const checkedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked).length;
        const missedCheckboxes = totalCheckboxes - checkedCheckboxes;
        const percentage = Math.round((checkedCheckboxes / totalCheckboxes) * 100);

        progressContainer.textContent = `Monthly Progress: ${percentage}%`;
        monthlyPercentageEl.textContent = `Monthly Completion: ${percentage}%`;

        // 2. Weekly Progress
        // Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29+
        const weeklyCompleted = [0, 0, 0, 0, 0];
        const weeklyTotal = [0, 0, 0, 0, 0];

        checkboxes.forEach(cb => {
            const day = parseInt(cb.dataset.day);
            const weekIndex = Math.floor((day - 1) / 7);

            if (weekIndex < 5) {
                weeklyTotal[weekIndex]++;
                if (cb.checked) {
                    weeklyCompleted[weekIndex]++;
                }
            }
        });

        const weeklyPercentages = weeklyTotal.map((total, i) => {
            return total === 0 ? 0 : Math.round((weeklyCompleted[i] / total) * 100);
        });

        updateCharts(checkedCheckboxes, missedCheckboxes, weeklyPercentages);

        // 3. Top Habits
        const topHabits = calculateTopHabits();
        renderTopHabits(topHabits);

        // 4. Update Streaks
        updateStreaks();
    }

    function updateCharts(completed, missed, weeklyData) {
        // Update Monthly Chart
        monthlyChart.data.datasets[0].data = [completed, missed];
        monthlyChart.update();

        // Determine how many weeks to show based on the number of days
        const checkboxes = habitList.querySelectorAll('input[type="checkbox"]');
        let maxDay = 0;
        checkboxes.forEach(cb => {
            const day = parseInt(cb.dataset.day);
            if (day > maxDay) maxDay = day;
        });

        // Calculate number of weeks (28 days = 4 weeks, 29+ = 5 weeks)
        const numWeeks = maxDay <= 28 ? 4 : 5;

        // Filter data and labels to only show relevant weeks
        const labels = [];
        const data = [];
        for (let i = 0; i < numWeeks; i++) {
            labels.push(`Week ${i + 1}`);
            data.push(weeklyData[i] || 0);
        }

        // Update Weekly Chart with dynamic data
        weeklyChart.data.labels = labels;
        weeklyChart.data.datasets[0].data = data;
        weeklyChart.update();
    }

    function calculateTopHabits() {
        const rows = habitList.querySelectorAll('tr');
        const habitsData = [];

        rows.forEach(row => {
            const habitName = row.querySelector('td:first-child')?.textContent;
            if (!habitName) return;

            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            const total = checkboxes.length;
            const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
            const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

            // Only include habits with > 0% completion
            if (percent > 0) {
                habitsData.push({ name: habitName, percent });
            }
        });

        // Sort by percentage descending
        habitsData.sort((a, b) => b.percent - a.percent);

        // Return top 5
        return habitsData.slice(0, 5);
    }

    function renderTopHabits(topHabitsData) {
        const topHabitsList = document.getElementById('topHabitsList');

        if (topHabitsData.length === 0) {
            topHabitsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No habits tracked yet. Start checking off your habits!</p>';
            return;
        }

        topHabitsList.innerHTML = '';
        topHabitsData.forEach((habit, index) => {
            const item = document.createElement('div');
            item.className = 'habit-rank-item';
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="habit-name">${habit.name}</span>
                <span class="habit-percentage">${habit.percent}%</span>
            `;
            topHabitsList.appendChild(item);
        });
    }

    function calculateCurrentStreak(habitRow) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthIndex = getMonthIndex(currentMonth);

        // Check if we're viewing the current month
        const isCurrentMonth = today.getMonth() === monthIndex && today.getFullYear() === currentYear;

        if (!isCurrentMonth) {
            // If not viewing current month, we can't calculate current streak accurately
            return 0;
        }

        const todayDay = today.getDate();
        let streak = 0;

        // Start from today and go backward
        for (let day = todayDay; day >= 1; day--) {
            const checkbox = habitRow.querySelector(`input[data-day="${day}"]`);
            if (checkbox && checkbox.checked && !checkbox.disabled) {
                streak++;
            } else {
                break; // Streak is broken
            }
        }

        return streak;
    }

    function calculateLongestStreak(habitRow) {
        const monthIndex = getMonthIndex(currentMonth);
        const checkboxes = habitRow.querySelectorAll('input[type="checkbox"]');

        // Get all completed dates
        const completedDays = [];
        checkboxes.forEach(cb => {
            if (cb.checked && !cb.disabled) {
                const day = parseInt(cb.dataset.day);
                completedDays.push(day);
            }
        });

        if (completedDays.length === 0) return 0;

        // Sort ascending
        completedDays.sort((a, b) => a - b);

        let longestStreak = 1;
        let currentStreak = 1;

        // Iterate through consecutive days
        for (let i = 1; i < completedDays.length; i++) {
            // Check if current day is exactly 1 day after previous
            if (completedDays[i] === completedDays[i - 1] + 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1; // Reset streak
            }
        }

        return longestStreak;
    }

    function updateStreaks() {
        const rows = habitList.querySelectorAll('tr');

        rows.forEach(row => {
            const streakInfo = row.querySelector('.streak-info');
            if (!streakInfo) return;

            const currentStreak = calculateCurrentStreak(row);
            const longestStreak = calculateLongestStreak(row);

            // Update current streak display
            const currentStreakSpan = streakInfo.querySelector('.streak-current');
            if (currentStreakSpan) {
                currentStreakSpan.textContent = `🔥 Current: ${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`;
            }

            // Update longest/best streak display
            const bestStreakSpan = streakInfo.querySelector('.streak-best');
            if (bestStreakSpan) {
                bestStreakSpan.textContent = `🏆 Best: ${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`;
            }
        });
    }

    addHabitBtn.addEventListener('click', addHabit);

    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    monthSelect.addEventListener('change', (e) => {
        currentMonth = e.target.value;
        selectedMonthDisplay.textContent = `Current Month: ${currentMonth}`;
        loadData();
    });
});
