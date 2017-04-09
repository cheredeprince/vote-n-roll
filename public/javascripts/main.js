var _ = require('lodash');
var Scrutin = require('../../lib/scrutin');
var Data = require('../../lib/data');
//var Display = require('./display')

$.getJSON( "/vote/json/"+Election.id, function( allBallots ) {
  console.time('begin')
  /* save the ballots */
  var allBallots = allBallots;

  /* get the filter*/
  var filter = Election.Candidats.labels;

  $('.card input[type=checkbox]').click(function(){
    var newFilter = [];
    $('.card input[type=checkbox]:checked').each(function(){
      newFilter.push($(this).attr("data-label"))
    })

      if(newFilter.length >2){
	filter = newFilter;
	process();
      }
  })
    

    var process = function(){
      /* get filtred ballots*/
      var filtredBallots = {};
      
      for(var vmLabel in allBallots){
	var ballots = _.cloneDeep(allBallots[vmLabel])

	filtredBallots[vmLabel] = Scrutin.filter[vmLabel](ballots,filter)
      }
      //  console.log(filtredBallots)

      /*get results */

      var resultsBoard = {};
      
      for(var sLabel in Election.scrutins){
	var scrutin = Election.scrutins[sLabel];
	var vmLabel = scrutin.voteMode;
	
	resultsBoard[sLabel] = Scrutin[scrutin.mkRes](filtredBallots[vmLabel]);
      }

      console.log(resultsBoard)

      /*display data*/

      var render = function(){
	var i,
	    charts = document.getElementsByClassName('scr-chart');
	
	for(i=0 ;i<charts.length;i++){
	  var svg =charts[i].getElementsByTagName("svg")[0];
	  if(svg)
	    svg.parentNode.removeChild(svg);         
	};
	
	
	Display.changeSize();
	Display.setColors(_.reduce(Election.Candidats,function(res,cand,cLabel){
	  res[cand.name] = cand.color;
	  return res;
	},{}));
	
	Display.setConf("voteMode",VoteMode);
	Display.setConf("cand",Election.Candidats);
	

	var totalScore = _.map(Election.scrutins,function(scrutin,sLabel){
	  var r = resultsBoard[sLabel].ranked;
	  r = _.mapKeys(r,(v,lab) => Election.Candidats[lab].name)
	  r.category = scrutin.name;
	  return r;
	});
	
	Display.score(totalScore,"total");

	for(var sLabel in Election.scrutins){
	  var display = Display[Election.scrutins[sLabel].display];
	  var data = Data[Election.scrutins[sLabel].getData];

	  display(data(resultsBoard[sLabel],Election.Candidats),sLabel);
	}
      }
      window.addEventListener('resize',render);
      render();
    }


  process();
  
  console.timeEnd("begin")  
})

console.log(Election)
