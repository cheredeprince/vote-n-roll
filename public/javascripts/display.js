var Display = (function(){

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
  
  return {
    "changeSize" : changeSize,
    "setColors"  : setColors,
    "hist" : displayHist,
    "stackedBar": stackedBar,
    "score": displayScore,
    "maj"  : displayMajority,
    "setConf" : setConf
  };
})();
