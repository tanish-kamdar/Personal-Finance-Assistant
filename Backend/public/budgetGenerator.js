let transactions,totalExpense,totalIncome,netSavings,budget=[];

let Income=document.querySelector('#Income');
let Expense=document.querySelector('#Expense');
let Savings=document.querySelector('#Savings');

// const { GoogleGenAI } =require("@google/genai");
// const ai= new GoogleGenAI({ apiKey : 'AIzaSyCG14rw6pV3uHqgSpqa-XpQjOCAlmUJ5dk'});

// async function aiRequest(prompt){
//     const response= await ai.models.generateContent({
//         model : 'gemini-2.0-flash',
//         contents : prompt
//     });
//     return response.text;
// }

document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('transactions');
    if (dataContainer) {
        const transactionsJSON = dataContainer.dataset.transactions;
        transactions = JSON.parse(transactionsJSON);
    }
    const budgetContainer = document.getElementById('budget');
    if (budgetContainer) {
        const budgetJSON = dataContainer.dataset.budget;
        budget = JSON.parse(budgetJSON);
    }
});

function renderTransactions(array) {
    transactions=array;
    totalExpense=0,totalIncome=0,netSavings=0;

    array.forEach(t => {

        if(t.type==='Income') totalIncome+=parseInt(t.amount);
        else if(t.type==='Expense') totalExpense+=parseInt(t.amount);

    });
    netSavings=totalIncome-totalExpense;
    Income.textContent=totalIncome.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    Expense.textContent=totalExpense.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    Savings.textContent=netSavings.toLocaleString("en-IN", { style: "currency", currency: "INR" });

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

btnByMonth.addEventListener('click',()=>{
    filterByMonth();

    
});

async function mapExpensesToCategories(){
    let expenses=transactions.filter(t=>{
        return t.type==='Expense'
    });
    console.log(budget);
    // let bars=document.querySelectorAll('.progress-bar'),c=0,percentage=0,budgetArray=Object.keys(budget);
    // bars.forEach(b=>{
    //     percentage=((budgetArray[c].myTotalExpense)/(budgetArray[c].advisedAllocation))*100;
    //     b.style.cssText=`width :${percentage}%;`;
    //     c++;
    // });
    // console.log(bars);
    // for(transaction of transactions){
    //         await aiRequest('');
        
    // }
}