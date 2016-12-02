var _ = require('lodash');

/* chaque bulletin de vote construit un bulletin de vote vide à partir :
   * son type 
   * de la liste des candidat
   * le nom de l'élection
   *
   * la méthode set permet de mettre d'inscrire un vote sur le bulletin
   * la méthode get permet de récupérer le vote pour l'enregistrer dans la bd
   */

exports.PrefBallot = function(candidats,election){
//  this.election = election;
  this.candidats = candidats;
  this.label = "";
  this.prefList = "";
  this.voteMode = "pref";

  this.set = function(labelList,next){
    var candidatsLabels = this.candidats,
	interLabels = _.intersection(labelList,candidatsLabels);

    //si tous les labels existent et qu'aucun n'est en double
    //et la liste contient tous les candidats.
    if(interLabels.length == candidatsLabels.length
       && labelList.length == candidatsLabels.length){
      //construction du label de vote et inscription du nouveau vote.
      this.label = labelList.join('-');
      this.prefList = labelList;
      next();
    }else{
      next({error:"vote invalide"});
    }
  };

  this.get = function(){
    return {
      "label"    : this.label,
      "voteMode" : this.voteMode,
      "prefList" : this.prefList
    };
  }


}















