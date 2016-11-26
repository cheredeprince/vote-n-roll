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
    "display": "hist",
    "chartTitle" : "nombre de voix par candidat",
    "presentation" : "Le scrutin majoritaire à un tour consiste à compter pour chaque candidat le nombre de vote où il est classé le premier. On appelle ces votes, les voix du candidat, et le candidat élu est celui, qui en a le plus."
  },
  "maj2": {
    "name"   : "scrutin majoritaire à 2 tours",
    "getRes" : "getMaj2Res",
    "mkRes"  : "maj2Sct",
    "getData": "majData",
    "display": "maj",
    "chartTitle" : "répartition des voix après le premier tour",
    "presentation" : "Le scrutin majoritaire à deux tours consiste à sélectionner les deux candidats avec le plus de voix, c'est le premier tour. Un vote pour un candidat perdant est redistribué à un des deux gagnant, si celui-ci est préféré à l'autre par le vote. Après avoir recompté les voix des gagnants du premier tour, on élit celui qui a le plus de voix au deuxième tour."
  },
  "majn": {
    "name"   : "scrutin par éliminations",
    "getRes" : "getMajnRes",
    "mkRes"  : "majnSct",
    "getData": "majData",
    "display": "maj",
    "chartTitle" : "répartition des voix, après chaque tour",
    "presentation": "Le scrutin par élimination consiste éliminer un candidat à chaque tour. À chaque tour, on élimine le candidat ayant le moins de voix, et on redistribue ses voix aux autres candidats, suivant la méthode exposée pour le vote à deux tours. Le candidat qui gagne au dernier tour est élu."
  },
  "bordas" : {
    "name"   : "scrutin par scores (Bordas)",
    "getRes" : "get",
    "mkRes"  : "bordasSct",
    "getData": "hist",
    "display": "hist",
    "chartTitle" : "score par candidat",
    "presentation" : "Le scrutin par scores de Bordas consiste à attribuer des points à chaque candidats suivant son classement dans chaque vote. Ainsi pour chaque vote, le candidat classé dernier reçoit un point, le deuxième deux point, etc. On compte le nombre de points par candidat et le candidat élu est celui avec le plus grand score."
  },
  "condorcet" : {
    "name"   : "scrutin par duels (Condorcet)",
    "getRes" : "get",
    "mkRes"  : "condorcetSct",
    "getData": "hist",
    "display": "hist",
    "chartTitle" : "nombre de duels remportés par candidat",
    "presentation" : "Le scrutin par duels de Condorcet consiste à compter le nombre victoire que remporte un candidat en duel avec chacun de ses concurrents. Un candidat gagne un duel contre un deuxième s'il a plus de vote qui le place au dessus du deuxième. Si un candidat gagne plus de duel, que tous les autres, il est élu. Sinon il faut utiliser une autre méthode pour les départager, qui n'est pas encore en place ici."
  }
}


module.exports =  config;
