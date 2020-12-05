var mysql      = require('mysql');
var async = require('async');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database: 'PDR_APP_DB',
  password : 'root'
});

connection.connect();



 const getStockByMagazinAndNature = (request, response) =>{
  connection.query('select magazin, nature, sum(pmp) as somme from excel group by magazin, nature', (error, results)=>{
    if (error) { throw error}
    const numero_ = "" ;  
    for(i=0; i<results.length; i++){
      console.log(results[i]['magazin']);
      connection.query('select  numero from magazin where magazin_id ='+results[i]['magazin'], (error, result)=>{
            console.log(result[0]['numero']);
            console.log(results[i]['magazin'])
      })
    }
    
    const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
    const groupById = groupBy('magazin');
    const result = {articlesByNature: groupById(results)}
    //console.log(result);
    response.status(200).json(result)
  })
}

const InsertAppro = (request, response) =>{
  const {accord_cadre_id, code_article, stock_min, stock_max, appro_type} = request.body;
  sql = 'insert into approvisionnement(accord_cadre_id, code_article, stock_min, stock_max, appro_type) values('+
    accord_cadre_id+',"'+code_article+'",'+stock_min+','+stock_max+',"'+appro_type+'")'

  connection.query(sql,(error, results)=>{
      if (error) { throw error }
      response.status(200).json(results)  
  });
}

const getAppros = (request, response) =>{
  sql = 'select * from approvisionnement';

  connection.query(sql,(error, results)=>{
      if (error) { throw error }
      response.status(200).json(results)  
  });
}

const InsertAC = (request, response) =>{
  const {numero, date_debut, date_fin, fournisseur} = request.body;
  sql = 'insert into accord_cadre(numero, date_debut, date_fin, fournisseur) values("'+
    numero+'","'+date_debut+'","'+date_fin+'","'+fournisseur+'")'

  connection.query(sql,(error, results)=>{
      if (error) { throw error }
      response.status(200).json(results)  
  });
}

const getACs = (request, response) =>{
  sql = 'select * from accord_cadre'

  connection.query(sql,(error, results)=>{
      if (error) { throw error }
      response.status(200).json(results)  
  });
}

const insertSecuritaire2Appro = (request, response) =>{
  q1 = "select distinct article from excel_stock ES where ES.nature='SÃ©curitÃ©'";
  connection.query(q1,(error, results1)=>{
      if (error) { throw error }
        q2 = 'select  accord_cadre_id from accord_cadre where numero="NotDefined"'
        connection.query(q2,(error, results2)=>{
        if (error) { throw error }
          async.forEachOf(results1, function (dataElement, i, inner_callback){ 
          q3 = 'insert into approvisionnement(accord_cadre_id,'
          +'code_article,appro_type)values ('+results2[0]['accord_cadre_id']+',"'
          +dataElement['article']+'","critique")' 
             connection.query(q3,(error, results3)=>{
               if (error) { throw error }
             })
          }); 
        }); 
      response.status(200).json("ok")  
  });
}

module.exports = {
  getStockByMagazinAndNature,InsertAppro, InsertAC, getAppros, getACs, insertSecuritaire2Appro
}
