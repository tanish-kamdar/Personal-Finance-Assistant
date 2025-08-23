const btnYear = document.getElementById('btnYear');
        const btnMonth = document.getElementById('btnMonth');
        const btnRange = document.getElementById('btnRange');

        const yearFilter = document.getElementById('yearFilter');
        const monthFilter = document.getElementById('monthFilter');
        const rangeFilter = document.getElementById('rangeFilter');

        const btnByYear = document.getElementById('btnByYear');
        const btnByMonth = document.getElementById('btnByMonth');
        const btnByRange = document.getElementById('btnByRange');

        const Income=document.getElementById('income');
        const Expense=document.getElementById('expense');
        const Savings=document.getElementById('savings');

        let transactions=[];

        let netSavings=0,totalExpense=0,totalIncome=0;

        function hideAllInputs(){
            yearFilter.style.display='none';
            monthFilter.style.display='none';
            rangeFilter.style.display='none';
        }
        hideAllInputs();
        btnYear.addEventListener('click',()=>{
            hideAllInputs();
            yearFilter.style.display='block';
        })
        btnMonth.addEventListener('click',()=>{
            hideAllInputs();
            monthFilter.style.display='block';
        })
        btnRange.addEventListener('click',()=>{
            hideAllInputs();
            rangeFilter.style.display='block';
        })

        document.addEventListener('DOMContentLoaded', () => {
            const dataContainer = document.getElementById('transactions');
            if (dataContainer) {
                const transactionsJSON = dataContainer.dataset.transactions;
                transactions = JSON.parse(transactionsJSON);
                console.log('Transactions:', transactions);
        
                // Example usage
                transactions.forEach(item => {
                    console.log('Transaction:', item);
                });
            }
        });

        function renderTransactions(array) {
            console.log("Rendering", array.length, "transactions");
            const tbody = document.querySelector('#transactionTable tbody');
            tbody.innerHTML = ''; // Clear previous
            totalExpense=0,totalIncome=0,netSavings=0;
            array.forEach(t => {

                if(t.type==='Income') totalIncome+=parseInt(t.amount);
                else if(t.type==='Expense') totalExpense+=parseInt(t.amount);

              const row = `<tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>${t.frequency}</td>
                <td>${t.amount}</td>
              </tr>`;
              tbody.innerHTML += row;
            });
            netSavings=totalIncome-totalExpense;
            Income.textContent=totalIncome.toLocaleString("en-IN", { style: "currency", currency: "INR" });
            Expense.textContent=totalExpense.toLocaleString("en-IN", { style: "currency", currency: "INR" });
            Savings.textContent=netSavings.toLocaleString("en-IN", { style: "currency", currency: "INR" });
          }
            
          function filterByYear() {
            const selectedYear = document.getElementById('yearSelect').value;
            const filtered = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getFullYear().toString() === selectedYear;
            });
            renderTransactions(filtered);
        }
        
        function filterByMonth() {
            const selectedYear = document.getElementById('yearMonthSelect').value;
            const selectedMonth = document.getElementById('monthSelect').value; // "1" to "12"
            const filtered = transactions.filter(t => {
                const date = new Date(t.date);
                return (
                    date.getFullYear().toString() === selectedYear &&
                    (date.getMonth() + 1).toString() === selectedMonth
                );
            });
            renderTransactions(filtered);
        }
        
        function filterByRange() {
            const start = new Date(document.getElementById('startDate').value);
            const end = new Date(document.getElementById('endDate').value);
        
            const filtered = transactions.filter(t => {
                const date = new Date(t.date);
                return date >= start && date <= end;
            });
            renderTransactions(filtered);
        }

        btnByMonth.addEventListener('click',()=>{
            filterByMonth();
        });

        btnByYear.addEventListener('click',()=>{
            filterByYear();
        })

        btnByRange.addEventListener('click',()=>{
            filterByRange();
        })
        
