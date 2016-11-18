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
var displayMajority = function(data,title){
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
    // nodes.sort(function(a,b) {
    //     return d3.descending(a.nodeValue, b.nodeValue)
    // });
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

  
  /*var win = window,
    doc = document,
    elt = doc.documentElement,
    body = doc.getElementsByTagName('body')[0],
    width = win.innerWidth || elt.clientWidth || body.clientWidth,
    height = win.innerHeight|| elt.clientHeight|| body.clientHeight;
  */
  
  var margin = {top: 30, right: 20, bottom:30, left:20},
      w = 1000 - margin.right - margin.left,
      h = 500 - margin.bottom - margin.top,
      gapratio = .7,
      delay = 500,
      padding = 15,
      x = d3.scale.ordinal()
      .domain(d3.range(data.length))
      .rangeBands([0, w + (w/(data.length-1))], gapratio),
      y = d3.scale.linear()
      .domain([0, maxv])
      .range([0, h - padding * maxn]),
      line = d3.svg.line()
      .interpolate('basis');
  
  // root
  var svg = d3.select("body")
      .append("svg:svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height",h + margin.top + margin.bottom);
  

     //title
  svg.append("text")
    .attr("x",(w/2))
    .attr("y", margin.top/2)
    .attr("text-anchor","middle")
    .style("font-size","15px")
    .text(title);
  
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
    var nodes = times.selectAll('g.node')
        .data(function(d) { return d })
        .enter().append('svg:g')
        .attr('class', 'node');
    
    setTimeout(function() {
      nodes.append('svg:rect')
        .attr('fill', 'steelblue')
        .attr('y', function(n, i) {
          return y(n.offsetValue) + i * padding;
        })
        .attr('width', x.rangeBand())
        .attr('height', function(n) { return y(n.nodeValue) })
        .append('svg:title')
        .text(function(n) { return n.nodeName });
    }, (first ? 0 : delay));
    
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
    var links = nodes.selectAll('path.link')
        .data(function(n) { return n.incoming || [] })
        .enter().append('svg:path')
        .attr('class', 'link')
        .style('stroke-width', function(l) { return y(l.value) })
        .attr('d', linkLine(true))
        .on('mouseover', function() {
          d3.select(this).attr('class', 'link on')
        })
        .on('mouseout', function() {
          d3.select(this).attr('class', 'link')
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
