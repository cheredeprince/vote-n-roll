var config = {};


/* chaque mode de vote possède :
 * - un nom de ficher .ejs dans views/partials/
*/

/* les attributs des bulletins de vote sont
 * décrit dans le ./lib/ballot.js
 */

config.voteModes = {
  "pref" : {
    "name": "vote alternatif",
    "ejs" : "vote-pref"
  },
  "jug" : {
    "name": "jugement majoritaire",
    "ejs" : "vote-jug",
    "sortedMention" : ['insuf','passa','quitg','good','veryg'],
    // attention les couleurs doivent être aussi présentes dans style.scss
    // pour obtenir la palette original :
    // http://paletton.com/palette.php?uid=74d1r0kllllaFw0g0qFqFg0w0aF
    "colorMention"  : {  'veryg': '#116611',
			 'good' : '#55aa55',
			 'quitg': '#d4c26a',
			 'passa': '#605292',
			 'insuf': '#aa3939',
//			 'excel': '#116611',
//			 'rejec': '#aa3939'
		      },
    "nameMention" : {	 'veryg': 'Très bon',
			 'good' : 'Bon',
			 'quitg': 'Assez bon',
			 'passa': 'Passable',
			 'insuf': 'Insuffisant',
//			 'excel': 'Excellent',
//			 'rejec': 'À rejeter'
		    }
  }
}


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
    "name"     : "scrutin majoritaire à 1 tour",
    "voteMode" : "pref",
    "getRes"   : "getMaj1Res",
    "mkRes"    : "maj1Sct",
    "getData"  : "hist",
    "display"  : "hist",
    "chartTitle" : "nombre de voix par candidat",
    "presentation" : "Dans le scrutin majoritaire à un tour, seul le candidat au premier rang de chaque vote reçoit une voix. Le candidat obtenant le plus de voix remporte l'élection."
  },
  "maj2": {
    "name"     : "scrutin majoritaire à 2 tours",
    "voteMode" : "pref",
    "getRes"   : "getMaj2Res",
    "mkRes"    : "maj2Sct",
    "getData"  : "majData",
    "display"  : "maj",
    "chartTitle" : "répartition des voix après le premier tour",
    "presentation" : "Le scrutin majoritaire à deux tours sélectionne les deux candidats avec le plus de voix au cours d'un premier tour, puis à les remettre en compétition au cours d'un second tour, qui se déroule de façon similaire en ignorant sur les votes les candidats éliminés au premier tour pour désigner le vainqueur."
  },
  "majn": {
    "name"     : "scrutin par éliminations",
    "voteMode" : "pref",
    "getRes"   : "getMajnRes",
    "mkRes"    : "majnSct",
    "getData"  : "majData",
    "display"  : "maj",
    "chartTitle" : "répartition des voix, après chaque tour",
    "presentation": "Le scrutin par éliminations se déroule en plusieurs tours, chacun éliminant le candidat obtenant le moins de voix jusqu'à ce qu'il n'en reste plus qu'un."
  },
  "bordas" : {
    "name"   : "scrutin par scores (Bordas)",
    "voteMode" : "pref",
    "getRes" : "get",
    "mkRes"  : "bordasSct",
    "getData": "hist",
    "display": "hist",
    "chartTitle" : "score par candidat",
    "presentation" : "Dans le scrutin par scores de Bordas, le classement des candidats sur chaque vote leur attribue un nombre de point : le dernier sur le vote reçoit un point, celui qui le précède deux points, etc. Le vainqueur est celui obtenant le plus de points."
  },
  "condorcet" : {
    "name"   : "scrutin par duels (Condorcet)",
    "voteMode" : "pref",
    "getRes" : "get",
    "mkRes"  : "condorcetSct",
    "getData": "hist",
    "display": "hist",
    "chartTitle" : "nombre de duels remportés par candidat",
    "presentation" : "Le scrutin par duels de Condorcet comptabilise les victoires dans des duels entre chaque couple de candidats, duels en scrutin majoritaire à un tour en ne considérant dans les votes que les duelistes. Si un candidat remporte plus de duels que les autres, il est désigné vainqueur, sinon il faut les départager autrement."
  },
  "jugMaj" : {
    "name"   : "Jugement majoritaire",
    "voteMode" : "jug",
    "getRes" : "get",
    "mkRes"  : "jugMaj",
    "getData": "cumulHist",
    "display": "stackedBar",
    "chartTitle" : "proportions des mentions par candidat",
    "presentation" : ""
  }
}


module.exports =  config;
