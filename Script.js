let trades = JSON.parse(localStorage.getItem('trades')) || [];
let chartInstance = null; // Untuk menyimpan instance grafik

// Fungsi Otomasi: Menghitung P&L saat user mengetik
function updateAutoPreview() {
    const type = document.getElementById('type').value;
    const entry = parseFloat(document.getElementById('entry').value);
    const exit = parseFloat(document.getElementById('exit').value);
    const previewText = document.getElementById('auto-preview');

    if (!isNaN(entry) && !isNaN(exit)) {
        const pnl = type === 'Buy' ? (exit - entry) : (entry - exit);
        previewText.textContent = `P&L Otomatis: $${pnl.toFixed(2)}`;
        previewText.className = pnl >= 0 ? 'profit' : 'loss';
    } else {
        previewText.textContent = 'P&L Otomatis: $0.00';
        previewText.className = '';
    }
}

// Pasang event listener untuk otomasi saat mengetik
document.getElementById('entry').addEventListener('input', updateAutoPreview);
document.getElementById('exit').addEventListener('input', updateAutoPreview);
document.getElementById('type').addEventListener('change', updateAutoPreview);

function addTrade() {
    const asset = document.getElementById('asset').value;
    const type = document.getElementById('type').value;
    const entry = parseFloat(document.getElementById('entry').value);
    const exit = parseFloat(document.getElementById('exit').value);

    if (!asset || isNaN(entry) || isNaN(exit)) {
        alert('Mohon isi semua data dengan benar.');
        return;
    }

    trades.push({ asset, type, entry, exit });
    saveAndRender();
    
    // Kosongkan form
    document.getElementById('asset').value = '';
    document.getElementById('entry').value = '';
    document.getElementById('exit').value = '';
    updateAutoPreview();
}

function deleteTrade(index) {
    if (confirm('Yakin ingin menghapus trade ini?')) {
        trades.splice(index, 1);
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('trades', JSON.stringify(trades));
    renderTrades();
    updateSummary();
    updateChart();
}

function renderTrades() {
    const tbody = document.querySelector('#trade-table tbody');
    tbody.innerHTML = '';
    
    // Render dari yang terbaru
    [...trades].reverse().forEach((trade, reversedIndex) => {
        const originalIndex = trades.length - 1 - reversedIndex;
        const pnl = trade.type === 'Buy' ? (trade.exit - trade.entry) : (trade.entry - trade.exit);
        const pnlClass = pnl >= 0 ? 'profit' : 'loss';
        
        const row = `
            <tr>
                <td><strong>${trade.asset.toUpperCase()}</strong></td>
                <td>${trade.type}</td>
                <td>$${trade.entry}</td>
                <td>$${trade.exit}</td>
                <td class="${pnlClass}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</td>
                <td><button class="delete-btn" onclick="deleteTrade(${originalIndex})">Hapus</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateSummary() {
    let totalPnl = 0;
    let wins = 0;

    trades.forEach(trade => {
        const pnl = trade.type === 'Buy' ? (trade.exit - trade.entry) : (trade.entry - trade.exit);
        totalPnl += pnl;
        if (pnl > 0) wins++;
    });

    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    
    const pnlElement = document.getElementById('total-pnl');
    pnlElement.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    pnlElement.className = totalPnl >= 0 ? 'profit' : 'loss';
    
    document.getElementById('win-rate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('total-trades').textContent = trades.length;
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Hitung kumulatif P&L untuk grafik
    let cumulativePnl = 0;
    const labels = [];
    const dataPoints = [];

    trades.forEach((trade, index) => {
        const pnl = trade.type === 'Buy' ? (trade.exit - trade.entry) : (trade.entry - trade.exit);
        cumulativePnl += pnl;
        labels.push(`Trade ${index + 1}`);
        dataPoints.push(cumulativePnl);
    });

    if (chartInstance) {
        chartInstance.destroy(); // Hapus grafik lama sebelum membuat yang baru
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Akumulasi P&L ($)',
                data: dataPoints,
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#c9d1d9' } }
            },
            scales: {
                x: { ticks: { color: '#8b949e' } },
                y: { ticks: { color: '#8b949e' } }
            }
        }
    });
}

// Jalankan saat halaman dimuat
renderTrades();
updateSummary();
updateChart();
