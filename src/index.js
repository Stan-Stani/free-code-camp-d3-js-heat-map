
// Define global variables
const WIDTH = 1366;
const HEIGHT = 768;
const PADDING = 20;

PLOT_WIDTH = WIDTH - PADDING;
PLOT_HEIGHT = HEIGHT - PADDING;

const xScale = d3.scaleTime();
xScale.range([PADDING, WIDTH - PADDING])

// input domain and range to yScale
const yScale = d3.scaleLinear([1, 12], [PADDING, PLOT_HEIGHT]);

const svgWrapper = d3.select('#svg-wrapper');

const state = {
    colorScaleIndex: 0
};



fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    {method: "GET", header: "Content-Type: application/json"}
)
    .then(res => res.json())
    .then(data => {
        
        let monthlyVariance = data.monthlyVariance

        let yearsObj = {};
        for (const element of monthlyVariance) {

            yearsObj[element.year] = element.year;
        }
        const yearCount = Object.keys(yearsObj).length;
        const heatMapElementWidth = WIDTH / yearCount;
        
        let xDomainStart = new Date(monthlyVariance[0].year, parseInt(monthlyVariance[0].month) - 1);
        let xDomainEnd = new Date(
            monthlyVariance[monthlyVariance.length - 1].year,
            parseInt(monthlyVariance[monthlyVariance.length - 1].month) - 1
        );

        xScale.domain([xDomainStart, xDomainEnd]);


        let coldestVariance = d3.min(monthlyVariance, element => element.variance);
        let hottestVariance = d3.max(monthlyVariance, element => element.variance);
        c({coldestVariance, hottestVariance})
        // { coldestVariance: -6.976, hottestVariance: 5.228 }
        let justVarianceArr = monthlyVariance.map(element => {
            return element.variance;
        })
        let colorPaletteArr = [
            d3.color('#005f73'),
            d3.color('#0a9396'), 
            d3.color('#94d2bd'), 
            d3.color('#e9d8a6'),
            d3.color('#ee9b00'),
            d3.color('#ca6702'),
            d3.color('#bb3e03'),
            d3.color('#ae2012'),
            d3.color('#9b2226')
        ];


        const colorScalesObj = {};
        colorScalesObj.quantile = d3.scaleQuantile();
        colorScalesObj.quantile.domain(justVarianceArr);
        colorScalesObj.quantile.range(colorPaletteArr);

        // c(colorScalesObj.quantile.quantiles())

        colorScalesObj.quantize = d3.scaleQuantize();
        colorScalesObj.quantize.domain([coldestVariance, hottestVariance]);
        colorScalesObj.quantize.range(colorPaletteArr);

        colorScalesArr = [
            colorScalesObj.quantile, 
            colorScalesObj.quantize
        ];
        
        

        svgWrapper
            .selectAll('rect')
            .data(data.monthlyVariance)
            .enter()
            .append('rect')
            .attr('width', heatMapElementWidth)
            .attr('height', '40')
            .attr('x', d => xScale(new Date(d.year, 0)))
            .attr('y', (d) => yScale(d.month))
            .attr('fill', d => {
                return colorScalesArr[state.colorScaleIndex](d.variance).formatHex();
                // Not an arrow function because vanilla anon will
                // get 'this' initialized to dom element event is happening on
            })
            .attr('class', 'datum-rect')
            .on('mouseover', function(e, d) {
                datumOutline.attr('x', this.getAttribute('x'))
                datumOutline.attr('y', this.getAttribute('y'))
                datumOutline.attr('style', 'visibility: visible;')
                datumOutline.attr('stroke', (invertColorHexCode(this.getAttribute('fill'))));

                tooltip.select('text')
                .text(JSON.stringify(d))

                tooltip
                    .attr('style', `transform: translate(0px,
                         ${parseInt(yScale(d.month)) + 
                            parseInt(tooltip.select('#tooltip-rect').attr('height'))}px);`
                         )
        
            })


        tooltip = buildTooltipScaffold();

       let [button] = [...buildButtons()];

        button.on('mouseup', (e) => {

            state.colorScaleIndex++;
            (state.colorScaleIndex > colorScalesArr.length - 1) ? state.colorScaleIndex = 0 : null;

            svgWrapper
                .selectAll('rect')
                .data(data.monthlyVariance)
                .attr('x', d => xScale(new Date(d.year, 0)))
                .attr('y', (d) => yScale(d.month))
                .attr('fill', d => {
                    return colorScalesArr[state.colorScaleIndex](d.variance).formatHex()
                })
        });

        
        let datumOutline = buildDatumOutline()

        buildAxes();
    })




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
    let nextColorScaleButton = 
    svgWrapper
        .append('g')
            .attr('id', 'next-color-scale-button')
            .attr('class', 'svg-rect-button')
        
    nextColorScaleButton
        .attr('style', `transform: translate(${WIDTH - PADDING - 30}px, 30px`)
    
    nextColorScaleButton
        .append('rect')
            .attr('rx', '.75%')
            .attr('ry', '.75%')
            .attr('width', '60')
            .attr('height', '30')

    nextColorScaleButton
        .append('text')
            .text('hello')
            .attr('x', '0')
            .attr('y', '15')
    
    return [nextColorScaleButton];
}

function buildAxes() {

    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(d3.timeYear.every(15))
    svgWrapper.append('g')
        .attr('id', 'x-axis')
        .attr('style', `transform: translate(0px, ${HEIGHT - PADDING / 2}px;`)
        .call(xAxis)

    let yAxis = d3.axisLeft(yScale)
        .tickSizeInner(3);
    svgWrapper.append('g')
        .attr('id', 'y-axis')
        .attr('style', `transform: translate(${PADDING * .80}px, 0px);`)
        .call(yAxis)
    
        
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

function invertColorHexCode(str) {
    str = str.slice(1);
    let origColorInt = Number('0x' + str)
    let largestColorInt = 0xFFFFFF;

    let invertedColorInt = largestColorInt - origColorInt;
    invertedColorCode = invertedColorInt.toString(16);

    invertedColorCode = '#' + invertedColorCode;

    return invertedColorCode;
    
    

}




// utility functions
function c(...input) {
    console.log(...input);
}
