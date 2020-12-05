const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const pdr_db_bg = require('./pdrQueriesBg')
const pdr_db_ys = require('./pdrQueriesYs')
const pdr_db_index = require('./pdrQueriesIndex')
const port = 3002


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({ 
    extended: false,
  })
);
app.use(
  bodyParser.urlencoded({ 
    extended: false,
  })
);

app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers','Content-Type');
  next();
});

//Benguerir ----------------------------------------------------------------
app.get('/pdr/bg/reste/stockByMagazinCrRgRest', pdr_db_bg.getStockByMagazinCrRgRest); //C1
app.get('/pdr/bg/reste/stockByMagazinNBRDist', pdr_db_bg.getStockByMagazinNBRDist); //C1
app.get('/pdr/bg/reste/stockPourcentageCrRgRest', pdr_db_bg.getStockPourcentageCrRgRest); //C1  
app.get('/pdr/bg/reste/stockPourcentageCrRgRestNBR', pdr_db_bg.getStockPourcentageCrRgRestNBR); //C1


app.get('/pdr/bg/reguliere/getTotaleApproStockMinMax', pdr_db_bg.getTotaleApproStockMinMaxReguliere);//C2
app.get('/pdr/bg/reguliere/getStockApproPourcentage', pdr_db_bg.getStockApproPourcentageReguliere);//C2

app.get('/pdr/bg/critique/getTotaleApproStockMinMax', pdr_db_bg.getTotaleApproStockMinMaxCritique); //C3
app.get('/pdr/bg/critique/getStockApproPourcentage', pdr_db_bg.getStockApproPourcentageCritique);  //C3

app.get('/pdr/bg/reste/stockByMagazinDH', pdr_db_bg.getStockByMagazinDH); //C4
app.get('/pdr/bg/reste/stockByMagazinNBR', pdr_db_bg.getStockByMagazinNBR); //C4

app.get('/pdr/bg/critique/getArticles', pdr_db_bg.getArticlesCritiques); //C5

app.get('/pdr/bg/reguliere/getArticles', pdr_db_bg.getArticlesRegulieres); //C6

app.get('/pdr/bg/magazinLibelle', pdr_db_bg.getMagazinLibelle);



//Youssoufia ----------------------------------------------------------------

app.get('/pdr/ys/reste/stockByMagazinCrRgRest', pdr_db_ys.getStockByMagazinCrRgRest); //C1
app.get('/pdr/ys/reste/stockByMagazinNBRDist', pdr_db_ys.getStockByMagazinNBRDist); //C1
app.get('/pdr/ys/reste/stockPourcentageCrRgRest', pdr_db_ys.getStockPourcentageCrRgRest);  //C1
app.get('/pdr/ys/reste/stockPourcentageCrRgRestNBR', pdr_db_ys.getStockPourcentageCrRgRestNBR); //C1

app.get('/pdr/ys/reguliere/getTotaleApproStockMinMax', pdr_db_ys.getTotaleApproStockMinMaxReguliere); //C2
app.get('/pdr/ys/reguliere/getStockApproPourcentage', pdr_db_ys.getStockApproPourcentageReguliere); //C2

app.get('/pdr/ys/critique/getTotaleApproStockMinMax', pdr_db_ys.getTotaleApproStockMinMaxCritique); //C3
app.get('/pdr/ys/critique/getStockApproPourcentage', pdr_db_ys.getStockApproPourcentageCritique); //C3

app.get('/pdr/ys/reste/stockByMagazinDH', pdr_db_ys.getStockByMagazinDH); //C4
app.get('/pdr/ys/reste/stockByMagazinNBR', pdr_db_ys.getStockByMagazinNBR); //C4

app.get('/pdr/ys/critique/getArticles', pdr_db_ys.getArticlesCritiques); //C5
 
app.get('/pdr/ys/reguliere/getArticles', pdr_db_ys.getArticlesRegulieres);  //C6

app.get('/pdr/ys/magazinLibelle', pdr_db_ys.getMagazinLibelle);
 
//------------------------------------------------------------------
app.post('/pdr/InsertAppro', pdr_db_index.InsertAppro);
app.post('/pdr/InsertAC', pdr_db_index.InsertAC);
app.get('/pdr/getAppros', pdr_db_index.getAppros);
app.get('/pdr/getACs', pdr_db_index.getACs);
app.get('/pdr/insertSecuritaire2Appro', pdr_db_index.insertSecuritaire2Appro);

app.get('/pdr/magazins/stockByMagazinAndNature', pdr_db_index.getStockByMagazinAndNature);





app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
