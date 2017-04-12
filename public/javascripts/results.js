(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//var _ = require('lodash');
var Scrutin = require('./scrutin');
var Data = require('./data');
var Display = require('./display');

d3.json( "/vote/json/"+Election.id, function( allBallots ) {

  /* save the ballots */
  var allBallots = allBallots;

  /* get the filter*/
  var filter = Election.Candidats.labels;

  var cards = document.getElementsByClassName("card");

  for(var i=0;i<cards.length;i++){
    cards[i].onclick = function(){

      var newFilter = [];
      for(var j=0;j<cards.length;j++){
	
	var input = cards[j].getElementsByTagName('input')[0];
	if(input.checked)
	  newFilter.push(input.getAttribute("data-label"));
      }

      if(newFilter.length >2){
	filter = newFilter;
	process();
      }
    }
  }

  var process = function(){
    /* get filtred ballots*/
    var filtredBallots = {};
    
    for(var vmLabel in allBallots){
      var ballots = _.cloneDeep(allBallots[vmLabel])

      filtredBallots[vmLabel] = Scrutin.filter[vmLabel](ballots,filter)
    }


    /*get results */

    var resultsBoard = {};
    
    for(var sLabel in Election.scrutins){
      var scrutin = Election.scrutins[sLabel];
      var vmLabel = scrutin.voteMode;
      
      resultsBoard[sLabel] = Scrutin[scrutin.mkRes](filtredBallots[vmLabel]);
    }

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
  

})


},{"./data":2,"./display":3,"./scrutin":4}],2:[function(require,module,exports){
//var _ = require('lodash');

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











},{}],3:[function(require,module,exports){


  var doc = document,
      main = doc.getElementById('main'),
      mainWidth = main.clientWidth,
      margin = {top:30,left:20,bottom:40,right:20},
      breakPoint = 600,
      color,
      config = {};


  //set colors by candidats NAME
  var setColors = function(colors){
    color = colors;
  };
  
  var setConf = function(name,data){
    config[name] = data;
  };


  var changeSize = function(){

    mainWidth = main.clientWidth;
    
    if(mainWidth< breakPoint){
      margin.right = 0;
      margin.left = 0;
    }else{
      margin.right = 20;
      margin.left = 20;
    }
  };
  
  var displayHist = function(data,label){
    
    data = data.sort(function(d,e){return e.value - d.value;});

    var axisMargin = 10,
        valueMargin = 4,
        barRatio = 0.4,
        width = mainWidth,
        height = Math.max(400,mainWidth/2),
        barHeight = (height-axisMargin -margin.top -margin.bottom )* barRatio/data.length,
        barPadding = (height-axisMargin -margin.right -margin.left)*(1-barRatio)/data.length,
        imageSize = barHeight + barPadding*2*.4,
        marginLegend = 4,
        data, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });
    
    svg = d3.select('.scr-chart-'+label)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    
    bar = svg.selectAll("g")
      .data(data)
      .enter()
      .append("g");

    bar.attr("class", "bar")
      .attr("cx",0)
      .attr("transform", function(d, i) {
        return "translate(" + margin.left + "," + (i * (barHeight + barPadding) + barPadding ) + ")";
      });

    var legend =  bar.append("g");
    
    legend.append("text")
      .attr("class", "label")
      .attr("y",barHeight/2)
      .attr("dy", ".35em") //vertical align middle
      .text(function(d){
        if(mainWidth < breakPoint)
          return shortName(d.label);
        else
          return d.label;
      })
      .attr('x',imageSize + marginLegend)

    legend.append("svg:image")
      .attr('transform',"translate(0,"+(-imageSize+barHeight)/2+")")
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('xlink:href',function(c) {return c.image;})
    
    legend.each(function() {
      labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });
    
    scale = d3.scale.linear()
      .domain([0, max])
      .range([0, width - margin.left -margin.right - labelWidth]);

    xAxis = d3.svg.axis()
      .scale(scale)
      .tickSize(-height + margin.top +margin.bottom + axisMargin)
      .orient("bottom");

    bar.append("rect")
      .attr("transform", "translate("+labelWidth+", 0)")
      .attr("height", barHeight)
      .attr("width", function(d){
        return scale(d.value);
      })
      .attr("fill",function(c){ return color[c.label];});

    bar.append("text")
      .attr("class", "value")
      .attr("y", barHeight / 2)
      .attr("dx", -valueMargin + labelWidth) //margin right
      .attr("dy", ".35em") //vertical align middle
      .attr("text-anchor", "end")
      .text(function(d){
        return (d.value);
      })
      .attr("x", function(d){
        var width = this.getBBox().width;
        return Math.max(width + valueMargin, scale(d.value));
      });

    if(mainWidth >= breakPoint){
      svg.insert("g",":first-child")
        .attr("class", "axisHorizontal")
        .attr("transform", "translate(" + (margin.left + labelWidth) + ","+ (height - axisMargin - margin.top)+")")
        .call(xAxis); 
    }
  }


  var displayScore = function(data,label){

    var div = d3.select("body").append("div").attr("class", "toolTip");

    var width = mainWidth - margin.left - margin.right,
        height = mainWidth *500/960 - margin.top - margin.bottom,
        legendH = 18;

    if(mainWidth < breakPoint)
      legendH = 9;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var svg = d3.select(".scr-chart-"+label).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    //svg reset
    var svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "category"; });
    
    data.forEach(function(d) {
      d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.category; }));
    x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([1+d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); }),1]);
    
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .call(wrap, x0.rangeBand());
    
    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate(" + x0(d.category) + ",0)"; });
    
    var bar =  state.selectAll("rect")
        .data(function(d) { return d.ages; })
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate("+x1(d.name)+","+y(d.value)+")"; });
    
    bar.append("rect")
      .attr("width", x1.rangeBand())
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color[d.name]; })
    
    bar.append("text")
      .attr("class","value")
      .attr("y",4)
      .attr("dy",".75em")
      .attr("text-anchor","middle")
      .attr("x",x1.rangeBand()/2)
      .text(function(d){ return (''+d.value);})
    
    var legend = svg.selectAll(".legend")
        .data(ageNames.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * (legendH+2) + ")"; });
    
    legend.append("rect")
      .attr("x", width - legendH +4)
      .attr("width", legendH)
      .attr("height", legendH)
      .style("fill", function(v){ return color[v];});
    
    legend.append("text")
      .attr("x", width - legendH)
      .attr("y", legendH/2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return shortName(d); });
    
  }



var stackedBar = function(data,label){
  console.log(data)
    // Setup svg using Bostock's margin convention

    //   var margin = {top: 20, right: 160, bottom: 35, left: 30};

    var width = mainWidth - margin.left - margin.right,
	height = mainWidth*500/960 - margin.top - margin.bottom,
	legendSpace = 40,
	tickSpace = 20,
	gapratio =0.15;
    

    var legendH = 18;
    var formatPercent = d3.format(".01%");

    if(mainWidth < breakPoint)
      legendH = 9;
    
    var svg = d3.select(".scr-chart-"+label)
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var mentions = config.voteMode.jug.sortedMention.reverse();
    var totalVote = 0;

    for(var i=0;i<mentions.length;i++){
      totalVote += data[0][mentions[i]]
    }

    // Transpose the data into layers
    var dataset = d3.layout.stack()(mentions.map(function(mention,i) {

      var d = data.map(function(d,i) {
	return {x: config.cand[d.State].name,
		y: d[mention]/totalVote};
      });
      d.mention = mention;

      return d;
    }));


    // Set x, y and colors
    var x = d3.scale.ordinal()
	.domain(dataset[0].map(function(d) { return d.x; }))
	.rangeRoundBands([tickSpace, width-legendSpace], gapratio);

    var y = d3.scale.linear()
	.domain([0, d3.max(dataset, function(d) { return d3.max(d, function(d) { return d.y0 + d.y; });  })])
	.range([height, 0]);

    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.cost")
	.data(dataset)
	.enter().append("g")
	.attr("class", "cost")
	.style("fill", function(d) { return config.voteMode.jug.colorMention[d.mention]; });

    var rect = groups.selectAll("rect")
	.data(function(d) { return d; })
	.enter()
	.append("rect")
	.attr("x", function(d) { return x(d.x); })
	.attr("y", function(d) { return y(d.y0 + d.y); })
	.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	.attr("width", x.rangeBand())
	.on("mouseover", function() { tooltip.style("display", null); })
	.on("mouseout", function() { tooltip.style("display", "none"); })
	.on("mousemove", function(d) {
	  var xPosition = d3.mouse(this)[0] - 15;
	  var yPosition = d3.mouse(this)[1] - 25;
	  tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
	  tooltip.select("text").text(formatPercent(d.y));
	});
    // Define and draw axes
    
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(1)
	.tickSize(-width+legendSpace+tickSpace +2*gapratio*x.rangeBand())
        .tickFormat(d3.format(".0%"));

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform","translate("+(tickSpace +gapratio*x.rangeBand())+",0)")
      .call(yAxis);

    //Define the majority axis
    
    var majAxis = svg.append("g")
	.attr("transform","translate("+(tickSpace +gapratio*x.rangeBand())+","+height/2+")")
	.attr("class", "y majority-axis")
    majAxis.append("line")
      .attr("x2",width-legendSpace-tickSpace -2*gapratio*x.rangeBand())
      .attr("y2",0)
    majAxis.append("text")
      .style("text-anchor","end")
      .attr("dy",".32em")
      .attr("x","-3")
      .text("50%")
    
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .call(wrap, x.rangeBand());;

    // Draw legend

    var legend = svg.selectAll(".legend")
        .data(mentions.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate("+0+"," + i * (legendH+2) + ")"; });
    
    legend.append("rect")
      .attr("x", width - legendH +4)
      .attr("width", legendH)
      .attr("height", legendH)
      .style("fill", function(mention){ return config.voteMode.jug.colorMention[mention];});
    
    legend.append("text")
      .attr("x", width - legendH)
      .attr("y", legendH/2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(mention) { return config.voteMode.jug.nameMention[mention]; });

    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
	.attr("class", "tooltip")
	.style("display", "none");
    
    tooltip.append("rect")
      .attr("width", 30)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");


  }

  

  /* Example of data
     var data2 = {
     times:[
     [
     {id:0,nodeName:"mit",nodeValue:10},
     {id:1,nodeName:"man",nodeValue:1},
     {id:2,nodeName:"jos",nodeValue:15}
     ],
     [
     {id:3,nodeName:"mit",nodeValue:11},
     {id:4,nodeName:"jos",nodeValue:15}
     ]
     ],
     links:[
     {source:0,target:3,value:10},
     {source:1,target:3,value:1},
     {source:2,target:4,value:15}
     ]
     }
  */
  var displayMajority = function(data,label){
    /* Process Data */


    // make a node lookup map
    var nodeMap = (function() {
      var nm = {};
      data.times.forEach(function(nodes) {
        nodes.forEach(function(n) {
          nm[n.id] = n;
          // add links and assure node value
          n.links = [];
          n.incoming = [];
          n.nodeValue = n.nodeValue || 0;
        })
      });
      return nm;
    })();

    // attach links to nodes
    data.links.forEach(function(link) {
      nodeMap[link.source].links.push(link);
      nodeMap[link.target].incoming.push(link);
    });
    
    // sort by value and calculate offsets
    data.times.forEach(function(nodes) {
      var cumValue = 0;
      nodes.sort(function(a,b) {
        return d3.descending(a.nodeValue, b.nodeValue)
      });
      nodes.forEach(function(n, i) {
        n.order = i;
        n.offsetValue = cumValue;
        cumValue += n.nodeValue;
        // same for links
        var lCumValue;
        // outgoing
        if (n.links) {
          lCumValue = 0;
          n.links.sort(function(a,b) {
            return d3.descending(a.value, b.value)
          });
          n.links.forEach(function(l) {
            l.outOffset = lCumValue;
            lCumValue += l.value;
            l.color = color[n.nodeName];
          });
        }
        // incoming
        if (n.incoming) {
          lCumValue = 0;
          n.incoming.sort(function(a,b) {
            return d3.descending(a.value, b.value)
          });
          n.incoming.forEach(function(l) {
            l.inOffset = lCumValue;
            lCumValue += l.value;
          });
        }
      })
    });
    data = data.times;

    // calculate maxes
    var maxn = d3.max(data, function(t) { return t.length }),
        maxv = d3.max(data, function(t) { return d3.sum(t, function(n) { return n.nodeValue }) });

    /* Make Vis */
    
    // settings and scales

    
    var div = d3.select("body").append("div").attr("class", "toolTip");
    
    var w = mainWidth - margin.right - margin.left,
        h = Math.max(mainWidth/2,400) - margin.bottom - margin.top,
        gapratio = .7, //proportion de flux
        delay = 0,
        padding = 15, //distance vertical entre les candidat
        x = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeBands([0, w + (w/(data.length-1))], gapratio),
        y = d3.scale.linear()
        .domain([0, maxv])
        .range([0, h - padding * maxn]),
        line = d3.svg.line()
        .interpolate('basis');
    
    // root
    var svg = d3.select(".scr-chart-"+label)
        .append("svg:svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height",h + margin.top + margin.bottom);
    
    
    var vis = svg.append("g")
        .attr("transform","translate("+margin.left + "," + margin.top +")");
    

    
    var t = 0;
    function update(first) {
      // update data
      var currentData = data.slice(0, ++t);
      
      // time slots
      var times = vis.selectAll('g.time')
          .data(currentData)
          .enter().append('svg:g')
          .attr('class', 'time')
          .attr("transform", function(d, i) { return "translate(" + (x(i) - x(0)) + ",0)" });
      
      // node bars
      var nodeBox = times.selectAll('g.node')
          .data(function(d) { return d })
          .enter().append('svg:g')
          .attr('class', 'node')
          .on("mouseout", function(d){
            div.style("display", "none");
          });
      


      //      nodes.append('svg:title')
      //        .text(function(n) { return n.nodeName })

      var nodes = nodeBox.append('svg:g')
          .on("mousemove", function(n){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((n.nodeName)+"<br>"+(n.nodeValue) +" voix");
          });
      
      nodes.append('svg:rect')
        .attr('y', function(n, i) {
          return y(n.offsetValue) + i * padding;
        })
        .attr('width', x.rangeBand())
        .attr('height', function(n) { return y(n.nodeValue) })
        .attr('fill',function(n){ return color[n.nodeName] })

      nodes.append("svg:image")
        .attr('y', function(n, i) {
          return y(n.offsetValue) + i * padding;
        })
        .attr('width', function(n) { return Math.min(x.rangeBand(),y(n.nodeValue))})
        .attr('height', function(n) { return Math.min(x.rangeBand(),y(n.nodeValue))})
        .attr("transform", function(n){
          var dx = (x.rangeBand() - Math.min(x.rangeBand(),y(n.nodeValue)))/2,
	      dy = ( y(n.nodeValue) - Math.min( x.rangeBand() , y(n.nodeValue) ))/2;
          
          return "translate("+dx+","+dy+")";
        })
        .attr('xlink:href',function(n) {return n.image;})
      
      
      
      var linkLine = function(start) {
        return function(l) {
          var source = nodeMap[l.source],
              target = nodeMap[l.target],
              gapWidth = x(0),
              bandWidth = x.rangeBand() + gapWidth,
              startx = x.rangeBand() - bandWidth,
              sourcey = y(source.offsetValue) + 
              source.order * padding +
              y(l.outOffset) +
              y(l.value)/2,
              targety = y(target.offsetValue) + 
              target.order * padding + 
              y(l.inOffset) +
              y(l.value)/2,
              points = start ? 
              [
                [ startx, sourcey ], [ startx, sourcey ], [ startx, sourcey ], [ startx, sourcey ] 
              ] :
              [
                [ startx, sourcey ],
                [ startx + gapWidth/2, sourcey ],
                [ startx + gapWidth/2, targety ],
                [ 0, targety ]
              ];
          return line(points);
        }
      }
      
      // links
      var links = nodeBox.selectAll('path.link')
          .data(function(n){ return n.incoming || [] })
          .enter().append('svg:path')
          .attr('class', 'link')
          .style('stroke-width', function(l) { return y(l.value) })
          .style('stroke',function(l){ return l.color})
          .attr('d', linkLine(true))
          .on('mouseover', function(d) {
//	    d3.event.stopPropagation();

            d3.select(this).attr('class', 'link on')
          })
          .on('mouseout', function() {
            d3.select(this).attr('class', 'link')
          })
	  .on("mousemove", function(n){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html("transfert de "+(n.value) +" voix");
          })
          .transition()
          .duration(delay)
          .attr('d', linkLine());
      
    }

    function updateNext() {
      if (t < data.length) {
        update();
        window.setTimeout(updateNext, delay)
      }
    }
    update(true);
    updateNext();
    
  };


  var wrap = function(text, width) {

    text.each(function() {

      var text = d3.select(this),
          letters = text.text().split("").reverse(),
          letter,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

      while (letter = letters.pop()) {
        line.push(letter);
        tspan.text(line.join(""));
	
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(""));
          line = [letter];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(letter);
        }
      }

    });
  }

  var shortName = function(name){
    var words = name.split(' ');
    var firstName = words.splice(0,1);
    return firstName[0][0]+'. '+words.join(' ');
  }

exports.changeSize =changeSize;
exports.setColors = setColors;
exports.hist = displayHist;
exports.stackedBar = stackedBar;
exports.score = displayScore;
exports.maj = displayMajority;
exports.setConf = setConf;

},{}],4:[function(require,module,exports){
//var _ = require('lodash');

/* scrutin majoritaire à 1 tour */
exports.maj1Sct = function(votes){
  return majorityVote(votes,[1]);
}

/* scrutin majoritaire à 2 tours */
exports.maj2Sct = function(votes){
  return majorityVote(votes,[2,1]);
}

/* scrutin par élimination*/
exports.majnSct = function(votes){
  var inv = [];
  
  if (votes.length != 0)
    inv = _.range(votes[0].prefList.length -1,0,-1);
 
  return majorityVote(votes,inv);
}

/* scrutin de Bordas, comptage des points*/
exports.bordasSct = function(votes){
  var score =
      _.reduce(
        _.flatMap(
          votes,
          (vote) => _.map(vote.prefList,
                          (cand,index)=> [cand,(vote.prefList.length - index)*vote.number]))
        ,function(res,pair){
          res[pair[0]] = (res[pair[0]]||0) + pair[1];
          return res;
        },{});

  var ranked = [];
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - score[label]);

    ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }

  return {
    "ranked": ranked,
    "scores": [score]
  };
};

/* scrutin de Condorcet, comptage des duels gagnés */
exports.condorcetSct = function(votes){
  var tmp = _.flatMap(votes,function(vote){
    var l = vote.prefList;
    var prefs = _.flatMap(l,(label,index)=> _.map(l.slice(index+1),(label2)=>[label+'-'+label2,vote.number]))
    return prefs;
  });

  var duels = _.reduce(tmp,function(res,pref){
    res[pref[0]] = (res[pref[0]]||0) + pref[1];
    return res;
  },{});

  var score = _.reduce(duels,function(res,n,d){
    var tmp    = d.split('-'),
        labelInv  = tmp[1]+'-'+tmp[0];
    //si le duel est remporté
    if(!duels[labelInv] || n>duels[labelInv] ){
      res[tmp[0]] = (res[tmp[0]]||0) + 1;
    }else{
      res[tmp[0]] = (res[tmp[0]]||0);
    }
    return res;
  },{})

  var ranked = [];
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - score[label]);

    ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }

  return {
    "ranked" : ranked,
    "scores" : [score]
  }
}

exports.filter = {
  "pref": function(ballots,filter){
    return simplifyVote(ballots,filter).votes
  },
  "jug": function(ballots, filter){
    return _.map(ballots,function(ballot){
      return {
	"number": ballot.number,
	"candMention" : _.pick(ballot.candMention,filter)
      }
    })
  }
}

/* jugMaj détermine le classement à partir de votes de jugement */

exports.jugMaj = function(votes){
 
  var nb = votes.length;
  var sortedMention = ['insuf','passa','quitg','good','veryg'];
  var majMentions = {};
  var majScore = {};
  var cumulScore = {};
  
  var score = _.reduce(votes,function(res,vote){
    _.forEach(vote.candMention,function(mention,label){
      if(res[label]){
	res[label][mention] = (res[label][mention]||0) +vote.number;
	//chaque mention inférieur
	for(var i=0;i<=sortedMention.indexOf(mention);i++){
	  cumulScore[label][sortedMention[i]]=
	    (cumulScore[label][sortedMention[i]]||0)+vote.number;
	}

      }else{
	res[label] = {};
	res[label][mention] = vote.number;
	cumulScore[label] = {};
	
	for(var i=0;i<=sortedMention.indexOf(mention);i++){
	  cumulScore[label][sortedMention[i]] =vote.number;
	}
      }
    });
    return res;
  },{});

  var majMention = _.mapValues(cumulScore,function(cumulScr,label){
    for(var i = sortedMention.length-1;i>-1;i--){
      var mention = sortedMention[i];
      if(cumulScr[mention]>nb/2){
	majScore[label] = cumulScr[mention];
	return mention;
      }
    }
  })
  
  var sorted = Object.keys(majMention).sort(function(a,b){
    var rankA = sortedMention.indexOf(majMention[a]),
	rankB = sortedMention.indexOf(majMention[b])
    if(rankA == rankB){

      //si ce n'est pas la dernière mention "insuff"
      if(rankA != 0)
	return majScore[b] - majScore[a];
      else{
	return score[a][majMention[a]] - score[b][majMention[b]];
      }
	
    }else{
      return rankB -rankA;
    }
  });

  var ranked = _.mapValues(majMention,function(m,label){
    return sorted.indexOf(label)+1;
  })

  
  return {
    "ranked" : ranked,
    "scores" : [score],
    "cumulScore" : cumulScore,
    "majMention" : majMention,
    "sortedMention" : ['insuf','passa','quitg','good','veryg']
  }
}


/* majTurn sélectionne k vainceurs dans l'ordre à partir de billets de votes
   * avec un scrutin majoritaire (ne considère que les votes en tête de liste)
   * et rend les scores par candidats
   *  arguments :
   * - une liste de vote non vide (comme enregistrés dans la db)
   * - un entier k inférieur au nombre de candidats du vote
   */
var majTurn = function(votes,k){

  //on recupère une liste de candidats
  var candidats = _.clone(votes[0].prefList);
  var zeroPerCand = _.reduce(candidats,
                             (res,cand)=> {res[cand]=0;return res;},
                             {});
  
  var scorePerCand = _.reduce(votes,function(result,vote){

    //on ajoute le nb de vote au 1e candidat de chaque vote
    if(result[vote.prefList[0]])
      result[vote.prefList[0]] += vote.number;
    else
      result[vote.prefList[0]] = vote.number;
    
    return result;
  },{});
  //on initialise les scores à 0 de ceux sans vote
  scorePerCand = _.defaults(scorePerCand,zeroPerCand);
  
  var rankedCand = _.sortBy(candidats,(label)=> - scorePerCand[label]);

  return {
    "ranked" : rankedCand.slice(0,k),
    "scores" : scorePerCand
  };
};


/* simplifyVote simplifie une liste de vote
 * à l'aide d'une liste de vainqueurs
 * en supprimant les candidats perdants des votes
 * renvoye aussi le transfert des points ancien-nouveau
 * args : 
 * - une liste de votes à simplifier à n candidats
 * - une liste de m vainqueurs avec m<n.
 */

var simplifyVote = function(votes,winners){
  //tmp[0] nouveau vote sans les perdants par voteId
  //tmp[1] point transféré par couple ancien-nouveau candidats
  //sans les tranfert nul.
  var tmp = _.reduce(votes,function(res,vote){
    var oldCand = vote.prefList[0],
        newVoteList = _.intersection(vote.prefList,winners),
        newCand = newVoteList[0],
        newVoteId = newVoteList.join('-'),
        transfert = oldCand+'-'+newCand;
    //nouveau vote
    if(res[0][newVoteId])
      res[0][newVoteId].number += vote.number;
    else
      res[0][newVoteId] = {
        "number" : vote.number,
        "prefList" : newVoteList
      };
    //transfert 
    res[1][transfert] = (res[1][transfert]||0) + vote.number;
    
    return res;
  },[{},{}]);

  var voteById  = tmp[0],
      flux = tmp[1];

  return {
    "votes":_.map(voteById,(vote) => vote),
    "flux":flux
  };
}

/* majorityVote rend le score de chaque candidats lors 
 * d'un vote majoritaire pour chacun de ses tours.
 * args : 
 * - liste de vote
 * - une liste non vide strictement décroissante d'entiers
 *   représentant le nombre de vainqueurs à chaque tours
 *   elle se finit donc toujours par 1.
 *   ex : [1] -> vote majoritaire en 1 tour
 *        [2,1] -> vote majoritaire français
 *
 */

var majorityVote = function(votes,nbPerTurn){

  var aux = function(v,npt,scores,flux){
    if(npt.length == 0)
      return {
        "flux":flux.slice(0,flux.length-1),
        "ranked": [],
        "scores": scores
      };
    else{
      var k = npt.shift(),
          majTurnRes = majTurn(v,k),
          simplifyRes = simplifyVote(v,majTurnRes.ranked);
      
      scores.push(majTurnRes.scores);
      flux.push(simplifyRes.flux);
      return aux(simplifyRes.votes,npt,scores,flux);
    }
  };
  
  var result = (votes.length != 0)?
      aux(votes,nbPerTurn,[],[]):
      {
        "flux":  [],
        "ranked":[],
        "scores":[] 
      };

  //on pondère le score par rapport à son tour
  var weightedScore = _.map(result.scores,
                            (score,i) => _.mapValues(score,(v) => Math.pow(10,i)*v));

  var finalScore =
      _.reduce(
        _.flatMap(
          weightedScore,
          (score) => _.toPairs(score)),
        function(res,pair){
          res[pair[0]] = Math.max( (res[pair[0]]||0) ,pair[1]);
          return res;
        },{});
  
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - finalScore[label]);

    result.ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }
  
  return result;
};

},{}]},{},[1]);
