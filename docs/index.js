// TODO: Revert datum highlighting to black stroke
// TODO: Correctly align highlighting rect to hovered datum
// TODO: Clean up top axis first and last ticks, etc.
// TODO: Hide outline when mouse out
// TODO: Don't round tickValues so much!!!
// TODO: Fix quantize legend colors
// TODO: Change legend color lengths when scale type changes?

// Define global variables
const WIDTH = 1366;
const HEIGHT = 768;
const PADDING = 25;
const BOTTOM_PADDING = 75;

const PLOT_WIDTH = WIDTH - PADDING;
const PLOT_HEIGHT = HEIGHT - BOTTOM_PADDING;

const LEGEND_X = PADDING;
const LEGEND_Y = PLOT_HEIGHT + PADDING / 2;
var legendLength = 300;
const INITIAL_LEGEND_LENGTH = legendLength;
const LEGEND_RECT_HEIGHT = 10;


// input domain and range to yScale
// Domain is one extra element so there is exactly enough space for all elements
const yScale = d3.scaleLinear([1, 13], [PADDING, PLOT_HEIGHT]);


const DATUM_HEIGHT = yScale(2) - PADDING;
let datumWidth;

const svgWrapper = d3.select('#svg-wrapper')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

const state = {
    colorScaleIndex: 0,
    paletteIndex: 0
};



fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    {method: "GET", header: "Content-Type: application/json"}
)
    .then(res => res.json())
    .then(data => {
        
        let baseTemperature = parseFloat(data.baseTemperature);
            data = data.monthlyVariance.map(e => {
                return {
                    year: e.year,
                    month: e.month,
                    temp: parseFloat(e.variance) + baseTemperature
                }
            });


       let [
            xScale, 
            yScale, 
            legendScaleObj, 
            colorScalesArr, 
            palettesArr
        ] = [...buildScales(data)];

        let dataGroup = svgWrapper.append('g')
            .attr('class', 'data-group')

        dataGroup
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', datumWidth)
            .attr('height', DATUM_HEIGHT)
            .attr('x', d => xScale(new Date(d.year, 0)))
            .attr('y', (d) => yScale(d.month))
            .attr('fill', d => {
                return colorScalesArr[state.colorScaleIndex](d.temp).formatHex();
                // Not an arrow function because vanilla anon will
                // get 'this' initialized to dom element event is happening on
            })
            .attr('class', 'datum-rect')
            .on('mouseover', function(e, d) {
                datumOutline.attr('x', this.getAttribute('x'))
                datumOutline.attr('y', this.getAttribute('y'))
                datumOutline.attr('style', 'visibility: visible;')
                datumOutline.attr('stroke', 'black');


                tooltip.select('text')
                .text(JSON.stringify(d))

                tooltip
                    .attr('style', `transform: translate(0px,
                         ${parseInt(yScale(d.month)) + 
                            parseInt(tooltip.select('#tooltip-rect').attr('height'))}px);`
                         )
        
            })


        tooltip = buildTooltipScaffold();

       

       handleButtonClicks(...buildButtons());

        
        let datumOutline = buildDatumOutline()

        buildAxes(xScale, yScale, legendScaleObj);




        function handleButtonClicks(cycleScaleTypeButton, cyclePaletteButton) {
            cycleScaleTypeButton.on('mouseup', (e) => {
        
                state.colorScaleIndex++;
                (state.colorScaleIndex > colorScalesArr.length - 1) ? state.colorScaleIndex = 0 : null;
        
                dataGroup
                    .selectAll('rect')
                    .data(data)
                    .attr('x', d => xScale(new Date(d.year, 0)))
                    .attr('y', (d) => yScale(d.month))
                    .attr('fill', d => {
                        return colorScalesArr[state.colorScaleIndex](d.temp).formatHex();
                    })

                rebuildLegend(true);
            });
        
            cyclePaletteButton.on('mouseup', e => {
                state.paletteIndex++;
                (state.paletteIndex > palettesArr.length - 1) ? state.paletteIndex = 0 : null;
        
                colorScalesArr.forEach(scale => {
                    scale.range(palettesArr[state.paletteIndex].colors);
                })
        
                dataGroup
                .selectAll('rect')
                .data(data)
                .attr('x', d => xScale(new Date(d.year, 0)))
                .attr('y', (d) => yScale(d.month))
                .attr('fill', d => {
                    return colorScalesArr[state.colorScaleIndex](d.temp).formatHex();
                })

                
                rebuildLegend();

            })

            function rebuildLegend(hasColorScaleChanged) {
                let legend = svgWrapper.select('#legend')
                let newColorLengths = getColorLengths(colorScalesArr);
                legendScaleObj.colorLengths = newColorLengths;
                if (hasColorScaleChanged === true) {
                   
                    // if scale is quantile, adjust legend length
                    if (state.colorScaleIndex === 1) {
                        
                        legendScaleObj.legendScale.range([0, legendLength = INITIAL_LEGEND_LENGTH * 4]);
                    } else {
                        legendScaleObj.legendScale.range([0, legendLength = INITIAL_LEGEND_LENGTH]);
                    }
                    
                    svgWrapper.select('#legend-axis').remove();
                    buildLegendAxis(legendScaleObj);

                    legend
                        .selectAll('rect')
                        .data(newColorLengths)
                            .attr('x', d => {
                                return legendScaleObj.legendScale(d[0]);
                            })
                            .attr('fill', d => {
                                return generateLegendFill(d, colorScalesArr, state.colorScaleIndex);
                            })
                            .attr('width',  d => getWidth(d, newColorLengths))

                    
                    
                } else {
                    legend
                        .selectAll('rect')
                        .data(legendScaleObj.colorLengths)
                            .attr('fill', d => {
                                return generateLegendFill(d, colorScalesArr, state.colorScaleIndex);
                            })
                }
        
            }
        }
    })

function buildScales(data) {
    const xScale = d3.scaleTime();
    xScale.range([PADDING, WIDTH - PADDING])




    let monthlyVariance = data
    let yearsObj = {};
    for (const element of monthlyVariance) {

        yearsObj[element.year] = element.year;
    }
    const yearCount = Object.keys(yearsObj).length;
    datumWidth = WIDTH / yearCount;
    
    let xDomainStart = new Date(monthlyVariance[0].year, parseInt(monthlyVariance[0].month) - 1);
    let xDomainEnd = new Date(
        monthlyVariance[monthlyVariance.length - 1].year,
        parseInt(monthlyVariance[monthlyVariance.length - 1].month) - 1
    );

    xScale.domain([xDomainStart, xDomainEnd]);


    let coldestVariance = d3.min(monthlyVariance, element => element.temp);
    let hottestVariance = d3.max(monthlyVariance, element => element.temp);

    let justVarianceArr = monthlyVariance.map(element => {
        return element.temp;
    })

    let palettesArr = [
        {
            name: "Stan's Palette",
            colors: [
                d3.color('#004352'),
                d3.color('#005f73'),
                d3.color('#0a9396'), 
                d3.color('#94d2bd'), 
                d3.color('#e9d8a6'),
                d3.color('#ee9b00'),
                d3.color('#ca6702'),
                d3.color('#bb3e03'),
                d3.color('#ae2012'),
                d3.color('#9b2226'),
                d3.color('#7a292c')
            ]
        },
        {   name: "freeCodeCamp's Palette",
            colors: [
                '#a50026',
                '#d73027',
                '#f46d43',
                '#fdae61',
                '#fee090',
                '#ffffbf',
                '#e0f3f8',
                '#abd9e9',
                '#74add1',
                '#4575b4',
                '#313695'
            ].map(element => d3.color(element)).reverse()
        }
    ]

    
    let colorScalesArr = [
        d3.scaleQuantize()
            .domain([coldestVariance, hottestVariance])
            .range(palettesArr[state.paletteIndex].colors), 
        d3.scaleQuantile()
            .domain(justVarianceArr)
            .range(palettesArr[state.paletteIndex].colors),
    ];


    let colorLengths = getColorLengths(colorScalesArr);
    


    let legendScale = d3.scaleLinear()
        .domain(colorScalesArr[state.colorScaleIndex].domain())
        .range([0, legendLength])

    let legend = svgWrapper.append('g')
        .attr('id', 'legend')
    legend
        .selectAll('rect')
        .data(colorLengths)
        .enter()
        .append('rect')
            .attr('x', d => legendScale(d[0]))
            .attr('style', `transform: translate(${LEGEND_X}px, ${LEGEND_Y}px);`)
            .attr('width',  d => getWidth(d, colorLengths))
            .attr('height', LEGEND_RECT_HEIGHT)
            .attr('fill', (d) => generateLegendFill(d, colorScalesArr, state.colorScaleIndex))



        
    let legendScaleObj = {legendScale, colorLengths};

    return [xScale, yScale, legendScaleObj, colorScalesArr, palettesArr];
    
    
}

function getColorLengths(colorScalesArr) {
    let colorScaleRange = colorScalesArr[state.colorScaleIndex].range();
    let colorLengths = colorScaleRange.map((color, index) => {
        return colorScalesArr[state.colorScaleIndex].invertExtent(color);
    });

    return colorLengths;
}

function getWidth(d, colorLengths) {
    let degreesPerColor = d[1] - d[0];
    // Removing space between 0 and color start by subtracting colorLengths[0][0]
    let highestDegreePerColor = colorLengths[colorLengths.length - 1][1] - colorLengths[0][0];
    let percentage = degreesPerColor / highestDegreePerColor;
    let colorsWidthInScale = legendLength * percentage;

    return(colorsWidthInScale);
}

function generateLegendFill(d, colorScalesArr, colorScaleIndex) {
    return colorScalesArr[colorScaleIndex](d[0]).formatHex()
}

function buildAxes(xScale, yScale, legendScaleObj) {

    let axesObj = {};


    let xAxis = d3.axisTop(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(d3.timeYear.every(15))
    svgWrapper.append('g')
        .attr('id', 'x-axis')
        // Set x such that ticks are aligned with middle of each datum
        .attr('style', `transform: translate(${datumWidth / 2}px, ${PADDING - 3}px);`)
        .call(xAxis)

        axesObj.xAxis = xAxis;

    // Build 12 element scale for 12 ticks
    // And make total height of axis 1/12 less than total height of datum heights
    // So space between axis ticks is same as height of datum
    const yAxisScale = d3.scaleLinear([1, 12], [PADDING, PLOT_HEIGHT * 11/12]);
    
    let yAxis = d3.axisLeft(yAxisScale)
        .tickSizeInner(3)
        .tickFormat(d => {
            let monthArr = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
            return monthArr[d - 1];
        })
        .tickSize(0)
        .tickPadding(0)
        
    

    let yAxisGroup = svgWrapper.append('g')
        .attr('id', 'y-axis')
        // Set y such that ticks are aligned with middle of each datum
        .attr('style', `transform: translate(${PADDING * .8}px, ${DATUM_HEIGHT / 2}px);`)
        .call(yAxis)
    
    // remove axis line itself, leaving only labels
    yAxisGroup.select('path').remove();

    axesObj.yAxis = yAxis;
    
    axesObj.legendAxis = buildLegendAxis(legendScaleObj);


    return axesObj;

}

function buildLegendAxis(legendScaleObj) {
    let colorLengths = legendScaleObj.colorLengths;

    let tickValuesArr = colorLengths.map((element) => element[0]);
    // Only 11 colors but need 12 ticks so using final part of final color for last tick
    tickValuesArr.push(colorLengths[colorLengths.length - 1][1])

    
    let legendAxis = d3.axisBottom(legendScaleObj.legendScale)
        .tickValues(tickValuesArr)
        .tickArguments([tickValuesArr.length, ".1f"])
        
    
        
    svgWrapper.append('g')
        .attr('id', 'legend-axis')
        .attr('style', `transform: translate(${LEGEND_X}px,
                ${LEGEND_Y + LEGEND_RECT_HEIGHT}px);`)
        .call(legendAxis)


    // If scale is quantile, adjust tick lengths
    if (state.colorScaleIndex === 1) {
                        
        
        let oddElements = svgWrapper
            .select('#legend-axis')
            .selectAll('.tick:nth-child(odd)');

        oddElements
            .selectAll('line')
                .attr('y2', function(d) {
                    let currentTickLength = parseFloat(this.getAttribute('y2'));
                    return 20;
                });

        oddElements
            .selectAll('text')
                .attr('y', function(d) {
                    let currentY = parseFloat(this.getAttribute('y'));
                    return 2.5 * currentY;
                })
    }

        return legendAxis;
}

function buildTooltipScaffold() {
    let tooltip = svgWrapper
        .append('g')
        .attr('id', 'tooltip')
    
    let tooltipRect = tooltip
        .append('rect')
        .attr('id', 'tooltip-rect')
        .attr('rx', '.75%')
        .attr('ry', '.75%')
        .attr('width', '400')
        .attr('height', '100')
    
    tooltip
        .append('text')
        .text('hello')
        .attr('x', '0')
        .attr('y', '32')
        

    return tooltip;
}

function buildButtons() {
    let cycleScaleTypeButton = 
    svgWrapper
        .append('g')
            .attr('id', 'cycle-scale-type-button')
            .attr('class', 'svg-rect-button')
        
    cycleScaleTypeButton
        .attr('style', `transform: translate(${WIDTH - PADDING - 30}px, 30px`)
    
    cycleScaleTypeButton
        .append('rect')
            .attr('rx', '.75%')
            .attr('ry', '.75%')
            .attr('width', '60')
            .attr('height', '30')

    cycleScaleTypeButton
        .append('text')
            .text('scale type')
            .attr('x', '0')
            .attr('y', '15')

    
    let cyclePaletteButton =
        svgWrapper.append('g')
            .attr('id', 'cycle-scale-type-button')
            .attr('class', 'svg-rect-button')
            
    cyclePaletteButton
        .attr('style', `transform: translate(${WIDTH - PADDING - 90}px, 30px`)

    cyclePaletteButton
        .append('rect')
            .attr('rx', '.75%')
            .attr('ry', '.75%')
            .attr('width', '60')
            .attr('height', '30')

    cyclePaletteButton
        .append('text')
            .text('palette')
            .attr('x', '0')
            .attr('y', '15')

    return [cycleScaleTypeButton, cyclePaletteButton];
}





function buildDatumOutline() {
    let datumRect = svgWrapper.select('.datum-rect');
    let outlineRect = svgWrapper.append('rect');

    outlineRect
        .attr('width', datumRect.attr('width') - 1)
        .attr('height', datumRect.attr('height') - 1)
        .attr('stroke', 'black')
        .attr('stroke-width', '1')
        .attr('fill', 'none')
        .attr('style', 'visibility: hidden;')

    
    return outlineRect;
}






// utility functions
function p(...input) {
    console.log(...input);
}
