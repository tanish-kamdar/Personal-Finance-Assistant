const express=require('express');
const app=express();
const path=require('path');
const methodOverride=require('method-override');
const port=8080;
const mysql=require('mysql2');
const { v4: uuidv4 }=require('uuid');
const flash=require('connect-flash');
const aiRequest=require('../geminipro');
const showdown = require('showdown');

// Create a new converter instance
const converter = new showdown.Converter();

let connection=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'account',
    password :'Tanish@7325'
});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.json());
app.use(methodOverride('_method'));
// app.use(flash());

// app.use((req,res,next)=>{
//     res.locals.success=req.flash('success');
//     res.locals.error=req.flash('error');
//     next();
// });

app.get("/",(req,res)=>{
    res.render('login.ejs');
});

app.get("/signup",(req,res)=>{
    res.render('signup.ejs');
});

app.post("/signup",(req,res)=>{
    
    console.log(req.body);
    if(req.body.password[0]!=req.body.password[1]){
        res.send("Passwords don't match");
    }else{
    let q=`INSERT INTO users
            (id,fname,lname,email,password)
            VALUES
            ("${uuidv4()}","${req.body.fname}","${req.body.lname}","${req.body.email}","${req.body.password[0]}")`;
    try{
    connection.query(q,(err,results)=>{
        if(err) throw err;

        console.log(results);
        res.redirect('http://localhost:8080/');
    });
    } catch(err){
        res.send(err);
    }
}
});

app.post("/user",(req,res)=>{
    
    let q=`SELECT * FROM users WHERE email='${req.body.email}'`;
    try{
        connection.query(q,(err,results)=>{
            if(err) throw err;
            let user=results[0];
            if(req.body.password==user.password){
                res.redirect(`http://localhost:8080/user/${user.id}`);
            }else{
                res.send(`The entered username or password is incorrect. Try again`);
            }
        });
    }catch(err){
        res.send(err);
    }
});

app.get('/user/:id',(req,res)=>{
    let {id }=req.params;
    let q=`SELECT * FROM transactions WHERE user_id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let transactions=result;
            let totalExp=0,totalInc=0,netSavings=0;
            for(transaction of transactions){
                if(transaction.type=='Expense')
                totalExp+=Number(transaction.amount);
            else if(transaction.type=='Income')
                totalInc+=Number(transaction.amount);
            }
            netSavings=totalInc-totalExp;
            res.render('dashboard.ejs',{id, transactions,totalExp,totalInc,netSavings});
        });
    }catch(err){
        console.log(err);
    }
    
});

app.get('/user/:id/lifestyle',(req,res)=>{
    let {id }=req.params;
    res.render('userLifestyle.ejs',{id});
});

app.post('/user/:id/lifestyle',(req,res)=>{
    let {id }=req.params;
    console.log(id);
    let details=req.body;
    let q=`UPDATE users
            SET residenceType = '${details.residenceType}',
                city = '${details.city}',
                familySize = ${details.familySize},
                hasDebt =  '${details.hasDebt}',
                lifeStage =  '${details.lifeStage}',
                savingsGoalValue =  ${details.savingsGoalValue},
                savingsGoalUnit =  '${details.savingsGoalUnit}'
            WHERE id =  '${id}';`;
            
            try{
                connection.query(q,(err,result)=>{
                    if(err) throw err;
                    // req.flash('success','Lifestyle successfully updated');
                    res.redirect(`/user/${id}`);
                });
            }catch(err){
                res.send(err);
            }
});

app.get('/user/:id/income',(req,res)=>{
    let {id }=req.params;
    let q=`SELECT name FROM categories WHERE type='Income'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let categories=result;
            res.render('income.ejs',{id, categories});
        });
    }catch(err){
        console.log(err);
    }
});

app.post('/user/:id/income/add',(req,res)=>{
    let {id }=req.params;
    let income=req.body;
    let q=`INSERT INTO transactions 
           (transaction_id,user_id,description,amount,type,category,frequency)
            VALUES
            ('${uuidv4()}','${id}','${income.description}',${income.amount},'Income','${income.category}','${income.frequency}')
           `;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect(`http://localhost:8080/user/${id}/`);
        });
    }catch(err){
        console.log(err);
        res.send('check console');
    }
});

app.get('/user/:id/expense/add',(req,res)=>{
    let {id }=req.params;
    let expense=req.body;
    let q=`SELECT name FROM categories WHERE type='Expense'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let categories=result;
            res.render('expense.ejs',{id, categories});
        });
    }catch(err){
        console.log(err);
    }
    
});

app.post('/user/:id/expense/add',(req,res)=>{
    let {id }=req.params;
    let expense=req.body;
    let q=`INSERT INTO transactions 
           (transaction_id,user_id,description,amount,category,frequency)
            VALUES
            ('${uuidv4()}','${id}','${expense.description}',${expense.amount},'${expense.category}','${expense.frequency}');
           `
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            
            res.redirect(`http://localhost:8080/user/${id}/`);
        });
    }catch(err){
        console.log(err);
        res.send('check console');
    }
});


app.get('/user/:id/reports', async (req, res) => {
    let { id } = req.params;
    res.render('reports.ejs',{id})
});

app.get('/user/:id/budget',async (req,res)=>{
    let {id}=req.params;

    let getTransactions = `SELECT * FROM transactions WHERE user_id='${id}'`;
    let getUser = `SELECT * FROM users WHERE id='${id}'`;
    let monthlyIncome=0;
    try {
        const [transactionsResult, userResult] = await Promise.all([
            new Promise((resolve, reject) => {
                connection.query(getTransactions, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query(getUser, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            }),
        ]);
        currentDate=new Date();
        currentMonth=currentDate.getMonth();

        let incomeTransactions=transactionsResult.filter(t=> {
            transactionMonth=t.date.getMonth();
            return t.type==='Income' && transactionMonth===currentMonth;
        });
        
        let expenseTransactions=transactionsResult.filter(t=> {
            transactionMonth=t.date.getMonth();
            return t.type==='Expense' && transactionMonth===currentMonth;
        });
        expenseTransactions=JSON.stringify(expenseTransactions);
        for(income of incomeTransactions) monthlyIncome+=parseFloat(income.amount);
        console.log(`Expenses :  ${expenseTransactions}`);
        let aiQuery=`   My monthly income is ${monthlyIncome},
                        My lifestyle details are following : 
                        {
                            residenceType : '${userResult[0].residenceType}',
                            city : '${userResult[0].city}'.
                            familySize : ${userResult[0].familySize}  ,
                            lifeStage : '${userResult[0].lifeStage}',
                            hasDebt : '${userResult[0].hasDebt}',
                            monthlySavingsGoal: '${userResult[0].savingsGoalValue} ${userResult[0].savingsGoalUnit}'
                        }
                        My expenses are :
                        ${expenseTransactions}

                        Let spendable income=monthlyIncome-monthlySavingsGoal(provided in the lifestyle details);
                        Allocate my spendableIncome into the following catgories based on the information provided.
                        Dynamically allocate budgets for every expense type based on the the user's lifestyle. 
                        Response must strictly be only a JSON object format with the following Expense Types as keys that will store two properties in a nested object-myTotalExpense in that category as well as your advisedAllocation as a key as it is from my spendable income.
                        All the keys of the object must be enclosed in double quotes. Values must be nested objects.
                        The following are expense categories.

                        "Debt Payments"
                        "Education"
                        "Entertainment"
                        "Food & Groceries"
                        "Gifts & Donations"
                        "Health & Insurance"
                        "Housing"
                        "Investments"
                        "Miscellaneous"
                        "Shopping"
                        "Transportation"
                        "Utilities"
                        "Savings" <- This must hold the myTotalExpense value of my monthly savings goal which must not be used for other expenses.
                        `;
        let budget,response; 
        do{
        await aiRequest(aiQuery).then((result)=>{
            response=result.substring(result.indexOf('{'),result.lastIndexOf('}')+1)
            budget=JSON.parse(response);
            console.log(budget);
        }).catch(err=>console.log(err)); 
        }while(!budget || !response || response==='' || response.length===0); 


        console.log(budget);
        
        res.render('budgeting.ejs', { id, transactions: transactionsResult, user: userResult, budget });
    } catch (err) {
        res.send(err);
    }
});

app.get('/user/:id/visualize',async (req,res)=>{
    let {id}=req.params;
    try{
    let transactions;
    let query = `SELECT sum(amount),category from transactions WHERE type='Expense' AND user_id='${id}' GROUP BY category;`;
    transactions=await new Promise((resolve,reject)=>{
        connection.query(query,(err,result)=>{
        if(err) reject(err);
        resolve(result);
    })
    }
    );
    console.log(transactions);
    let categories=transactions.map(t=>{
        return t.category
    });
    let amounts=transactions.map(t=>{
        return t['sum(amount)'];
    });
    console.log(amounts);

        // Example data for a pie chart
const pieChartData = {
    labels: categories,
    datasets: [{
      data: amounts,
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      hoverOffset: 10
    }]
  };
  
  // Example data for a bar graph
  const barGraphData = {
    labels: categories,
    datasets: [{
      label: 'Expense',
      data: amounts,
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

        res.render('visualization.ejs',{id,pieChartData,barGraphData});
    }catch(err) {
        res.send(err);
    }
});

app.get('/user/:id/insight',async (req,res)=>{
    let {id} =req.params;

    let getTransactions = `SELECT * FROM transactions WHERE user_id='${id}'`;
    let getUser = `SELECT * FROM users WHERE id='${id}'`;
    let monthlyIncome=0;
    try {
        const [transactionsResult, userResult] = await Promise.all([
            new Promise((resolve, reject) => {
                connection.query(getTransactions, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query(getUser, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            }),
        ]);
        currentDate=new Date();
        currentMonth=currentDate.getMonth();

        let incomeTransactions=transactionsResult.filter(t=> {
            transactionMonth=t.date.getMonth();
            return t.type==='Income' && transactionMonth===currentMonth;
        });
        
        let expenseTransactions=transactionsResult.filter(t=> {
            transactionMonth=t.date.getMonth();
            return t.type==='Expense' && transactionMonth===currentMonth;
        });
        expenseTransactions=JSON.stringify(expenseTransactions);
        for(income of incomeTransactions) monthlyIncome+=parseFloat(income.amount);

        let aiQuery=`My monthly income is ${monthlyIncome},

My lifestyle details are following : 
{
	residenceType : '${userResult[0].residenceType}',
	city : '${userResult[0].city}'.
	familySize :${userResult[0].familySize}  ,
	lifeStage : '${userResult[0].lifeStage}',
	hasDebt : '${userResult[0].hasDebt}',
	monthlySavingsGoal: '${userResult[0].savingsGoalValue} ${userResult[0].savingsGoalUnit}'
}

The following are this month's spendings across various category from my monthly income.

My spendings are :
${expenseTransactions}

Carefylly asses my lifestyle details,spendings, monthly saving goal and suggest the best recommendation/insight/advice for smart budget planning in 200 words.
Output plain text without formatting (without making anything bold) so that it can be easily copied on a webpage.
Do not narrate anything extra, I just need the fair draft.
`

    let response;
    await aiRequest(aiQuery).then((result)=>{
        response=result;
        // response=converter.makeHtml(response);
    })

    res.render('insight.ejs',{id,response})
    }catch(err) {throw err;}

    
});
app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
});

