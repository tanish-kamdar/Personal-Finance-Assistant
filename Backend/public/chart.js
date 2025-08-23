const pieData = <%- JSON.stringify(pieData) %>;
const barData = <%- JSON.stringify(barData) %>;

// Pie Chart
const pieCtx = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: pieData
});

// Bar Graph
const barCtx = document.getElementById('barGraph').getContext('2d');
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: barData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});