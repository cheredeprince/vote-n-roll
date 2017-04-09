var _ = require('lodash');

exports.majData = function(result,Candidats){
  var data = {};
  
  data.times = [];
  data.links = [];

  var idByLabelTurn = {},
      id=-1;
  
  data.times = _.map(result.scores,
                     (score,turn) => //_.sortBy(
                     _.map(score,
                           (n,lab) => {
                             id++;
                             idByLabelTurn[lab+'-'+turn] = id;
                             
                             return {
                               "id": id,
                               "nodeName":  Candidats[lab].name,
			       "image" : Candidats[lab].image,
                               "nodeValue": n
                             }
                           })
		     //                            , (o)=>1)// result.ranked[o.nodeName])
                    );
  
  data.links = _.flatMap(result.flux,
                         (flux,turn) => _.map(flux,
                                              (n,pair)=>{
                                                var couple = pair.split('-');
                                                
                                                return {
                                                  "source": idByLabelTurn[couple[0]+'-'+turn],
                                                  "target": idByLabelTurn[couple[1]+'-'+(turn+1)],
                                                  "value" : n
                                                }
                                              })
                        );

  return data;
};


//fonction pour former les données de scrutins en un seul tour
exports.hist = function(result,Candidats){
  var data =  _.map(result.scores[0],function(value,cand){
    return {
      "label" : Candidats[cand].name,
      "image" : Candidats[cand].image,
      "value" : value
    };
  });

  return data;
};


//fonction formatant les données du jugement majoritaire
exports.cumulHist = function(result){

  var sortedCand = _.map(_.sortBy(_.map(result.ranked,function(value,cand){
    return {"cand": cand,
	    "value" : value
	   }
  }), ["value"]),(o) =>o.cand);

  
  var data = _.map(sortedCand,function(cand){
    var d =  _.reduce(result.sortedMention,function(res,m){
      res[m] = (result.scores[0][cand][m]||0);
      return res;
    },{})
    
    d.State = cand;
    return d;
  });


  
  return data;
}










