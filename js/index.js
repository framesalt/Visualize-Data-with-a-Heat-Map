d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', function(data){
  
  processData(data);
  
});

function processData(data){
  
  
  
  var canvasFrameWidth = 1250;
  var canvasFrameHeight = 600;
  var canvasSize = 400;
  
  
  
  
  var locDiffAbs = [];
  // make scale for diff colors and assign diff to objects in data  
  (function(){
    
  
  for ( var  i = 0; i < data.monthlyVariance.length; i++ ){
    data.monthlyVariance[i].diff = Math.abs(data.baseTemperature + data.monthlyVariance[i].variance);
    locDiffAbs.push(data.monthlyVariance[i].diff);
    
  }
  
  locDiffAbs.sort(function(a,b){
    return a>b ? 1 : a<b ? -1 : 0;
  });
  
  
  
  
  })();
  
  
  
  // from high to low temp
  var colors = [
    
    "#FF0000",
    "#FF1400",
    "#FF2800",
    "#FF3C00",
    "#FF5000",
    "#FF6400",
    "#FF7800",
    "#FF8C00",
    "#FFA000",
    "#FFB400",
    "#FFC800",
    "#FFDC00",
    "#FFF000"
    
  ];
  
  var rawMonths = [ 1,2,3,4,5,6,7,8,9,10,11,12  ];
  
  
  var scaleByMonthsAkaY = d3.scale.linear()
                              .domain([rawMonths[0], rawMonths[rawMonths.length-1]])
                               .range([0, (canvasSize - canvasSize/4) * 1.4]);
  
  var years = [];
  for (var i = 0; i < data.monthlyVariance.length; i++ )
    years.push(data.monthlyVariance[i].year);
  
  var scaleByYearsAkaX = d3.scale.linear()
                            .domain([years[0], years[years.length-1]])
                              .range([0, canvasSize]);
   
  var canvasFrame = d3.select('body')
                        .append('svg')
                          .style('margin', '20px')
                            .style('margin-top', '50px')
                             .attr('width', canvasFrameWidth)
                               .attr('height', canvasFrameHeight);
  // set radius and background-color
  (function(){
    
    canvasFrame.style('background-color', '#fff');
    
  })();
  
  
  var canvas = canvasFrame
                  .append('g')
                    .attr('transform', 'translate(80,140)');
  
  // background-color
  (function(){
    
    canvas.style('background-color', '#545353');
    
  })();
            
  var text = [
    'Monthly Global Land-Surface Temperature 1753 - 2015',
    'Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.',
    'Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07' ]
  
  // main text
  var introText = canvasFrame.append('g');
  
          introText.append('text').attr('transform', 'translate('+ ( canvasFrameWidth/3 + 200) + ',0)')
            .selectAll('tspan')
              .data(text)
                .enter()
                  .append('tspan')
                    .attr('x', 0)
                      .attr('dy', '1.2em').attr('font-size', function(d,i){return  i == 0 ? '2em': '1em'})
                        .attr('text-anchor', 'middle')
                         .text(function(d){ return d;});
  
  
  var tip = d3.tip()
                .attr('class', 'd3-tip')
                  .offset([-10,0])
                    .html(function(d){ return d.year + ' - ' + formatedMonths[d.month-1] + "<br>"+d.diff.toFixed(2) + ' &#8451;<br>' + d.variance + ' &#8451;';})
  
  var offsetForColors = locDiffAbs[locDiffAbs.length-1] / colors.length;
  var scaleBarColors = [];
  
  
  var tempBarWidth = canvasFrameWidth/2;
  var tempBarHeight = canvasFrameHeight/25;
  var tempBar = introText.append('g')
                           .attr('transform', 'translate(320, 85)' );
  
  // add texts and rects to tempBar
  (function(){
    
    var rectWidth = tempBarWidth / colors.length;
    var rectHeight = tempBarHeight;
    
  tempBar.selectAll('rect')
            .data(colors)
              .enter()
                .append('rect')
                  .attr('x', function(d,i){  return  rectWidth* i } )
                    .attr('width', rectWidth)
                      .attr('height', rectHeight)
                        .attr('fill', function(d){ return d;});
    
     
    var total = 0;

    var textWidth = rectWidth;
    var textHeight = rectHeight;
    tempBar.selectAll('text')
             .data(colors)
               .enter()
                 .append('text')
                   .attr('x', function(d,i){  return textWidth * i + 20; } )
                     .attr('y',function(){ return parseInt(textHeight + 20); })
                       .attr('width', textWidth)
                        .attr('text-anchor', 'middle')
                         .text( function(){ var tmp = total; scaleBarColors.push(total); total+=offsetForColors; return tmp == 0 ? tmp : tmp.toFixed(1);} );
  
    
    scaleBarColors.push(total);
    
  })();
   var scaleByColors = d3.scale.linear()
                          .domain([scaleBarColors[0], scaleBarColors[scaleBarColors.length-1]])
                            .range([0, scaleBarColors.length-1]);
  
  
  var nodesByYears = [];
  
  var current = [];
  
  
  var begin = data.monthlyVariance[0].year;
  for ( i = 0; i < data.monthlyVariance.length;  ){
    while(i < data.monthlyVariance.length && begin == data.monthlyVariance[i].year   )
      current.push(data.monthlyVariance[i++]);
  
    
    
    if ( i < data.monthlyVariance.length )
      begin = data.monthlyVariance[i].year;
    
    nodesByYears.push(current.slice());
  
    current.length = 0;
    
  }
  
  var cellHeight = canvasSize / nodesByYears[0].length;
  
  canvas.call(tip);
  
  var table = canvas.append('g').attr('transform', 'translate(10,0)')
                      .selectAll('g')
                        .data(nodesByYears)
                          .enter()
                           .append('g');
  
  table.selectAll('rect')
            .data(function(d){return d;})
              .enter()
                  .append('rect')
                    .attr('x', function(d, i){ return scaleByYearsAkaX(d.year)*2.8;})
                      .attr('y', function(d, i){ return scaleByMonthsAkaY(d.month)/1.15;})
                       .attr('width', canvasSize / nodesByYears.length*2.8)
                        .attr('height', cellHeight)
                          .attr('fill', function(d) { 
    //console.log('color scale: d.diff: ' + d.diff + '  index: ' + scaleByColors(d.diff));
    return colors[Math.floor(scaleByColors(d.diff))] })
                             .attr('key', function(d) { return 'year:' + d.year + "month"+d.month+'diff:'+d.diff; })
                              .on('mouseover', tip.show)
                               .on('mouseout', tip.hide);
  
  var formatedMonths = [ 'January'
                        ,'February'
                        ,'March'
                        ,'April'
                        ,'May'
                        ,'Jun'
                        ,'July'
                        ,'August'
                        ,'September'
                        ,'October'
                        ,'November'
                        ,'December'];
  var scaleByConvertedMonths = d3.scale.ordinal()
                                  .domain(formatedMonths)
                                    .rangePoints([0, canvasSize - 40]);
  
  var left = canvas.append('g');
  
      left.attr('transform', 'translate(5, 18)');
  
      left.transition()
           .duration(500)
            .call(d3.svg.axis()
                          .scale(scaleByConvertedMonths)
                            .orient('left')
                                .tickSize(0));
  
  
  var scaleByYears = d3.scale.linear()
                        .domain([years[0], years[years.length-1]])
                          .range([0, canvasSize * 2.81])
  
  var bottom = canvas.append('g');
  
  bottom.transition()
          .duration(500)
            .attr('transform', 'translate(0, ' + canvasSize + ')')
            .call(d3.svg.axis()
                          .scale(scaleByYears)
                              .orient('bottom')
                                .tickSize(0)
                                  .tickFormat(d3.format('d')));
  
 
  
}