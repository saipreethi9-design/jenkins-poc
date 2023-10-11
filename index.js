const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('port', (process.env.PORT || 5000));


let bookData = {"1": "eat that frog", "2": "rich dad poor dad"};

app.use(bodyParser.json());
app.get('/',(req,res)=>{
    res.send("Welcome to Dashboard");
})

app.get('/bookById',(req,res)=>{
    const id = req.body.id;
    const bookName = bookData[id];
    res.send(bookName);

})

app.get('/allBooks',(req,res)=>{
    const bookList = [];
    for(let key in bookData){
        bookList.push(bookData[key]);
    }
    res.send(bookList);
})

app.post('/addBookById',(req,res)=>{
    const id = req.body.id;
    const bookName = req.body.name;
    if (id in bookData){
        res.send('already book is present with the id');
    }
    else{
        bookData[id] = bookName;
        res.send("book added successfully");
    }   
})

app.put('/updateBookByID', (req,res)=>{
    const id = req.body.id;
    const bookName = req.body.name;
    if (id in bookData){
        bookData[id] = bookName;
        res.send("updated the book name successfully");
    }
    else{
        res.send("no id is there in book data to update");
    }
    
})

app.delete('/deleteBookByID',(req,res)=>{
    const id = req.body.id;
    if (id in bookData){
        delete bookData[id];
        res.send("deleted book successfully");
    }
    else{
        res.send("no id with this book");
    }
})


app.listen(app.get('port'),()=>{
    console.log('listening at the port' + ' ' + app.get('port'));
});
