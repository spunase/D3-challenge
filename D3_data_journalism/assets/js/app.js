// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(journalismData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(journalismData, d => d[chosenXAxis])*0.8,
        d3.max(journalismData, d => d[chosenXAxis])*1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(journalismData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(journalismData, d => d[chosenYAxis])*0.88,
      d3.max(journalismData, d => d[chosenYAxis])
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
}
  
  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    console.log("render circle", chosenXAxis, chosenYAxis);
    return circlesGroup;
  }
  // function used for updating state abbreviation group with a transition to
  // new circle positions
  function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
  }

  //function to style x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //poverty
  if (chosenXAxis === 'poverty') {
      return `${value}%`;
  }
  //age
  else if (chosenXAxis === 'age') {
      return `${value}`;
  }
   //income
  else if (chosenXAxis === 'income') {
    return `$${value}`;
  }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelX;
    if (chosenXAxis === "poverty") {
      labelX = "Poverty:";
    
    }
    else if (chosenXAxis === "age") {
      labelX = "Age:";
      
    }
    else if (chosenXAxis === "income") {
      labelX = "Income:";
    }

    var labelY;
  
    if (chosenYAxis === "healthcare") {
      labelY = "Health:";
    }
    else if(chosenYAxis === "smokes") {
      labelY = "Smokes:";
    }
    else if(chosenYAxis === "obesity") {
      labelY = "Obese:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([35, 80])                   // Show tool tips on the right of the circle
      .html(function(d) {
        return (`${d.state}<br>${labelX} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${labelY} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
      //  mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
      this.style.cursor='pointer';
      d3.select(this)
            .classed("active",true);   
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
        d3.select(this)
            .classed("inactive",true);   
      });
  
    return circlesGroup;
  }

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    // parse data
    data.forEach(function(journalismData) {
        journalismData.poverty = +journalismData.poverty;
        journalismData.age = +journalismData.age;
        journalismData.income = +journalismData.income;
        journalismData.healthcare = +journalismData.healthcare;
        journalismData.smokes = +journalismData.smokes;
        journalismData.obesity = +journalismData.obesity;
        
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
     
    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true)
        .attr("opacity", ".6");

    /* Create the text for each state circle */
    var textGroup = chartGroup.append('g')
      .selectAll('text')
      .data(data)
      .enter().append('text')
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("class","stateText")
      .attr('font-size',10)         // font size       
      .attr('dy',3)                //adjusts the text position so that it is vertically in the center of the circle 

    // Create group for three x-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    // Bonus additional X_axis labels in your scatter plot
    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)"); 

    //  Bonus additional x_axis
    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")     // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // append y axis
    // Create group for three y-axis labels
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", `translate(${0-margin.left}, ${height / 2})`);

        var healthLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 50)
        .attr("x", 0)
        .attr("value", "healthcare")     // value to grab for event listener
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)"); 

        var smokeLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30)
        .attr("x", 0)
        .attr("value", "smokes")     // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)"); 

        var obesityLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0)
        .attr("value", "obesity")     // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)"); 


        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      
        // x axis labels event listener
        labelsXGroup.selectAll("text")
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            
            if (value !== chosenXAxis) {
              
              // replaces chosenXAxis with value
              chosenXAxis = value;
              // functions here found above csv import
              // updates x scale for new data
              xLinearScale = xScale(data, chosenXAxis);
      
              // updates x axis with transition
              xAxis = renderXAxis(xLinearScale, xAxis);
      
              // updates circles with new x and y values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
              
              // updates state text with new x and y values
              textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      
              // changes classes to change bold text
              // for X Axis labels
              if (chosenXAxis === "poverty") {
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenXAxis === "age") {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                
              }
              else {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);

              }
            }
          });   
          
          // y axis labels event listener
          labelsYGroup.selectAll("text")
            .on("click", function() {
              // get value of selection
              var value = d3.select(this).attr("value");
             
              if (value !== chosenYAxis) {
                 
                // replaces chosenYAxis with value
                chosenYAxis = value;
                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);
        
                // updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
        
                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
                // updates state text with new x and y values
                textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis); 
                
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                // for Y Axis labels
                if (chosenYAxis === "healthcare") {
                  healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                  healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  
                }
                else {
                  healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
              }
            });  
      }).catch(function(error) {
        console.log(error);
      });

    