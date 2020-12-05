var mysql      = require('mysql');
var async = require('async');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database: 'PDR_APP_DB',
  password : 'root'
});

connection.connect();

const getMagazins = (request, response) => {
  connection.query('select distinct magazin from excel_stock', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results)
  })
}
// C1
const getStockByMagazinCrRgRest = (request, response) =>{
  q1 = "select ES.magazin , sum(ES.stock_ae*ES.pmp) as sum_dh_critique from excel_stock ES where ES.article in "
  +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'critique')"
  +"and ES.magazin like 'G09%' group by ES.magazin";
  connection.query(q1, (error, results1)=>{
    if (error) { throw error}
    q2 = "select ES.magazin , sum(ES.stock_ae*ES.pmp) as sum_dh_reguliere from excel_stock ES where ES.article in "
    +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'reguliere')"
    +"and ES.magazin like 'G09%' group by ES.magazin";
    connection.query(q2, (error, results2)=>{
      if (error) { throw error}
      q3 = "select ES.magazin , sum(ES.stock_ae*ES.pmp) as sum_dh_rest from excel_stock ES "
      +"where ES.article not in (select distinct(APPRO.code_article) from approvisionnement APPRO)"
      +"and ES.magazin like 'G09%' group by ES.magazin";
      connection.query(q3, (error, results3)=>{
        if (error) { throw error}
         //res={'magazin':{'sum_dh_critique':0,'sum_dh_reguliere':0,'sum_dh_rest':0 }}
         vect = []
         res ={};
         for(i=0;i<results3.length;i++){
           vect.push({'magazin':results3[i]['magazin'],
             'sum_dh_rest':results3[i]['sum_dh_rest']/1000000,'sum_dh_reguliere':0,'sum_dh_critique':0});
         }
         //magazin_exist =false;
         for(i=0;i<results2.length;i++){
           magazin_exist =false;
           for(j=0;j<vect.length;j++){
             if(results2[i]['magazin']==vect[j]['magazin']){
               magazin_exist = true;
               vect[j]['sum_dh_reguliere'] = results2[i]['sum_dh_reguliere']/1000000
             }
           }
           if(magazin_exist == false){
             vect.push({'magazin':results2[i]['magazin'],
               'sum_dh_reguliere':results2[i]['sum_dh_reguliere']/1000000,'sum_dh_rest':0,'sum_dh_critique':0})
           }
         }
         for(i=0;i<results1.length;i++){
           magazin_exist =false;
           for(j=0;j<vect.length;j++){
             if(results1[i]['magazin']==vect[j]['magazin']){
               magazin_exist = true;
               vect[j]['sum_dh_critique'] = results1[i]['sum_dh_critique']/1000000
             }
           }
           if(magazin_exist == false){
             vect.push({'magazin':results1[i]['magazin'],
               'sum_dh_critique':results1[i]['sum_dh_critique']/1000000,'sum_dh_rest':0,'sum_dh_reguliere':0})
           }
         }
        response.status(200).json(vect);
      })
    })  
  })
}
//C1
const getStockByMagazinNBRDist = (request, response) =>{
  
  q1 = "select ES.magazin , count(ES.article) as nbr_critique from excel_stock ES where ES.article in "
  +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'critique')"
  +"and ES.magazin like 'G09%' group by ES.magazin";
  connection.query(q1, (error, results1)=>{
    if (error) { throw error}
    q2 = "select ES.magazin , count(ES.article) as nbr_reguliere from excel_stock ES where ES.article in "
    +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'reguliere')"
    +"and ES.magazin like 'G09%' group by ES.magazin";
    connection.query(q2, (error, results2)=>{
      if (error) { throw error}
      q3 = "select ES.magazin , count(ES.article) as nbr_rest from excel_stock ES "
      +"where ES.article not in (select distinct(APPRO.code_article) from approvisionnement APPRO)"
      +"and ES.magazin like 'G09%' group by ES.magazin";
      connection.query(q3, (error, results3)=>{
        if (error) { throw error}
         vect = []
         res ={};
         for(i=0;i<results3.length;i++){
           vect.push({'magazin':results3[i]['magazin'],
             'nbr_rest':results3[i]['nbr_rest'],'nbr_reguliere':0,'nbr_critique':0});
         }
         for(i=0;i<results2.length;i++){
           magazin_exist =false;
           for(j=0;j<vect.length;j++){
             if(results2[i]['magazin']==vect[j]['magazin']){
               magazin_exist = true;
               vect[j]['nbr_reguliere'] = results2[i]['nbr_reguliere']
             }
           }
           if(magazin_exist == false){
             vect.push({'magazin':results2[i]['magazin'],
               'nbr_reguliere':results2[i]['nbr_reguliere'],'nbr_rest':0,'nbr_critique':0})
           }
         }
         for(i=0;i<results1.length;i++){
           magazin_exist =false;
           for(j=0;j<vect.length;j++){
             if(results1[i]['magazin']==vect[j]['magazin']){
               magazin_exist = true;
               vect[j]['nbr_critique'] = results1[i]['nbr_critique']
             }
           }
           if(magazin_exist == false){
             vect.push({'magazin':results1[i]['magazin'],
               'nbr_critique':results1[i]['nbr_critique'],'nbr_rest':0,'nbr_reguliere':0})
           }
         }
        response.status(200).json(vect);
      })
    })  
  })
}
//C1
const getStockPourcentageCrRgRest = (request, response)=>{
  q1 = "select sum(ES.stock_ae*ES.pmp) as sum_dh_critique from excel_stock ES where ES.article in "
  +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'critique')"
  +"and ES.magazin like 'G09%'";
  connection.query(q1, (error, results1)=>{
    if (error) { throw error}
    q2 = "select sum(ES.stock_ae*ES.pmp) as sum_dh_reguliere from excel_stock ES where ES.article in "
    +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'reguliere')"
    +"and ES.magazin like 'G09%'";
    connection.query(q2, (error, results2)=>{
      if (error) { throw error}
      q3 = "select sum(ES.stock_ae*ES.pmp) as sum_dh_rest from excel_stock ES "
      +"where ES.article not in (select distinct(APPRO.code_article) from approvisionnement APPRO)"
      +"and ES.magazin like 'G09%' ";
      connection.query(q3, (error, results3)=>{
        if (error) { throw error}
         vect = []
         totale = results1[0]['sum_dh_critique']+results2[0]['sum_dh_reguliere']+results3[0]['sum_dh_rest'];
         //res['critique'] = (results1[0]['sum_dh_critique']/totale)*100;//.toFixed(2)*100
         //res['reguliere'] = (results2[0]['sum_dh_reguliere']/totale)*100;
         //res['rest'] = (results3[0]['sum_dh_rest']/totale)*100;
         res = {'type' : 'Critique', 'value': (results1[0]['sum_dh_critique']/totale)*100}
         vect.push(res);
         res = {'type' : 'Régulière', 'value': (results2[0]['sum_dh_reguliere']/totale)*100} 
         vect.push(res);
         res = {'type' : 'Reste', 'value': (results3[0]['sum_dh_rest']/totale)*100} 
         vect.push(res);
         response.status(200).json(vect);

      })
    })  
  })
}

//C1
const getStockPourcentageCrRgRestNBR = (request, response)=>{
  q1 = "select count(ES.stock_ae) as sum_nbr_critique from excel_stock ES where ES.article in "
  +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'critique')"
  +"and ES.magazin like 'G09%'";
  connection.query(q1, (error, results1)=>{
    if (error) { throw error}
    q2 = "select count(ES.stock_ae) as sum_nbr_reguliere from excel_stock ES where ES.article in "
    +"(select distinct(APPRO.code_article) from approvisionnement APPRO where APPRO.appro_type = 'reguliere')"
    +"and ES.magazin like 'G09%'";
    connection.query(q2, (error, results2)=>{
      if (error) { throw error}
      q3 = "select count(ES.stock_ae) as sum_nbr_rest from excel_stock ES "
      +"where ES.article not in (select distinct(APPRO.code_article) from approvisionnement APPRO)"
      +"and ES.magazin like 'G09%' ";
      connection.query(q3, (error, results3)=>{
        if (error) { throw error}
         vect = []
         totale = results1[0]['sum_nbr_critique']+results2[0]['sum_nbr_reguliere']+results3[0]['sum_nbr_rest'];
         res = {'type' : 'Critique', 'value': (results1[0]['sum_nbr_critique']/totale)*100}
         vect.push(res);
         res = {'type' : 'Régulière', 'value': (results2[0]['sum_nbr_reguliere']/totale)*100} 
         vect.push(res);
         res = {'type' : 'Reste', 'value': (results3[0]['sum_nbr_rest']/totale)*100} 
         vect.push(res);
         response.status(200).json(vect);

      })
    })  
  })
}
//C2
const getTotaleApproStockMinMaxReguliere = (request, response) =>{
  query = "select sum(sum_stock_ae) as stock_ae_totale, sum(sum_stock_min) as stock_min_totale,"
  +"sum(sum_stock_max) as stock_max_totale from (select ES.magazin, ES.article,ES.description,"
  +" ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut, ACAPPROJ.date_fin,ACAPPROJ.appro_type,"
  +" ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae,ACAPPROJ.stock_min*ES.pmp "
  +" as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +" (select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +" AC.numero as numero_ac, AC.date_debut, AC.date_fin from approvisionnement APPRO    "
  +"join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id where APPRO.appro_type='reguliere' "
  +") ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,ACAPPROJ.fournisseur,ES.magazin) ESACAPPRO;"
  connection.query(query, (error, results)=>{
        results[0]['stock_ae_totale'] = (results[0]['stock_ae_totale']).toFixed(4);//  /1000000
        results[0]['stock_min_totale'] = (results[0]['stock_min_totale']).toFixed(4);
        results[0]['stock_max_totale'] = (results[0]['stock_max_totale']).toFixed(4);
        if (error) { throw error}
        response.status(200).json(results[0]) 
  })
}
//C2
const getStockApproPourcentageReguliere = (request, response) =>{
  query1 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='reguliere') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
  +"ACAPPROJ.fournisseur having sum_stock_ae<sum_stock_min";
  connection.query(query1, (error, results1)=>{
    res = {}
    if (error) { throw error}
    res['inf_min'] = results1.length;
    query2 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='reguliere') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
  +"ACAPPROJ.fournisseur having sum_stock_ae between sum_stock_min and stock_max";
    
    connection.query(query2, (error, results2)=>{
    //res = {}
        if (error) { throw error}
        res['between_min_max'] = results2.length;
        query3 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
        +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
        +"ACAPPROJ.stock_min*ES.pmp "
        +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
        +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
        +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
        +"  from approvisionnement APPRO "
        +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
        +"  where APPRO.appro_type='reguliere') ACAPPROJ join excel_stock ES on "
        +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
        +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
        +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
        +"ACAPPROJ.fournisseur having sum_stock_ae >sum_stock_max";
        
        connection.query(query3, (error, results3)=>{
          if (error) { throw error}
          
          res['sup_max'] = results3.length;
          const totale = res['inf_min']+res['between_min_max']+res['sup_max'];
          res['inf_min'] = (res['inf_min']/totale).toFixed(2)*100;
          res['between_min_max'] = (res['between_min_max']/totale).toFixed(2)*100;
          res['sup_max'] = (res['sup_max']/totale).toFixed(2)*100;

          vect = []
          res1 = {'type' : 'Inférieur à min', 'value': res['inf_min']}
          vect.push(res1);
          res2 = {'type' : 'Entre min et max', 'value': res['between_min_max']} 
          vect.push(res2);
          res3 = {'type' : 'Supérieur à max', 'value': res['sup_max']} 
          vect.push(res3);

          response.status(200).json(vect)
        })
    })
  })
}
//C3
const getTotaleApproStockMinMaxCritique = (request, response) =>{
  query = "select sum(sum_stock_ae) as stock_ae_totale, sum(sum_stock_min) as stock_min_totale,"
  +"sum(sum_stock_max) as stock_max_totale from (select ES.magazin, ES.article,ES.description,"
  +" ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut, ACAPPROJ.date_fin,ACAPPROJ.appro_type,"
  +" ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae,ACAPPROJ.stock_min*ES.pmp "
  +" as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +" (select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +" AC.numero as numero_ac, AC.date_debut, AC.date_fin from approvisionnement APPRO    "
  +"join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id where APPRO.appro_type='critique' "
  +") ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,ACAPPROJ.fournisseur,ES.magazin) ESACAPPRO;"
  connection.query(query, (error, results)=>{
        results[0]['stock_ae_totale'] = (results[0]['stock_ae_totale']).toFixed(4);//  /1000000
        results[0]['stock_min_totale'] = (results[0]['stock_min_totale']).toFixed(4);
        results[0]['stock_max_totale'] = (results[0]['stock_max_totale']).toFixed(4);
        if (error) { throw error}
        response.status(200).json(results[0]) 
  })
}
//C3
const getStockApproPourcentageCritique = (request, response) =>{
  query1 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='critique') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
  +"ACAPPROJ.fournisseur having sum_stock_ae<sum_stock_min";
  connection.query(query1, (error, results1)=>{
    res = {}
    if (error) { throw error}
    res['inf_min'] = results1.length;
    query2 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='critique') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
  +"ACAPPROJ.fournisseur having sum_stock_ae between sum_stock_min and stock_max";
    
    connection.query(query2, (error, results2)=>{
    //res = {}
        if (error) { throw error}
        res['between_min_max'] = results2.length;
        query3 = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ACAPPROJ.date_debut,"
        +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
        +"ACAPPROJ.stock_min*ES.pmp "
        +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
        +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
        +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
        +"  from approvisionnement APPRO "
        +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
        +"  where APPRO.appro_type='critique') ACAPPROJ join excel_stock ES on "
        +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
        +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
        +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,"
        +"ACAPPROJ.fournisseur having sum_stock_ae >sum_stock_max";
        
        connection.query(query3, (error, results3)=>{
          if (error) { throw error}
          res['sup_max'] = results3.length;
          const totale = res['inf_min']+res['between_min_max']+res['sup_max'];
          res['inf_min'] = (res['inf_min']/totale).toFixed(2)*100;
          res['between_min_max'] = (res['between_min_max']/totale).toFixed(2)*100;
          res['sup_max'] = (res['sup_max']/totale).toFixed(2)*100;
          vect = [];
          res1 = {'type' : 'Inférieur à min', 'value': res['inf_min']}
          vect.push(res1);
          res2 = {'type' : 'Entre min et max', 'value': res['between_min_max']} 
          vect.push(res2);
          res3 = {'type' : 'Supérieur à max', 'value': res['sup_max']} 
          vect.push(res3);

          response.status(200).json(vect);

        })
    })
  })
}
//C4
const getStockByMagazinDH = (request, response) =>{
  sql = "select ES.magazin, ES.nature, sum(ES.stock_ae*ES.pmp) as somme_totale "
  +"from excel_stock ES where ES.article not in (select distinct(APPRO.code_article) from "
  +"approvisionnement APPRO) and ES.magazin like 'G09%' group by ES.magazin, ES.nature";
  connection.query(sql, (error, results)=>{
    if (error) { throw error}
    vect = []  
    for(i=0;i<results.length;i++){
      magazin_exist=false;
      for(j=0;j<vect.length;j++){
        if(results[i]['magazin']==vect[j]['magazin']){
          magazin_exist=true;
          if(results[i]['nature']=="Actif"){
            vect[j]['actif'] = results[i]['somme_totale']/1000000
          }
          if(results[i]['nature']=="Inutilisable"){
            vect[j]['inutilisable'] = results[i]['somme_totale']/1000000
          }
          if(results[i]['nature']=="A liquider"){
            vect[j]['a_liquider'] = results[i]['somme_totale']/1000000
          }
          if(results[i]['nature']=="ExcÃ©dent"){
            vect[j]['excedent'] = results[i]['somme_totale']/1000000
          }
        }
      }
      if(magazin_exist == false) {
          if(results[i]['nature']=="Actif"){
            vect.push({'magazin':results[i]['magazin'],'actif':results[i]['somme_totale']/1000000,
              'excedent':0,'a_liquider':0,'inutilisable':0});
          }
          if(results[i]['nature']=="Inutilisable"){
            vect.push({'magazin':results[i]['magazin'],'inutilisable':results[i]['somme_totale']/1000000,
              'excedent':0,'a_liquider':0,'actif':0});
          }
          if(results[i]['nature']=="A liquider"){
            vect.push({'magazin':results[i]['magazin'],'a_liquider':results[i]['somme_totale']/1000000,
              'excedent':0,'inutilisable':0,'actif':0});
          }
          if(results[i]['nature']=="ExcÃ©dent"){
            vect.push({'magazin':results[i]['magazin'],'excedent':results[i]['somme_totale']/1000000,
              'a_liquider':0,'inutilisable':0,'actif':0});
          }
      }
    }
    response.status(200).json(vect);
  })
}

//C4
const getStockByMagazinNBR = (request, response) =>{
  sql = "select  ES.magazin, ES.nature, sum(ES.stock_ae) as sum_articles_stock "
  +"from excel_stock ES where ES.article not in (select distinct(APPRO.code_article) "
  +"from approvisionnement APPRO) and ES.magazin like 'G09%' group by ES.magazin, ES.nature"
  connection.query(sql, (error, results)=>{
    if (error) { throw error}
    vect = []  
    for(i=0;i<results.length;i++){
      magazin_exist=false;
      for(j=0;j<vect.length;j++){
        if(results[i]['magazin']==vect[j]['magazin']){
          magazin_exist=true;
          if(results[i]['nature']=="Actif"){
            vect[j]['actif'] = results[i]['sum_articles_stock']
          }
          if(results[i]['nature']=="Inutilisable"){
            vect[j]['inutilisable'] = results[i]['sum_articles_stock']
          }
          if(results[i]['nature']=="A liquider"){
            vect[j]['a_liquider'] = results[i]['sum_articles_stock']
          }
          if(results[i]['nature']=="ExcÃ©dent"){
            vect[j]['excedent'] = results[i]['sum_articles_stock']
          }
        }
      }
      if(magazin_exist == false) {
          if(results[i]['nature']=="Actif"){
            vect.push({'magazin':results[i]['magazin'],'actif':results[i]['sum_articles_stock'],
              'excedent':0,'a_liquider':0,'inutilisable':0});
          }
          if(results[i]['nature']=="Inutilisable"){
            vect.push({'magazin':results[i]['magazin'],'inutilisable':results[i]['sum_articles_stock'],
              'excedent':0,'a_liquider':0,'actif':0});
          }
          if(results[i]['nature']=="A liquider"){
            vect.push({'magazin':results[i]['magazin'],'a_liquider':results[i]['sum_articles_stock'],
              'excedent':0,'inutilisable':0,'actif':0});
          }
          if(results[i]['nature']=="ExcÃ©dent"){
            vect.push({'magazin':results[i]['magazin'],'excedent':results[i]['sum_articles_stock'],
              'a_liquider':0,'inutilisable':0,'actif':0});
          }
      }
    }
    response.status(200).json(vect);
  })
}
//C5
const getArticlesCritiques = (request, response) => {
  query = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ES.unite_mesure,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='critique') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ES.unite_mesure,ACAPPROJ.date_debut,ACAPPROJ.date_fin,ACAPPROJ.fournisseur";
  connection.query(query, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results)
  })
}
//C6
const getArticlesRegulieres = (request, response) => {
  query = "select ES.article,ES.description, ES.pmp,ACAPPROJ.numero_ac,ES.unite_mesure,ACAPPROJ.date_debut,"
  +"ACAPPROJ.date_fin,ACAPPROJ.appro_type,ACAPPROJ.fournisseur,sum(ES.stock_ae)*ES.pmp as sum_stock_ae, "
  +"ACAPPROJ.stock_min*ES.pmp "
  +"as sum_stock_min,ACAPPROJ.stock_max*ES.pmp as sum_stock_max  from "
  +"(select APPRO.appro_type, APPRO.code_article, APPRO.stock_min, APPRO.stock_max, AC.fournisseur,"
  +"  AC.numero as numero_ac, AC.date_debut, AC.date_fin  "
  +"  from approvisionnement APPRO "
  +"  join accord_cadre AC on AC.accord_cadre_id = APPRO.accord_cadre_id"
  +"  where APPRO.appro_type='reguliere') ACAPPROJ join excel_stock ES on "
  +"ACAPPROJ.code_article=ES.article where ES.magazin like 'G09%' group by ES.article,"
  +"ACAPPROJ.stock_min,ACAPPROJ.stock_max, ES.pmp,ES.description,ACAPPROJ.numero_ac,"
  +"ACAPPROJ.appro_type,ACAPPROJ.date_debut,ACAPPROJ.date_fin,ES.unite_mesure,ACAPPROJ.fournisseur";
  connection.query(query, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results)
  })
}

// other
const getMagazinLibelle = (request, response)=>{
  query = "select MGINF.magazin, MGINF.libelle from magazin_info MGINF " 
  +"where MGINF.magazin like 'G09%'";
  connection.query(query, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results)
  })
}

module.exports = {
  getArticlesCritiques, getTotaleApproStockMinMaxCritique,
  getStockApproPourcentageCritique,getArticlesRegulieres, getTotaleApproStockMinMaxReguliere,
  getStockApproPourcentageReguliere,
  getStockByMagazinDH,getStockByMagazinNBR,getStockByMagazinNBRDist,
  getStockByMagazinCrRgRest,
  getStockPourcentageCrRgRest,
  getMagazinLibelle,
  getStockPourcentageCrRgRestNBR
}
