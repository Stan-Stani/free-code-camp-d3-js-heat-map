# D3.js Heat Map

This heat-map allows the user to
* hover over specific cells for more information
* toggle between 3 color palettes
* toggle between a quantize scale and a quantile scale

In addition to the map's cells changing color based on the button presses,
 the legend dynamically changes.

## Tooltip

The Tooltip is implemented by means of a JavaScript class and is written to be
easily reuseable in other D3 projects. Below see the configuration object 
settings. Many of the properties are optional.


```
let tooltip = new Tooltip({
    // containing element's width
    containerWidth: 100,

    // containing element's height
    containerHeight: 100,

    // desired tooltip internal padding
    paddingHorizontal: 20,
    paddingVertical: 15,

    // time it will take for tooltip to disappear on cell mouse-out
    timeoutDurationInMs: 2000
});
```



``.addTextElement(id)`` allows easy adding of text lines and adds vertical space to the 
tooltip accordingly.

``.setTextElement(id, textValue)`` sets text of course, and resizes the produced tooltip to fit the text
based on all set text. This method will also add a text element via ``addTextElement(id)``
if the entered id does not correspond to an existing text element.

``.setPos(x, y, isHorizontallyCenteredOnPoint=false)`` allows for the tooltip
to be centered horizontally on, or have its origin placed at, the given x and y points, unless
so placing the tooltip would place it outside the given ``containerWidth`` and
``containerHeight`` that were entered in the config when the class object was 
initialized. This method will keep the tooltip entirely inside those given dimensions.
