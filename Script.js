let trades = JSON.parse(localStorage.getItem('trades')) || [];

function renderTrades() {
    const tbody = document.querySelector('#trade-table tbody');
    tbody.innerHTML = '';
    trades.forEach((trade, index) => {
        const pnl = trade.type === 'Buy'
            ? (trade.exit - trade.entry)
            : (trade.entry - trade.exit);
        const pnlClass = pnl >= 0 ? 'profit' : 'loss';
        const row = `
            <tr>
                <td>${trade.asset}</td>
                <td>${trade.type}</td>
                <td>${trade.entry}</td>
                <td>${trade.exit}</td>
                <td class="${pnlClass}">${pnl.toFixed(2)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

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
    localStorage.setItem('trades', JSON.stringify(trades));
    renderTrades();
    
    // Kosongkan form
    document.getElementById('asset').value = '';
    document.getElementById('entry').value = '';
    document.getElementById('exit').value = '';
}

renderTrades();
