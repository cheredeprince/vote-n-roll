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
    "ejs" : "vote-pref",
    "postParser" : "votePref",
    "toCSV": "prefCSV"
  },
  
  "jug" : {
    "name": "jugement majoritaire",
    "ejs" : "vote-jug",
    "postParser" : "voteJug",
    "toCSV": "jugCSV",
    "sortedMention" : ['insuf','passa','quitg','good','veryg'],
    // attention les couleurs doivent être aussi présentes dans style.scss
    // pour obtenir la palette original :
    // http://paletton.com/palette.php?uid=74d1r0kllllaFw0g0qFqFg0w0aF
    "colorMention"  : {
      'veryg': '#16A94A',
      'good' : '#A6C432',
      'quitg': '#8B8B8B',
      'passa': '#CC8722',
      'insuf': '#db4342',
      // 'excel': '#116611',
      // 'rejec': '#aa3939'
		      },
    "nameMention" : {
      'veryg': 'Très bon',
      'good' : 'Bon',
      'quitg': 'Assez bon',
      'passa': 'Passable',
      'insuf': 'Insuffisant',
      // 'excel': 'Excellent',
      // 'rejec': 'À rejeter'
    }
  }
}

config.elections = {
  "presidentielle": {
    "name" : "l'élection présidentielle",
    "description": "",
    "scrutins" : ["maj1","maj2","majn","bordas","condorcet","jugMaj"],
    "candidats" : {
      "ass" : {
	"name"  : "François Asselineau",
	"image" : "https://pbs.twimg.com/profile_images/845387075486728193/6HA8xTgS_200x200.jpg",
	"color" : "#057c85"
      },
      "dup" : {
	"name"  : "Nicolas Dupont-Aignan",
	"image" : "https://pbs.twimg.com/profile_images/672054572601483265/xRGGJGn1_200x200.jpg",
	"color" : "#54a0d4"
      },
      "lep" : {
	"name"  : "Marine Le Pen",
	"image" : "https://pbs.twimg.com/profile_images/806157043677724672/0Pe1Xh_U_200x200.jpg",
	"color" : "#1e2148"
      },
      "mac" : {
	"name"  : "Emmanuel Macron",
	"image" : "https://pbs.twimg.com/profile_images/834424630630817795/TfyS4uXb_200x200.jpg",
	"color" : "#6b7076"
      },
      "ham" : {
	"name"  : "Benoît Hamon",
	"image" : "https://pbs.twimg.com/profile_images/845187160038825985/EeEmqHTi_200x200.jpg",
	"color" : "#6e3191"
      },
      "art" : {
	"name"  : "Nathalie Arthaud",
	"image" : "https://pbs.twimg.com/profile_images/692079601200295941/rCfOm6nc_200x200.jpg",
	"color" : "#e53333"
      },
      "pou" : {
	"name"  : "Philippe Poutou",
	"image" : "https://pbs.twimg.com/profile_images/722778700136259585/SBDHHEwg_200x200.jpg",
	"color" : "#c0081f"
      },
      "che" : {
	"name"  : "Jacques Cheminade",
	"image" : "https://pbs.twimg.com/profile_images/2511020171/orf7onnkacicyn8odg26_200x200.jpeg",
	"color" : "#f59c37"
      },
      "las" : {
	"name"  : "Jean Lassalle",
	"image" : "https://pbs.twimg.com/profile_images/835154648772268033/8Qn0QyJF_200x200.jpg",
	"color" : "#6b848c"
      },
      "mel" : {
	"name"  : "Jean-Luc Mélenchon",
	"image" : "https://pbs.twimg.com/profile_images/776540585314422784/F68Qj8x9_200x200.jpg",
	"color" : "#D0462D"
      },
      "fil" : {
	"name"  : "François Fillon",
	"image" : "https://pbs.twimg.com/profile_images/845229246280863745/U3jdwWGz_200x200.jpg",
	"color" : "#23408f"
      }
    }
  },
  "primaire-gauche":{
    "name" : "la primaire citoyenne",
    "description": "",
    "scrutins" : ["maj1","maj2","majn","bordas","condorcet","jugMaj"],
    "candidats" : {
      "val" : {
	"name"  : "Manuel Valls",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2017/01/manuel_valls_site_primaires_vignette-490x490.png",
	//	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/manuel_valls_portrait.png",
	"color" : "#7b6888"
      },
      "mon" : {
	"name"  : "Arnaud Montebourg",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/MONTEBOURG-490x490.png",
	"color" : "#ff8c00"
      },
      "ham" : {
	"name"  : "Benoît Hamon",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/10/hamon-490x490.png",
	"color" : "#6b486b"
      },
      "pin" : {
	"name"  : "Silvia Pinel",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/sylvia_pinel_portrait_def-490x490.png",
	"color" : "#98abc5"
      },
      "rug" :{
	"name"  : "François de Rugy",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/DE_RUGY_2-490x490.png",
	"color" : "#8a89a6"
      },
      "ben" : {
	"name"  : "Jean-Luc Bennahmias",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/jean_luc_bennahmias_portrait_ok-490x490.png",
	"color" : "#a05d56"
	
      },
      "pei" : {
	"name"  : "Vincent Peillon",
	"image" : "http://www.lesprimairescitoyennes.fr/wp-content/uploads/2016/12/PEILLON-490x490.png",
	"color" : "#d0743c"
	
      }
    }
  },
    "primaire-droite" : {
    "name": "la primaire de droite",
    "description": "",
    "scrutins" : ["maj1","maj2","majn","bordas","condorcet","jugMaj"],
    "candidats": {
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
    }
  }
}

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
    "chartTitle" : "proportion des mentions par candidat",
    "presentation" : "On regarde la proportion de chaque mention par candidat. On retient pour chaque candidat sa mention majoritaire, qui correspond à la mention minimale donnée par 50% des votants."
  }
}


module.exports =  config;
