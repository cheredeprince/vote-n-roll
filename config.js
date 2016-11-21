var config = {};

/*chaque candidat possède:
 * - un label, qui le définit de manière courte
 * - un nom, qui le définit de manière précise et conventionelle
 */
config.candidats = {
  "sar": {
    "name"  : "Nicolas Sarkozy",
    "image" : "http://www.primaire2016.org/upload/default/57e39212451bf_N_Sarkozy.png",
    "color" : "#98abc5"
  },
  "fil": {
    "name" : "François Fillon",
    "image": "http://www.primaire2016.org/upload/default/57e3923985498_F_Fillon.png",
    "color": "#8a89a6"
  },
  "kos":{
    "name" : "Nathalie Kosciusko-Morizet",
    "image": "http://www.primaire2016.org/upload/default/57e39272ca678_N_KoscuiskoMorizet.png",
    "color": "#7b6888"
  },
  "jup": {
    "name"  : "Alain Juppé",
    "image" : "http://www.primaire2016.org/upload/default/57e3929c13493_A_Juppe.png",
    "color" : "#6b486b"
  },
  "cop":{
    "name"  : "Jean-François Copé",
    "image" : "http://www.primaire2016.org/upload/default/57e3930e8836b_JF_Cope.png",
    "color" : "#a05d56"
  },
  "lem":{
    "name"  : "Bruno Le Maire",
    "image" : "http://www.primaire2016.org/upload/default/57e39369164cd_B_LeMaire.png",
    "color" : "#d0743c"
  },
  "poi":{
    "name"  : "Jean-Frédéric Poisson",
    "image" : "http://www.primaire2016.org/upload/default/57e3939cd869c_JF_Poisson.png",
    "color" : "#ff8c00"
  }
};

config.scrutins = {
  "maj1": {
    "name"   : "scrutin majoritaire à 1 tour",
    "getRes" : "getMaj1Res",
    "mkRes"  : "maj1Sct",
    "getData": "hist",
    "display": "displayHist",
    "chartTitle" : "nombre de voix par candidat",
    "presentation" : ""
  },
  "maj2": {
    "name"   : "scrutin majoritaire à 2 tours",
    "getRes" : "getMaj2Res",
    "mkRes"  : "maj2Sct",
    "getData": "majData",
    "display": "displayMajority",
    "chartTitle" : "répartition des voix après le premier tour",
    "presentation" : ""
  },
  "majn": {
    "name"   : "scrutin par éliminations",
    "getRes" : "getMajnRes",
    "mkRes"  : "majnSct",
    "getData": "majData",
    "display": "displayMajority",
    "chartTitle" : "répartition des voix, après chaque tour",
    "presentation": ""
  },
  "bordas" : {
    "name"   : "scrutin par scores (Bordas)",
    "getRes" : "get",
    "mkRes"  : "bordasSct",
    "getData": "hist",
    "display": "displayHist",
    "chartTitle" : "score par candidat",
    "presentation" : ""
  },
  "condorcet" : {
    "name"   : "scrutin par duels (Condorcet)",
    "getRes" : "get",
    "mkRes"  : "condorcetSct",
    "getData": "hist",
    "display": "displayHist",
    "chartTitle" : "nombre de duels remportés par candidat",
    "presentation" : ""
  }
}


module.exports =  config;
