var express = require('express'),
    _       = require('lodash'),
    Votes   = require('../models/votes'),
    Candidats = require('../models/candidats');
var router = express.Router();

/* GET les resultats. */
router.get('/', function(req, res, next) {
  //s'il y a un message à afficher
  var message = req.query.message,
      maj1Res = Votes.getMaj1Res(),
      maj2Res = Votes.getMaj2Res(),
      majnRes = Votes.getMajnRes(),
      totalRes = [maj1Res,maj2Res,majnRes];


  var data1 = majorityData(maj1Res),
      data2 = majorityData(maj2Res),
      datan = majorityData(majnRes),
      totalScore = _.map(totalRes,function(scrutin,i){
        var r = _.clone(scrutin.ranked);
        r = _.mapKeys(r,(v,lab) => Candidats.getNameOf(lab))
        r.category = "scrutin"+i;
        console.log(r)
        return r;
      });

  res.render('results', { message: message,
                          data1 : data1,
                          title1 : "Scrutin majoritaire à 1 tour",
                          data2 : data2,
                          title2 : "Scrutin majoritaire à 2 tours",
                          datan:datan,
                          titlen : "Scrutin par éliminations",
                          totalScore : totalScore
                        });
});

module.exports = router;


var majorityData = function(result){
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
                                 "nodeName": Candidats.getNameOf(lab),
                                 "nodeValue": n,
                                 "image" : Candidats.getImageOf(lab),
                                 "color"  : Candidats.getColorOf(lab)
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
